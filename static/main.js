const username = prompt("Enter your name")?.trim() || "Anon";
const client_id = Date.now();
const ws = new WebSocket(`wss://1aa5febb50a1.ngrok-free.app/ws/${client_id}`);



const messagesEl = document.getElementById("messages");
const typingEl   = document.getElementById("typing");
const sound      = document.getElementById("notif-sound");
const themeBtn   = document.getElementById("theme-btn");
const htmlEl     = document.documentElement;

let typingTimeout;

themeBtn.onclick = () => {
  const next = htmlEl.getAttribute("data-theme") === "light" ? "dark" : "light";
  htmlEl.setAttribute("data-theme", next);
  themeBtn.querySelector("use").setAttribute(
    "href",
    next === "light" ? "/static/icons.svg#moon" : "/static/icons.svg#sun"
  );
};

document.getElementById("input").addEventListener("input", () => {
  ws.send(JSON.stringify({ type: "typing", username }));
});

ws.onopen = () => console.log("✅ Connected as", username);

ws.onmessage = ({ data }) => {
  const msg = JSON.parse(data);

  if (msg.type === "typing" && msg.username !== username) {
    clearTimeout(typingTimeout);
    typingEl.textContent = `${msg.username} is typing…`;
    typingTimeout = setTimeout(() => (typingEl.textContent = ""), 1500);
    return;
  }

  if (msg.type !== "message") return;

  const { username: u, text, time } = msg;
  const bubble = document.createElement("div");
  bubble.className = `message ${u === username ? "self" : "other"}`;
  bubble.innerHTML = `
    <div class="text">${text}</div>
    <div class="meta">${u} · ${time}</div>
  `;

  messagesEl.append(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  sound.currentTime = 0;
  sound.play().catch(() => {});
};

function sendMessage(e) {
  e.preventDefault();
  const input = document.getElementById("input");
  const text = input.value.trim();
  if (!text) return;

  const payload = {
    type: "message",
    username,
    text,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };

  ws.send(JSON.stringify(payload));
  input.value = "";
}
