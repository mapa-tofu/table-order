import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useSSE } from '../common/SSEProvider';
import { useAuthStore } from '../stores/authStore';
import styles from './OrderDashboard.module.css';

interface OrderData {
  id: string;
  tableId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items?: Array<{ menuName: string; quantity: number }>;
}

const STATUS_LABELS: Record<string, string> = {
  pending: '대기중',
  preparing: '준비중',
  completed: '완료',
};

export default function OrderDashboard() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const fetchOrders = async () => {
    try {
      const res = await apiClient.get('/admin/orders');
      setOrders(res.data.data);
    } catch {
      // handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleOrderCreated = useCallback((data: unknown) => {
    const event = data as { payload: { order: OrderData } };
    setOrders((prev) => [event.payload.order, ...prev]);
  }, []);

  const handleStatusChanged = useCallback((data: unknown) => {
    const event = data as { payload: { orderId: string; newStatus: string } };
    setOrders((prev) =>
      prev.map((o) => o.id === event.payload.orderId ? { ...o, status: event.payload.newStatus } : o),
    );
  }, []);

  const handleOrderDeleted = useCallback((data: unknown) => {
    const event = data as { payload: { deletedOrderId: string } };
    setOrders((prev) => prev.filter((o) => o.id !== event.payload.deletedOrderId));
  }, []);

  useSSE('order:created', handleOrderCreated);
  useSSE('order:statusChanged', handleStatusChanged);
  useSSE('order:deleted', handleOrderDeleted);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await apiClient.patch(`/admin/orders/${orderId}/status`, { status });
    } catch {
      alert('상태 변경에 실패했습니다');
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('이 주문을 삭제하시겠습니까?')) return;
    try {
      await apiClient.delete(`/admin/orders/${orderId}`);
    } catch {
      alert('주문 삭제에 실패했습니다');
    }
  };

  if (isLoading) return <div className={styles.loading}>주문을 불러오는 중...</div>;

  return (
    <div className={styles.container} data-testid="order-dashboard">
      <header className={styles.header}>
        <h1>주문 대시보드</h1>
        <nav className={styles.nav}>
          <button onClick={() => navigate('/admin/tables')}>테이블</button>
          <button onClick={() => navigate('/admin/menus')}>메뉴</button>
          <button onClick={() => { logout(); navigate('/admin/login'); }}>로그아웃</button>
        </nav>
      </header>

      {orders.length === 0 ? (
        <p className={styles.empty}>현재 주문이 없습니다</p>
      ) : (
        <div className={styles.orderGrid}>
          {orders.map((order) => (
            <div
              key={order.id}
              className={`${styles.orderCard} ${order.status === 'pending' ? styles.newOrder : ''}`}
              data-testid={`admin-order-${order.id}`}
            >
              <div className={styles.cardHeader}>
                <span className={styles.orderNumber}>#{order.id.slice(0, 8)}</span>
                <span className={`${styles.status} ${styles[order.status]}`}>
                  {STATUS_LABELS[order.status]}
                </span>
              </div>
              <div className={styles.cardBody}>
                <p className={styles.amount}>{order.totalAmount.toLocaleString()}원</p>
                <p className={styles.time}>{new Date(order.createdAt).toLocaleTimeString('ko-KR')}</p>
                {order.items && (
                  <ul className={styles.itemPreview}>
                    {order.items.slice(0, 3).map((item, idx) => (
                      <li key={idx}>{item.menuName} ×{item.quantity}</li>
                    ))}
                    {order.items.length > 3 && <li>외 {order.items.length - 3}건</li>}
                  </ul>
                )}
              </div>
              <div className={styles.cardActions}>
                {order.status !== 'pending' && (
                  <button onClick={() => updateStatus(order.id, 'pending')}>대기</button>
                )}
                {order.status !== 'preparing' && (
                  <button onClick={() => updateStatus(order.id, 'preparing')}>준비</button>
                )}
                {order.status !== 'completed' && (
                  <button onClick={() => updateStatus(order.id, 'completed')}>완료</button>
                )}
                <button className={styles.deleteButton} onClick={() => deleteOrder(order.id)}>삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
