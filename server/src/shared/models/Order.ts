import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';
import type { OrderStatus } from '@shared/types';

interface OrderAttributes {
  id: string;
  storeId: string;
  tableId: string;
  sessionId: string;
  status: OrderStatus;
  totalAmount: number;
}

type OrderCreationAttributes = Optional<OrderAttributes, 'id' | 'status'>;

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: string;
  public storeId!: string;
  public tableId!: string;
  public sessionId!: string;
  public status!: OrderStatus;
  public totalAmount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 관계 타입
  public items?: import('./OrderItem').default[];
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    storeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'store_id',
    },
    tableId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'table_id',
    },
    sessionId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'session_id',
    },
    status: {
      type: DataTypes.ENUM('pending', 'preparing', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    totalAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
      field: 'total_amount',
    },
  },
  {
    sequelize,
    tableName: 'orders',
    indexes: [
      {
        fields: ['store_id', 'status'],
      },
    ],
  },
);

export default Order;
