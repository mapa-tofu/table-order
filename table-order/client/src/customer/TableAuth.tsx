import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import apiClient from '../api/client';
import styles from './TableAuth.module.css';

export default function TableAuth() {
  const [storeId, setStoreId] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, isAuthenticated, type } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated() && type === 'table') {
      navigate('/customer/menu', { replace: true });
    }
  }, [isAuthenticated, type, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await apiClient.post('/customer/auth/login', {
        storeId,
        tableNumber: parseInt(tableNumber, 10),
        password,
      });
      login(res.data.data.token);
      navigate('/customer/menu', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '로그인에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container} data-testid="table-auth">
      <h1 className={styles.title}>테이블 오더</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="storeId">매장 ID</label>
        <input
          id="storeId"
          type="text"
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          required
          data-testid="store-id-input"
        />
        <label htmlFor="tableNumber">테이블 번호</label>
        <input
          id="tableNumber"
          type="number"
          min="1"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          required
          data-testid="table-number-input"
        />
        <label htmlFor="password">비밀번호</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          data-testid="password-input"
        />
        {error && <p className={styles.error} role="alert">{error}</p>}
        <button type="submit" disabled={isLoading} data-testid="login-button">
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}
