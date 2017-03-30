export enum WebSocketMessageType {
  note_add = 1,
  note_remove,

  instrument_add = 10,
  instrument_update,
  instrument_delete,

  room_updated = 20,
  room_name_update,
  user_update,

  chat_new_message = 30,
  get_state = 90,
  // keep connection alive
  ping = 100,
  pong = 101
}
