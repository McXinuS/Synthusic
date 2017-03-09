import {User} from "./user.model";

export class Room {
  name: string;
  users: User[];

  constructor(name: string, users: User[]) {
    this.name = name;
    this.users = users;
  }
}
