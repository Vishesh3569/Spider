import React, { useEffect } from "react";

function ChatMessages({ chat }) {
  const chatBoxRef = React.useRef();

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat]);

  return (
    <div ref={chatBoxRef} style={{ overflowY: "auto", maxHeight: "300px" }}>
      {chat.map((msg, index) => (
        <p key={index}>
          <strong>{msg.sender}:</strong> {msg.message}
        </p>
      ))}
    </div>
  );
}

export default ChatMessages;
