import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import apiClient from '../api/client';
import styles from './OrderCreate.module.css';

export default function OrderCreate() {
  const { items, totalAmount, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleConfirm = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    setError('');

    try {
      const res = await apiClient.post('/customer/orders', {
        items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
      });
      clearCart();
      navigate('/customer/order/success', { state: { orderId: res.data.data.order.id } });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '주문에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container} data-testid="order-create">
      <header className={styles.header}>
        <button onClick={() => navigate(-1)} aria-label="뒤로가기">←</button>
        <h1>주문 확인</h1>
      </header>

      <ul className={styles.itemList}>
        {items.map((item) => (
          <li key={item.menuItemId} className={styles.item}>
            <span>{item.name} × {item.quantity}</span>
            <span>{(item.price * item.quantity).toLocaleString()}원</span>
          </li>
        ))}
      </ul>

      <div className={styles.total}>
        <span>총 금액</span>
        <span>{totalAmount.toLocaleString()}원</span>
      </div>

      {error && <p className={styles.error} role="alert">{error}</p>}

      <button
        className={styles.confirmButton}
        onClick={handleConfirm}
        disabled={isSubmitting || items.length === 0}
        data-testid="confirm-order-button"
      >
        {isSubmitting ? '주문 중...' : '주문 확정'}
      </button>
    </div>
  );
}
