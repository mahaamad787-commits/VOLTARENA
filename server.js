
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDatabase = require("./config/database");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// ===============================
// CORS
// ===============================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

app.use(express.json());

// ===============================
// BASIC ROUTES
// ===============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    app: "VOLTARENA",
    message: "VOLTARENA Server is running",
    version: "1.0.0",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    server: "online",
    database: "connected",
    realtime: true,
    time: new Date().toISOString(),
  });
});

// ===============================
// SOCKET.IO
// ===============================

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // رسالة ترحيب
  socket.emit("server_message", {
    message: "تم الاتصال بسيرفر VOLTARENA",
  });

  // الانضمام إلى مباراة
  socket.on("join_match", (matchId) => {
    if (!matchId) return;

    const room = `match_${matchId}`;

    socket.join(room);

    socket.emit("match_joined", {
      matchId,
      message: "تم الانضمام إلى المباراة",
    });

    socket.to(room).emit("player_joined", {
      matchId,
      playerId: socket.id,
    });

    console.log(`Player ${socket.id} joined match ${matchId}`);
  });

  // تحديث المباراة
  socket.on("match_update", (data) => {
    if (!data || !data.matchId) return;

    const room = `match_${data.matchId}`;

    io.to(room).emit("match_updated", {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  });

  // مغادرة المباراة
  socket.on("leave_match", (matchId) => {
    if (!matchId) return;

    const room = `match_${matchId}`;

    socket.leave(room);

    socket.to(room).emit("player_left", {
      matchId,
      playerId: socket.id,
    });
  });

  // قطع الاتصال
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
  });
});

// ===============================
// START SERVER
// ===============================

async function startServer() {
  try {
    await connectDatabase();

    server.listen(PORT, "0.0.0.0", () => {
      console.log("=================================");
      console.log("      VOLTARENA GLOBAL SERVER");
      console.log("=================================");
      console.log(`Server running on port: ${PORT}`);
      console.log("Database: CONNECTED");
      console.log("Realtime: SOCKET.IO ENABLED");
      console.log("=================================");
    });
  } catch (error) {
    console.error("Failed to start VOLTARENA server:");
    console.error(error.message);

    process.exit(1);
  }
}

startServer();
