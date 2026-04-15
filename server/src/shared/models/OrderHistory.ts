import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';
import type { OrderHistoryItem } from '@shared/types';

interface OrderHistoryAttributes {
  id: string;
  orderId: string;
  storeId: string;
  tableId: string;
  sessionId: string;
  orderNumber: string;
  totalAmount: number;
  items: OrderHistoryItem[];
  orderedAt: Date;
  completedAt: Date;
}

type OrderHistoryCreationAttributes = Optional<OrderHistoryAttributes, 'id'>;

class OrderHistory
  extends Model<OrderHistoryAttributes, OrderHistoryCreationAttributes>
  implements OrderHistoryAttributes
{
  public id!: string;
  public orderId!: string;
  public storeId!: string;
  public tableId!: string;
  public sessionId!: string;
  public orderNumber!: string;
  public totalAmount!: number;
  public items!: OrderHistoryItem[];
  public orderedAt!: Date;
  public completedAt!: Date;
  public readonly createdAt!: Date;
}

OrderHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'order_id',
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
    orderNumber: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'order_number',
    },
    totalAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'total_amount',
    },
    items: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    orderedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'ordered_at',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'completed_at',
    },
  },
  {
    sequelize,
    tableName: 'order_histories',
    updatedAt: false,
    indexes: [
      {
        fields: ['store_id', 'created_at'],
      },
    ],
  },
);

export default OrderHistory;
