import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useSSE } from '../common/SSEProvider';
import styles from './OrderHistory.module.css';

interface OrderData {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: Array<{ menuName: string; quantity: number; subtotal: number }>;
}

const STATUS_LABELS: Record<string, string> = {
  pending: '대기중',
  preparing: '준비중',
  completed: '완료',
};

export default function OrderHistory() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await apiClient.get('/customer/orders');
        setOrders(res.data.data);
      } catch {
        // handled by interceptor
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = useCallback((data: unknown) => {
    const event = data as { payload: { orderId: string; newStatus: string } };
    setOrders((prev) =>
      prev.map((o) =>
        o.id === event.payload.orderId ? { ...o, status: event.payload.newStatus } : o,
      ),
    );
  }, []);

  const handleOrderDeleted = useCallback((data: unknown) => {
    const event = data as { payload: { deletedOrderId: string } };
    setOrders((prev) => prev.filter((o) => o.id !== event.payload.deletedOrderId));
  }, []);

  useSSE('order:statusChanged', handleStatusChange);
  useSSE('order:deleted', handleOrderDeleted);

  if (isLoading) return <div className={styles.loading}>주문 내역을 불러오는 중...</div>;

  return (
    <div className={styles.container} data-testid="order-history">
      <header className={styles.header}>
        <button onClick={() => navigate(-1)} aria-label="뒤로가기">←</button>
        <h1>주문 내역</h1>
      </header>

      {orders.length === 0 ? (
        <p className={styles.empty}>주문 내역이 없습니다</p>
      ) : (
        <ul className={styles.orderList}>
          {orders.map((order) => (
            <li key={order.id} className={styles.orderCard} data-testid={`order-${order.id}`}>
              <div className={styles.orderHeader}>
                <span className={styles.orderNumber}>#{order.id.slice(0, 8)}</span>
                <span className={`${styles.status} ${styles[order.status]}`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
              <div className={styles.orderTime}>
                {new Date(order.createdAt).toLocaleTimeString('ko-KR')}
              </div>
              <ul className={styles.itemList}>
                {order.items?.map((item, idx) => (
                  <li key={idx}>
                    {item.menuName} × {item.quantity} — {item.subtotal.toLocaleString()}원
                  </li>
                ))}
              </ul>
              <div className={styles.orderTotal}>
                {order.totalAmount.toLocaleString()}원
              </div>
            </li>
          ))}
        </ul>
      )}

      <nav className={styles.bottomNav}>
        <button onClick={() => navigate('/customer/menu')}>메뉴</button>
        <button onClick={() => navigate('/customer/orders')}>주문내역</button>
        <button onClick={() => navigate('/customer/cart')}>장바구니</button>
      </nav>
    </div>
  );
}
