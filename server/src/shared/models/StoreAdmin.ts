import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';

interface StoreAdminAttributes {
  id: string;
  storeId: string;
  username: string;
  password: string;
}

type StoreAdminCreationAttributes = Optional<StoreAdminAttributes, 'id'>;

class StoreAdmin
  extends Model<StoreAdminAttributes, StoreAdminCreationAttributes>
  implements StoreAdminAttributes
{
  public id!: string;
  public storeId!: string;
  public username!: string;
  public password!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StoreAdmin.init(
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
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'store_admins',
    indexes: [
      {
        unique: true,
        fields: ['store_id', 'username'],
      },
    ],
  },
);

export default StoreAdmin;
