export enum WebSocketMessageType {
  note_add = 1,
  note_update,
  note_delete,

  instrument_add = 10,
  instrument_update,
  instrument_delete,

  room_updated = 20,
  room_name_update,
  room_set_max_users,
  user_update,
  bpm_changed,

  chat_new_message = 30,
  get_state = 90,
  // keep connection alive
  ping = 100,
  pong = 101
}
