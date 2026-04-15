import Store from './Store';
import StoreAdmin from './StoreAdmin';
import TableEntity from './TableEntity';
import TableSession from './TableSession';
import Category from './Category';
import MenuItem from './MenuItem';
import Order from './Order';
import OrderItem from './OrderItem';
import OrderHistory from './OrderHistory';

// ===== 관계 설정 =====

// Store 1:N StoreAdmin
Store.hasMany(StoreAdmin, { foreignKey: 'storeId', as: 'admins' });
StoreAdmin.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

// Store 1:N TableEntity
Store.hasMany(TableEntity, { foreignKey: 'storeId', as: 'tables' });
TableEntity.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

// TableEntity 1:N TableSession
TableEntity.hasMany(TableSession, { foreignKey: 'tableId', as: 'sessions' });
TableSession.belongsTo(TableEntity, { foreignKey: 'tableId', as: 'table' });

// Store 1:N Category
Store.hasMany(Category, { foreignKey: 'storeId', as: 'categories' });
Category.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

// Category 1:N MenuItem
Category.hasMany(MenuItem, { foreignKey: 'categoryId', as: 'menus' });
MenuItem.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// TableSession 1:N Order
TableSession.hasMany(Order, { foreignKey: 'sessionId', as: 'orders' });
Order.belongsTo(TableSession, { foreignKey: 'sessionId', as: 'session' });

// Order 1:N OrderItem (CASCADE 삭제)
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// MenuItem 1:N OrderItem
MenuItem.hasMany(OrderItem, { foreignKey: 'menuItemId', as: 'orderItems' });
OrderItem.belongsTo(MenuItem, { foreignKey: 'menuItemId', as: 'menuItem' });

export {
  Store,
  StoreAdmin,
  TableEntity,
  TableSession,
  Category,
  MenuItem,
  Order,
  OrderItem,
  OrderHistory,
};
