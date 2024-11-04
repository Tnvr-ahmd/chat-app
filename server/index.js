const io = require("socket.io")(3001, {
    cors: {
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST"]
    }
  });
  
  io.on("connection", (socket) => {
      console.log("User connected with socket ID: " + socket.id);
  
      // Listen for joining rooms
      socket.on("jn", (room) => {
          if (room) {
              socket.join(room);
              console.log(`User ${socket.id} joined room: ${room}`);
          }
      });
  
      // Listen for sending messages
      socket.on("sendmsg", (data) => {
          const { room, msg } = data;
          if (room) {
              // Send to all clients in the specified room
              io.to(room).emit("rmsg", {  msg });
          } else {
              // Broadcast to all clients if no room is specified
              socket.broadcast.emit("rmsg", {  msg });
          }
      });
  });
  