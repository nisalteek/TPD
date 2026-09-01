import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Good day. I am the TPD Assistant. Ask me about attendance, training certificates, lesson plans, or feedback.' },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setMessages((m) => [...m, { from: 'user', text }]);
    setInput('');
    setSending(true);

    try {
      const res = await api.post('/chatbot', { message: text });
      setMessages((m) => [...m, { from: 'bot', text: res.data.reply }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { from: 'bot', text: 'I was unable to reach the assistant service. Please try again shortly.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chatbot-root">
      {open && (
        <div className="chatbot-panel glass-card">
          <div className="chatbot-header">
            <span>
              <i className="fa-solid fa-robot"></i> TPD Assistant
            </span>
            <button className="btn-icon" onClick={() => setOpen(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.from}`}>
                {m.text}
              </div>
            ))}
            {sending && <div className="chat-bubble bot typing">Typing…</div>}
            <div ref={endRef} />
          </div>
          <form className="chatbot-input" onSubmit={send}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
            />
            <button type="submit" disabled={sending}>
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}
      <button className="chatbot-fab" onClick={() => setOpen((o) => !o)}>
        <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-comment-dots'}`}></i>
      </button>
    </div>
  );
}
