import { Table, Model, Column, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'users' // Specify the name of the table
})
export class User extends Model<User> {
  // Define the columns
  @Column(DataType.STRING)
  public email!: string;

  @Column(DataType.STRING)
  public password_hash!: string | null;

  @Column(DataType.DATE)
  public createdAt!: Date;

  @Column(DataType.DATE)
  public updatedAt!: Date;

  // Optionally, define any additional methods or properties
  short() {
    return {
      email: this.email
    };
  }
}

export default User;

