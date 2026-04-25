const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// 🔥 Supabase connection (همونی که دادی)
const supabase = createClient(
  "https://skmtdrjluilrjisebqrz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrbXRkcmpsdWlscmppc2VicXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMTg4MzgsImV4cCI6MjA5MjY5NDgzOH0.BUrILSHfufgXAln97-e2NGhLV9uHGRJ2Ub1_LtoJiiM"
);

app.get("/", (req, res) => {
  res.send("Chat server running");
});

io.on("connection", async (socket) => {
  console.log("User connected");

  // 🔥 گرفتن پیام‌های قبلی
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("id", { ascending: true });

  if (!error) {
    socket.emit("history", data);
  } else {
    console.log("History error:", error);
  }

  // 🔥 پیام جدید
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

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
