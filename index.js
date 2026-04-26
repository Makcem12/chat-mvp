const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const server = http.createServer(app);

// 🔥 مهم: برای Render
const PORT = process.env.PORT || 3000;

// 🔥 Supabase (از ENV می‌گیریم)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 🔥 Socket
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// تست ساده
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// اتصال کاربر
io.on("connection", async (socket) => {
  console.log("User connected");

  // گرفتن history
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("id", { ascending: true });

  if (!error) {
    socket.emit("history", data);
  } else {
    console.log("History error:", error);
  }

  // پیام جدید
  socket.on("message", async (msg) => {
    console.log("MSG:", msg);

    const { error } = await supabase.from("messages").insert([
      {
        user: msg.user,
        text: msg.text
      }
    ]);

    if (error) {
      console.log("Insert error:", error);
    }

    io.emit("message", msg);
  });
});

// 🚀 اجرای سرور
server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
