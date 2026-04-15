import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';

interface MenuItemAttributes {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
}

type MenuItemCreationAttributes = Optional<MenuItemAttributes, 'id' | 'sortOrder'>;

class MenuItem
  extends Model<MenuItemAttributes, MenuItemCreationAttributes>
  implements MenuItemAttributes
{
  public id!: string;
  public categoryId!: string;
  public name!: string;
  public price!: number;
  public description?: string;
  public imageUrl?: string;
  public sortOrder!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MenuItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'category_id',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'image_url',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'sort_order',
    },
  },
  {
    sequelize,
    tableName: 'menu_items',
  },
);

export default MenuItem;
