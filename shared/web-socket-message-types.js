"use strict";
(function (WebSocketMessageType) {
    WebSocketMessageType[WebSocketMessageType["note_add"] = 1] = "note_add";
    WebSocketMessageType[WebSocketMessageType["note_remove"] = 2] = "note_remove";
    WebSocketMessageType[WebSocketMessageType["instrument_add"] = 10] = "instrument_add";
    WebSocketMessageType[WebSocketMessageType["instrument_update"] = 11] = "instrument_update";
    WebSocketMessageType[WebSocketMessageType["instrument_delete"] = 12] = "instrument_delete";
    WebSocketMessageType[WebSocketMessageType["room_updated"] = 20] = "room_updated";
    WebSocketMessageType[WebSocketMessageType["room_name_update"] = 21] = "room_name_update";
    WebSocketMessageType[WebSocketMessageType["room_set_max_users"] = 22] = "room_set_max_users";
    WebSocketMessageType[WebSocketMessageType["user_update"] = 23] = "user_update";
    WebSocketMessageType[WebSocketMessageType["chat_new_message"] = 30] = "chat_new_message";
    WebSocketMessageType[WebSocketMessageType["get_state"] = 90] = "get_state";
    // keep connection alive
    WebSocketMessageType[WebSocketMessageType["ping"] = 100] = "ping";
    WebSocketMessageType[WebSocketMessageType["pong"] = 101] = "pong";
})(exports.WebSocketMessageType || (exports.WebSocketMessageType = {}));
var WebSocketMessageType = exports.WebSocketMessageType;
