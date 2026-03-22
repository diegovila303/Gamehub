import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, MessageCircle, ArrowLeft } from "lucide-react";
import { ChatMessage } from "@/lib/entities";
import ChatBubble from "@/components/chat/ChatBubble";

const MY_EMAIL = "diegovila303@gmail.com";

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const toEmail = searchParams.get("to");

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [activeChat, setActiveChat] = useState(toEmail || null);
  const bottomRef = useRef(null);

  useEffect(() => {
    ChatMessage.getConversations(MY_EMAIL).then(setConversations);
  }, []);

  useEffect(() => {
    if (activeChat) {
      ChatMessage.getMessages(MY_EMAIL, activeChat).then(setMessages);
    }
  }, [activeChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (toEmail) setActiveChat(toEmail);
  }, [toEmail]);

  const sendMessage = async () => {
    if (!input.trim() || !activeChat) return;
    const msg = await ChatMessage.send(MY_EMAIL, activeChat, input.trim());
    setMessages(prev => [...prev, msg]);
    setInput("");
  };

  // Vista conversación activa
  if (activeChat) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
          <button
            onClick={() => setActiveChat(null)}
            className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="font-semibold text-sm text-foreground">{activeChat}</p>
          </div>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <MessageCircle className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No hay mensajes aún.<br/>¡Di algo!</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <ChatBubble key={i} message={msg} isMine={msg.from_email === MY_EMAIL} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-border flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            onClick={sendMessage}
            className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Lista de conversaciones
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-foreground mb-1">Chat</h1>
      <p className="text-sm text-muted-foreground mb-6">Tus conversaciones</p>

      {conversations.length > 0 ? (
        <div className="flex flex-col gap-2">
          {conversations.map((conv, i) => (
            <button
              key={i}
              onClick={() => setActiveChat(conv.email)}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-semibold text-muted-foreground">
                {conv.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{conv.email}</p>
                {conv.lastMessage && (
                  <p className="text-xs text-muted-foreground truncate">{conv.lastMessage.content}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground/80 mb-1">No tienes conversaciones</p>
            <p className="text-sm text-muted-foreground">Ve a Amigos y pulsa el icono de chat</p>
          </div>
        </div>
      )}
    </div>
  );
}
