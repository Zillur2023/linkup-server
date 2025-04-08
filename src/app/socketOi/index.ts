import { Server } from "socket.io";
import http from "http";
import config from "../config";
import app from "../../app";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.client_url,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

export const getReceiverSocketId = (receiverId: any) => {
  return users[receiverId];
};

const users: any = {};

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  const userId = socket.handshake.query.userId as string;
  if (userId) {
    users[userId] = socket.id;
    console.log("Hello ", users);
  }
  io.emit("getOnlineUsers", Object.keys(users));

  socket.on("disconnect", () => {
    console.log("a user disconnected", socket.id);
    delete users[userId];
    io.emit("getOnlineUsers", Object.keys(users));
  });
});

export { app, io, server };
