const http = require("http");
const { Server } = require("socket.io");
const { createClient } = require("@supabase/supabase-js");

// 🔥 Supabase config (اینا رو تو دادی، من فقط گذاشتم داخلش)
const supabase = createClient(
  "https://skmtdrjluilrjisebqrz.supabase.co",
  "sb_publishable_V0NQwT8Vdlq8Khn4awzcXg_wrL7E4e2"
);

const server = http.createServer((req, res) => {
  res.end("Server is running");
});

const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", async (socket) => {
  console.log("User connected");

  // 🔥 گرفتن پیام‌های قبلی
  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .order("id", { ascending: true });

  if (!error) {
    socket.emit("history", messages);
  }

  // 🔥 پیام جدید
  socket.on("message", async (msg) => {
    console.log(msg);

    await supabase.from("messages").insert([
      {
        user: msg.user,
        text: msg.text
      }
    ]);

    io.emit("message", msg);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
