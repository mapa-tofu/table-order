import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './OrderSuccess.module.css';

export default function OrderSuccess() {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = (location.state as any)?.orderId;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/customer/menu', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className={styles.container} data-testid="order-success">
      <div className={styles.icon}>✓</div>
      <h1>주문 완료</h1>
      {orderId && <p className={styles.orderId}>주문번호: {orderId.slice(0, 8)}</p>}
      <p className={styles.message}>주문이 접수되었습니다</p>
      <p className={styles.countdown} data-testid="countdown">
        {countdown}초 후 메뉴 화면으로 이동합니다
      </p>
      <button onClick={() => navigate('/customer/menu', { replace: true })}>
        바로 이동
      </button>
    </div>
  );
}
