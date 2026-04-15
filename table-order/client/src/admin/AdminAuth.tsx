import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import apiClient from '../api/client';
import styles from './AdminAuth.module.css';

export default function AdminAuth() {
  const [storeId, setStoreId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, isAuthenticated, type } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated() && type === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, type, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await apiClient.post('/admin/auth/login', { storeId, username, password });
      login(res.data.data.token);
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || '로그인에 실패했습니다';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container} data-testid="admin-auth">
      <h1 className={styles.title}>관리자 로그인</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="storeId">매장 ID</label>
        <input id="storeId" type="text" value={storeId} onChange={(e) => setStoreId(e.target.value)} required />
        <label htmlFor="username">사용자명</label>
        <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <label htmlFor="password">비밀번호</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className={styles.error} role="alert">{error}</p>}
        <button type="submit" disabled={isLoading} data-testid="admin-login-button">
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}
