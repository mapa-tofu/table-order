import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';

interface StoreAttributes {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

type StoreCreationAttributes = Optional<StoreAttributes, 'id'>;

class Store extends Model<StoreAttributes, StoreCreationAttributes> implements StoreAttributes {
  public id!: string;
  public name!: string;
  public address?: string;
  public phone?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Store.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'stores',
  },
);

export default Store;
