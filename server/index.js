const {Server}=require('socket.io')
const express=require('express')
const app=express()
const http=require('http')
const cors=require('cors')
app.use(cors())
const server=http.createServer(app)
const io=new Server(server,{
    cors:{
        origin:"http://localhost:3000",
        methods:["GET","POST"],
    },
})
io.on("connection",(socket)=>{
    console.log(socket.id)
    socket.on("jn",(data)=>{
        if(data){
        socket.join(data)
        console.log(`User ${socket.id} joined room: ${data}`);}
    })
        socket.on("sendmsg",({msg,room})=>{
            if (room){
            console.log(`User ${socket.id} joined room: ${room}`);
            socket.to(room).emit("rmsg",{msg})
            }else{
                socket.emit("rmsg",{msg})
            }
        })
    
})
server.listen(3001,()=>{console.log("server is running on 3001")})