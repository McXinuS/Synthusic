export class Room {
  name: string;
  users: number[];

  constructor(name: string, users: number[]) {
    this.name = name;
    this.users = users;
  }
}
