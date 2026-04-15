import { Response } from 'express';
import { logger } from '../utils/logger';
import type { SSEEvent } from '@shared/types';

interface SSEClient {
  storeId: string;
  tableId?: string;
  type: 'customer' | 'admin';
  response: Response;
  lastEventId: number;
}

interface BufferedEvent {
  id: number;
  storeId: string;
  event: SSEEvent;
  createdAt: Date;
}

const BUFFER_MAX_SIZE = 100; // 매장당 최대 버퍼 크기
const BUFFER_EXPIRY_MS = 5 * 60 * 1000; // 5분

class SSEManager {
  private clients = new Map<string, SSEClient>();
  private eventBuffers = new Map<string, BufferedEvent[]>(); // storeId → events
  private eventCounter = 0;

  // 클라이언트 등록
  addClient(
    clientId: string,
    storeId: string,
    type: 'customer' | 'admin',
    tableId: string | undefined,
    response: Response,
    lastEventId?: number,
  ): void {
    // SSE 헤더 설정
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    this.clients.set(clientId, {
      storeId,
      tableId,
      type,
      response,
      lastEventId: lastEventId || 0,
    });

    // 놓친 이벤트 재전송
    if (lastEventId) {
      this.replayEvents(storeId, lastEventId, response);
    }

    // 연결 종료 시 자동 제거
    response.on('close', () => {
      this.removeClient(clientId);
    });

    logger.info('SSE 클라이언트 연결', { clientId, storeId, type, tableId });
  }

  // 클라이언트 제거
  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      this.clients.delete(clientId);
      logger.info('SSE 클라이언트 연결 해제', { clientId });
    }
  }

  // 매장 전체 브로드캐스트
  broadcastToStore(storeId: string, event: SSEEvent): void {
    const eventId = this.bufferEvent(storeId, event);

    for (const [, client] of this.clients) {
      if (client.storeId === storeId) {
        this.sendEvent(client.response, event, eventId);
      }
    }
  }

  // 특정 테이블에 전송
  sendToTable(storeId: string, tableId: string, event: SSEEvent): void {
    for (const [, client] of this.clients) {
      if (client.storeId === storeId && client.tableId === tableId) {
        this.sendEvent(client.response, event, this.eventCounter);
      }
    }
  }

  // 연결된 클라이언트 수
  getClientCount(): number {
    return this.clients.size;
  }

  // 매장별 클라이언트 수
  getStoreClientCount(storeId: string): number {
    let count = 0;
    for (const [, client] of this.clients) {
      if (client.storeId === storeId) count++;
    }
    return count;
  }

  // 이벤트 버퍼링
  private bufferEvent(storeId: string, event: SSEEvent): number {
    const eventId = ++this.eventCounter;
    const buffer = this.eventBuffers.get(storeId) || [];

    buffer.push({
      id: eventId,
      storeId,
      event,
      createdAt: new Date(),
    });

    // 만료된 이벤트 제거
    const now = Date.now();
    const filtered = buffer.filter((e) => now - e.createdAt.getTime() < BUFFER_EXPIRY_MS);

    // 최대 크기 제한
    const trimmed = filtered.length > BUFFER_MAX_SIZE
      ? filtered.slice(filtered.length - BUFFER_MAX_SIZE)
      : filtered;

    this.eventBuffers.set(storeId, trimmed);

    return eventId;
  }

  // 놓친 이벤트 재전송
  private replayEvents(storeId: string, lastEventId: number, response: Response): void {
    const buffer = this.eventBuffers.get(storeId) || [];
    const missedEvents = buffer.filter((e) => e.id > lastEventId);

    for (const buffered of missedEvents) {
      this.sendEvent(response, buffered.event, buffered.id);
    }

    if (missedEvents.length > 0) {
      logger.info('놓친 이벤트 재전송', { storeId, count: missedEvents.length });
    }
  }

  // SSE 이벤트 전송
  private sendEvent(response: Response, event: SSEEvent, eventId: number): void {
    try {
      response.write(`id: ${eventId}\n`);
      response.write(`event: ${event.type}\n`);
      response.write(`data: ${JSON.stringify(event)}\n\n`);
    } catch (error) {
      logger.error('SSE 이벤트 전송 실패', { error });
    }
  }
}

export default new SSEManager();
