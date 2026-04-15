import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import styles from './MenuManager.module.css';

interface CategoryData {
  id: string;
  name: string;
  menuItems: MenuItemData[];
}

interface MenuItemData {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
}

export default function MenuManager() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMenu, setEditingMenu] = useState<MenuItemData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', description: '', categoryId: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchMenus = async () => {
    try {
      const res = await apiClient.get('/admin/menus');
      setCategories(res.data.data);
    } catch { /* handled */ } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchMenus(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('description', formData.description);
    data.append('categoryId', formData.categoryId);
    if (imageFile) data.append('image', imageFile);

    try {
      if (editingMenu) {
        await apiClient.put(`/admin/menus/${editingMenu.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await apiClient.post('/admin/menus', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setShowForm(false);
      setEditingMenu(null);
      setFormData({ name: '', price: '', description: '', categoryId: '' });
      setImageFile(null);
      fetchMenus();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '저장에 실패했습니다');
    }
  };

  const handleEdit = (menu: MenuItemData, categoryId: string) => {
    setEditingMenu(menu);
    setFormData({
      name: menu.name,
      price: String(menu.price),
      description: menu.description || '',
      categoryId,
    });
    setShowForm(true);
  };

  const handleDelete = async (menuId: string) => {
    if (!confirm('이 메뉴를 삭제하시겠습니까?')) return;
    try {
      await apiClient.delete(`/admin/menus/${menuId}`);
      fetchMenus();
    } catch {
      alert('메뉴 삭제에 실패했습니다');
    }
  };

  if (isLoading) return <div className={styles.loading}>메뉴를 불러오는 중...</div>;

  return (
    <div className={styles.container} data-testid="menu-manager">
      <header className={styles.header}>
        <button onClick={() => navigate('/admin/dashboard')} aria-label="뒤로가기">←</button>
        <h1>메뉴 관리</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingMenu(null); setFormData({ name: '', price: '', description: '', categoryId: categories[0]?.id || '' }); }} className={styles.addButton}>
          + 추가
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.menuForm} data-testid="menu-form">
          <input placeholder="메뉴명 *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required maxLength={100} />
          <input type="number" placeholder="가격 *" min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
          <input placeholder="설명" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} required aria-label="카테고리 선택">
            <option value="">카테고리 선택</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setImageFile(e.target.files?.[0] || null)} aria-label="이미지 업로드" />
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.formActions}>
            <button type="submit">{editingMenu ? '수정' : '등록'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingMenu(null); }}>취소</button>
          </div>
        </form>
      )}

      {categories.map((cat) => (
        <section key={cat.id} className={styles.categorySection}>
          <h2>{cat.name}</h2>
          <div className={styles.menuList}>
            {cat.menuItems.map((menu) => (
              <div key={menu.id} className={styles.menuItem} data-testid={`admin-menu-${menu.id}`}>
                {menu.imageUrl && <img src={menu.imageUrl} alt={menu.name} className={styles.menuImage} />}
                <div className={styles.menuInfo}>
                  <span className={styles.menuName}>{menu.name}</span>
                  <span className={styles.menuPrice}>{menu.price.toLocaleString()}원</span>
                </div>
                <div className={styles.menuActions}>
                  <button onClick={() => handleEdit(menu, cat.id)}>수정</button>
                  <button onClick={() => handleDelete(menu.id)} className={styles.deleteButton}>삭제</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
