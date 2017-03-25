export enum WebSocketMessageType {
  note_add = 1,
  note_remove = 2,
  instrument_add = 10,
  instrument_update = 11,
  instrument_delete = 12,
  room_updated = 20,
  room_name_update = 21,
  chat_new_message = 30,
  get_state = 90,
  ping = 100, // keep connection alive (from client)
  pong = 101  // keep connection alive (from server)
}
