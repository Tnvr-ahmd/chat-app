const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

mongoose.connect("mongodb+srv://thanveerahamed1100:Thanveer@215@chatapp.immg0.mongodb.net/?retryWrites=true&w=majority&authSource=admin&directConnection=true", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((error) => console.error("MongoDB connection error:", error));

// Connect to MongoDB using Mongoose
//mongoose.connect("mongodb+srv://thanveerahamed1100:Thanveer@215@chatapp.immg0.mongodb.net/?retryWrites=true&w=majority", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

// Define a message schema
const MessageSchema = new mongoose.Schema({
  room: String,
  id: String,
  msg: String,
  timestamp: { type: Date, default: Date.now }
});

// Create a message model from the schema
const Message = mongoose.model("Message", MessageSchema);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  }
});

io.on("connection", (socket) => {
  console.log("User connected with socket ID:", socket.id);

  // Join room and send previous messages in the room
  socket.on("jn", async (room) => {
    socket.join(room);

    // Retrieve messages for the room and send them to the user
    const messages = await Message.find({ room }).sort({ timestamp: 1 });
    socket.emit("loadMessages", messages);
  });

  // Handle sending messages
  socket.on("sendmsg", async (data) => {
    const { room, msg } = data;
    const messageData = { room, id: socket.id, msg };

    // Save the message to MongoDB
    const newMessage = new Message(messageData);
    await newMessage.save();

    // Emit the message to all users in the room or broadcast if no room is specified
    if (room) {
      io.to(room).emit("rmsg", messageData);
    } else {
      socket.broadcast.emit("rmsg", messageData);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
