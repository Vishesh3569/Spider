import React from "react";

function RoomControls({ room, setRoom, joinRoom }) {
  return (
    <div>
      <input
        type="text"
        placeholder="Room ID"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      <button onClick={joinRoom}>Join Room</button>
    </div>
  );
}

export default RoomControls;
