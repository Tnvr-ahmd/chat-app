import './App.css';
import io from 'socket.io-client';
import { useEffect, useState, useRef } from 'react';

const socket = io.connect('http://localhost:3001');

function App() {
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [msgList, setMsgList] = useState(() => {
    const savedMessages = localStorage.getItem('messages');
    return savedMessages ? JSON.parse(savedMessages) : ["Hi", "Welcome to the chat!"];
  });

  const chatBoxRef = useRef(null);

  // Update localStorage whenever msgList changes
  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(msgList));
  }, [msgList]);

  const sendMsg = () => {
    if (message.trim()) {
      socket.emit("sendmsg", { msg: message, room });
      setMessage("");  // Clear message input after sending
    }
  };

  const joinRoom = () => {
    if (room.trim()) {
      socket.emit("jn", room);
    }
  };

  useEffect(() => {
    // Set up listener for incoming messages only once
    socket.on("rmsg", (data) => {
      setMsgList((prevList) => [...prevList, data.msg]);
    });

    // Clean up the listener on component unmount
    return () => socket.off("rmsg");
  }, [msgList]);

  // Scroll to the latest message whenever msgList changes
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [msgList]);

  return (
    <div className="App">
      <div className="chat-container">
        <h2>Chat Room</h2>
        
        <div className="room-entry">
          <input
            placeholder="Enter room code (optional)"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>

        <div className="chat-box" ref={chatBoxRef}>
          <ul>
            {msgList.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </div>

        <div className="message-input">
          <input
            placeholder="Enter message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={sendMsg}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
