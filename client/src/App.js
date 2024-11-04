import './App.css';
import io from 'socket.io-client';
import { useEffect, useState, useRef } from 'react';

//const socket = io.connect('https://your-app-name.onrender.com');
const socket = io.connect('https://chat-app-server-udpw.onrender.com');

function App() {
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [msgList, setMsgList] = useState([]);

  const chatBoxRef = useRef(null);

  const sendMsg = () => {
    if (message.trim()) {
      socket.emit("sendmsg", { msg: message, room });
      setMessage("");
    }
  };

  const joinRoom = () => {
    if (room.trim()) {
      socket.emit("jn", room);
    }
  };

  useEffect(() => {
    socket.on("loadMessages", (messages) => {
      setMsgList(messages.map((m) => m.msg));
    });

    socket.on("rmsg", (data) => {
      setMsgList((prevList) => [...prevList, data.msg]);
    });

    return () => {
      socket.off("loadMessages");
      socket.off("rmsg");
    };
  }, []);

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
