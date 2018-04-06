import {User} from "./user.model";

export class Room {
  id: number;
  name: string;
  users: User[];

  constructor(id: number, name: string, users: User[]) {
    this.id = id;
    this.name = name;
    this.users = users;
  }
}
