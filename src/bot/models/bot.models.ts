import { Column, DataType, Model, Table } from "sequelize-typescript";

interface IBotCreationAttr {
  user_id: number | undefined;
  car_number: string | undefined;
  model: string | undefined;
  color: string | undefined;
  year: number | undefined;
  last_state: string;
}

@Table({ tableName: "cars" })
export class Bot extends Model<Bot, IBotCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.BIGINT,
  })
  user_id: number | undefined;

  @Column({
    type: DataType.STRING(10),
  })
  car_number: string | undefined;

  @Column({
    type: DataType.STRING(100),
  })
  model: string | undefined;

  @Column({
    type: DataType.STRING(30),
  })
  color: string | undefined;

  @Column({
    type: DataType.INTEGER,
  })
  year: string | undefined;

  @Column({
    type: DataType.STRING(50),
  })
  last_state: string;
}
