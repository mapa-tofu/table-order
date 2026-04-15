import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';
import type { SessionStatus } from '@shared/types';

interface TableSessionAttributes {
  id: string;
  tableId: string;
  storeId: string;
  status: SessionStatus;
  startedAt: Date;
  completedAt?: Date;
}

type TableSessionCreationAttributes = Optional<TableSessionAttributes, 'id' | 'completedAt'>;

class TableSession
  extends Model<TableSessionAttributes, TableSessionCreationAttributes>
  implements TableSessionAttributes
{
  public id!: string;
  public tableId!: string;
  public storeId!: string;
  public status!: SessionStatus;
  public startedAt!: Date;
  public completedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TableSession.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tableId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'table_id',
    },
    storeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'store_id',
    },
    status: {
      type: DataTypes.ENUM('active', 'completed'),
      allowNull: false,
      defaultValue: 'active',
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'started_at',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at',
    },
  },
  {
    sequelize,
    tableName: 'table_sessions',
    indexes: [
      {
        fields: ['store_id'],
      },
    ],
  },
);

export default TableSession;
