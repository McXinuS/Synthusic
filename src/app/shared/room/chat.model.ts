export class ChatMessage {
  sender: number | string;
  message: string;

  constructor(sender: number | string, message: string) {
    this.sender = sender;
    this.message = message;
  }
}
