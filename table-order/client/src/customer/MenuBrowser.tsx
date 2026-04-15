import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useCartStore } from '../stores/cartStore';
import type { CategoryWithMenus } from '@shared/types';
import styles from './MenuBrowser.module.css';

export default function MenuBrowser() {
  const [categories, setCategories] = useState<CategoryWithMenus[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const cartItemCount = useCartStore((s) => s.items.length);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await apiClient.get('/customer/menus');
        setCategories(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedCategory(res.data.data[0].id);
        }
      } catch {
        // Error handled by interceptor
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenus();
  }, []);

  const currentMenus = categories.find((c) => c.id === selectedCategory)?.menuItems || [];

  if (isLoading) return <div className={styles.loading}>메뉴를 불러오는 중...</div>;

  return (
    <div className={styles.container} data-testid="menu-browser">
      <header className={styles.header}>
        <h1>메뉴</h1>
        <button
          className={styles.cartButton}
          onClick={() => navigate('/customer/cart')}
          data-testid="cart-button"
          aria-label={`장바구니 ${cartItemCount}개`}
        >
          🛒 {cartItemCount > 0 && <span className={styles.badge}>{cartItemCount}</span>}
        </button>
      </header>

      <nav className={styles.tabs} role="tablist" aria-label="메뉴 카테고리">
        {categories.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={selectedCategory === cat.id}
            className={`${styles.tab} ${selectedCategory === cat.id ? styles.activeTab : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </nav>

      <div className={styles.menuGrid} role="tabpanel">
        {currentMenus.map((item) => (
          <div key={item.id} className={styles.menuCard} data-testid={`menu-item-${item.id}`}>
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.name} className={styles.menuImage} />
            )}
            <div className={styles.menuInfo}>
              <h3>{item.name}</h3>
              {item.description && <p className={styles.description}>{item.description}</p>}
              <p className={styles.price}>{item.price.toLocaleString()}원</p>
            </div>
            <button
              className={styles.addButton}
              onClick={() => addItem({
                menuItemId: item.id,
                name: item.name,
                price: item.price,
                quantity: 1,
                imageUrl: item.imageUrl,
              })}
              data-testid={`add-to-cart-${item.id}`}
            >
              담기
            </button>
          </div>
        ))}
      </div>

      <nav className={styles.bottomNav}>
        <button onClick={() => navigate('/customer/menu')}>메뉴</button>
        <button onClick={() => navigate('/customer/orders')}>주문내역</button>
        <button onClick={() => navigate('/customer/cart')}>장바구니</button>
      </nav>
    </div>
  );
}
