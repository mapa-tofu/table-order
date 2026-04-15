import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';

interface TableEntityAttributes {
  id: string;
  storeId: string;
  tableNumber: number;
  password: string;
}

type TableEntityCreationAttributes = Optional<TableEntityAttributes, 'id'>;

class TableEntity
  extends Model<TableEntityAttributes, TableEntityCreationAttributes>
  implements TableEntityAttributes
{
  public id!: string;
  public storeId!: string;
  public tableNumber!: number;
  public password!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TableEntity.init(
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
    tableNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'table_number',
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'tables',
    indexes: [
      {
        unique: true,
        fields: ['store_id', 'table_number'],
      },
    ],
  },
);

export default TableEntity;
