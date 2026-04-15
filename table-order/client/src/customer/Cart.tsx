import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import styles from './Cart.module.css';

export default function Cart() {
  const { items, totalAmount, updateQuantity, removeItem, clearCart } = useCartStore();
  const navigate = useNavigate();

  return (
    <div className={styles.container} data-testid="cart">
      <header className={styles.header}>
        <button onClick={() => navigate(-1)} aria-label="뒤로가기">←</button>
        <h1>장바구니</h1>
        {items.length > 0 && (
          <button onClick={clearCart} className={styles.clearButton}>비우기</button>
        )}
      </header>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <p>장바구니가 비어있습니다</p>
          <button onClick={() => navigate('/customer/menu')}>메뉴 보기</button>
        </div>
      ) : (
        <>
          <ul className={styles.itemList}>
            {items.map((item) => (
              <li key={item.menuItemId} className={styles.item} data-testid={`cart-item-${item.menuItemId}`}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemPrice}>{(item.price * item.quantity).toLocaleString()}원</span>
                </div>
                <div className={styles.quantityControls}>
                  <button
                    onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                    aria-label={`${item.name} 수량 감소`}
                    data-testid={`decrease-${item.menuItemId}`}
                  >
                    −
                  </button>
                  <span data-testid={`quantity-${item.menuItemId}`}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                    aria-label={`${item.name} 수량 증가`}
                    data-testid={`increase-${item.menuItemId}`}
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item.menuItemId)}
                    className={styles.removeButton}
                    aria-label={`${item.name} 삭제`}
                    data-testid={`remove-${item.menuItemId}`}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className={styles.footer}>
            <div className={styles.total}>
              <span>총 금액</span>
              <span data-testid="total-amount">{totalAmount.toLocaleString()}원</span>
            </div>
            <button
              className={styles.orderButton}
              onClick={() => navigate('/customer/order')}
              data-testid="order-button"
            >
              주문하기
            </button>
          </div>
        </>
      )}
    </div>
  );
}
