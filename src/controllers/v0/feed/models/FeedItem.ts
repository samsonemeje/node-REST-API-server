import { Table, Model, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'feedItems' // Specify the name of the table
})
class FeedItem extends Model {
  // Define the columns
  @Column(DataType.STRING)
  public caption!: string;

  @Column(DataType.STRING)
  public url!: string;

  @Column(DataType.DATE)
  public createdAt!: Date;

  @Column(DataType.DATE)
  public updatedAt!: Date;
}

export default FeedItem;
