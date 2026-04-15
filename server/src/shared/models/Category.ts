import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';

interface CategoryAttributes {
  id: string;
  storeId: string;
  name: string;
  sortOrder: number;
}

type CategoryCreationAttributes = Optional<CategoryAttributes, 'id' | 'sortOrder'>;

class Category
  extends Model<CategoryAttributes, CategoryCreationAttributes>
  implements CategoryAttributes
{
  public id!: string;
  public storeId!: string;
  public name!: string;
  public sortOrder!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Category.init(
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
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
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
    tableName: 'categories',
    indexes: [
      {
        fields: ['store_id'],
      },
    ],
  },
);

export default Category;
