import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';

interface OrderItemAttributes {
  id: string;
  orderId: string;
  menuItemId: string;
  menuName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

type OrderItemCreationAttributes = Optional<OrderItemAttributes, 'id'>;

class OrderItem
  extends Model<OrderItemAttributes, OrderItemCreationAttributes>
  implements OrderItemAttributes
{
  public id!: string;
  public orderId!: string;
  public menuItemId!: string;
  public menuName!: string;
  public quantity!: number;
  public unitPrice!: number;
  public subtotal!: number;
  public readonly createdAt!: Date;
}

OrderItem.init(
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
    menuItemId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'menu_item_id',
    },
    menuName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'menu_name',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    unitPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
      field: 'unit_price',
    },
    subtotal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
  },
  {
    sequelize,
    tableName: 'order_items',
    updatedAt: false,
  },
);

export default OrderItem;
