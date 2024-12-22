import React from "react";

function MessageControls({ message, setMessage, sendMessage }) {
  return (
    <div>
      <input
        type="text"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default MessageControls;
