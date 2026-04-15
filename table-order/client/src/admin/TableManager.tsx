import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import styles from './TableManager.module.css';

interface TableSummaryData {
  id: string;
  tableNumber: number;
  activeSession?: {
    id: string;
    startedAt: string;
    totalAmount: number;
    orderCount: number;
  };
}

interface HistoryData {
  id: string;
  orderNumber: string;
  totalAmount: number;
  items: Array<{ menuName: string; quantity: number; subtotal: number }>;
  orderedAt: string;
  completedAt: string;
}

export default function TableManager() {
  const [tables, setTables] = useState<TableSummaryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [password, setPassword] = useState('');
  const [setupError, setSetupError] = useState('');
  const [historyTableId, setHistoryTableId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryData[]>([]);
  const navigate = useNavigate();

  const fetchTables = async () => {
    try {
      const res = await apiClient.get('/admin/tables/summary');
      setTables(res.data.data);
    } catch { /* handled */ } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchTables(); }, []);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError('');
    try {
      await apiClient.post('/admin/tables/setup', {
        tableNumber: parseInt(tableNumber, 10),
        password,
      });
      setShowSetup(false);
      setTableNumber('');
      setPassword('');
      fetchTables();
    } catch (err: any) {
      setSetupError(err.response?.data?.error?.message || '테이블 생성에 실패했습니다');
    }
  };

  const handleComplete = async (tableId: string, sessionId: string) => {
    if (!confirm('이용 완료 처리하시겠습니까?')) return;
    try {
      await apiClient.post(`/admin/tables/${tableId}/complete`, { sessionId });
      fetchTables();
    } catch {
      alert('이용 완료 처리에 실패했습니다');
    }
  };

  const showHistory = async (tableId: string) => {
    try {
      const res = await apiClient.get(`/admin/tables/${tableId}/history`);
      setHistory(res.data.data);
      setHistoryTableId(tableId);
    } catch {
      alert('이력 조회에 실패했습니다');
    }
  };

  if (isLoading) return <div className={styles.loading}>테이블 정보를 불러오는 중...</div>;

  return (
    <div className={styles.container} data-testid="table-manager">
      <header className={styles.header}>
        <button onClick={() => navigate('/admin/dashboard')} aria-label="뒤로가기">←</button>
        <h1>테이블 관리</h1>
        <button onClick={() => setShowSetup(!showSetup)} className={styles.addButton}>+ 추가</button>
      </header>

      {showSetup && (
        <form onSubmit={handleSetup} className={styles.setupForm} data-testid="table-setup-form">
          <input type="number" min="1" placeholder="테이블 번호" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} required />
          <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {setupError && <p className={styles.error}>{setupError}</p>}
          <button type="submit">생성</button>
        </form>
      )}

      <div className={styles.tableGrid}>
        {tables.map((table) => (
          <div key={table.id} className={styles.tableCard} data-testid={`table-${table.tableNumber}`}>
            <h3>테이블 {table.tableNumber}</h3>
            {table.activeSession ? (
              <>
                <p className={styles.sessionInfo}>
                  주문 {table.activeSession.orderCount}건 · {table.activeSession.totalAmount.toLocaleString()}원
                </p>
                <div className={styles.actions}>
                  <button onClick={() => handleComplete(table.id, table.activeSession!.id)}>이용 완료</button>
                  <button onClick={() => showHistory(table.id)}>과거 내역</button>
                </div>
              </>
            ) : (
              <>
                <p className={styles.inactive}>비어있음</p>
                <button onClick={() => showHistory(table.id)} className={styles.historyButton}>과거 내역</button>
              </>
            )}
          </div>
        ))}
      </div>

      {historyTableId && (
        <div className={styles.modal} role="dialog" aria-label="과거 주문 내역">
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>과거 주문 내역</h2>
              <button onClick={() => setHistoryTableId(null)}>닫기</button>
            </div>
            {history.length === 0 ? (
              <p className={styles.empty}>내역이 없습니다</p>
            ) : (
              <ul className={styles.historyList}>
                {history.map((h) => (
                  <li key={h.id}>
                    <div>#{h.orderNumber.slice(0, 8)} — {h.totalAmount.toLocaleString()}원</div>
                    <div className={styles.historyTime}>
                      주문: {new Date(h.orderedAt).toLocaleString('ko-KR')} · 완료: {new Date(h.completedAt).toLocaleString('ko-KR')}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
