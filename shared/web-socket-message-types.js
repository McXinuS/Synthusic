"use strict";
exports.__esModule = true;
var WebSocketMessageType;
(function (WebSocketMessageType) {
    WebSocketMessageType[WebSocketMessageType["note_add"] = 1] = "note_add";
    WebSocketMessageType[WebSocketMessageType["note_update"] = 2] = "note_update";
    WebSocketMessageType[WebSocketMessageType["note_delete"] = 3] = "note_delete";
    WebSocketMessageType[WebSocketMessageType["instrument_add"] = 10] = "instrument_add";
    WebSocketMessageType[WebSocketMessageType["instrument_update"] = 11] = "instrument_update";
    WebSocketMessageType[WebSocketMessageType["instrument_delete"] = 12] = "instrument_delete";
    WebSocketMessageType[WebSocketMessageType["room_updated"] = 20] = "room_updated";
    WebSocketMessageType[WebSocketMessageType["room_name_update"] = 21] = "room_name_update";
    WebSocketMessageType[WebSocketMessageType["room_set_max_users"] = 22] = "room_set_max_users";
    WebSocketMessageType[WebSocketMessageType["room_lock"] = 23] = "room_lock";
    WebSocketMessageType[WebSocketMessageType["room_unlock"] = 24] = "room_unlock";
    WebSocketMessageType[WebSocketMessageType["user_update"] = 25] = "user_update";
    WebSocketMessageType[WebSocketMessageType["bpm_changed"] = 26] = "bpm_changed";
    WebSocketMessageType[WebSocketMessageType["chat_new_message"] = 27] = "chat_new_message";
    WebSocketMessageType[WebSocketMessageType["get_state"] = 90] = "get_state";
    // keep connection alive
    WebSocketMessageType[WebSocketMessageType["ping"] = 100] = "ping";
    WebSocketMessageType[WebSocketMessageType["pong"] = 101] = "pong";
})(WebSocketMessageType = exports.WebSocketMessageType || (exports.WebSocketMessageType = {}));
