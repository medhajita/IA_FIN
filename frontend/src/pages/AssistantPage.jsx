import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { askQuestion } from '../services/chatbotService';

const SUGGESTIONS = [
  'Combien j\'ai dépensé ?',
  'Quel est mon solde ?',
  'Ma catégorie la plus dépensière ?',
  'Mon taux d\'épargne ?',
];

const WELCOME = {
  role: 'bot',
  text: 'Bonjour ! Je suis votre assistant financier. Posez-moi une question sur vos dépenses.',
  timestamp: new Date().toISOString(),
};

export default function AssistantPage() {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const q = text || input;
    if (!q.trim() || loading) return;
    setInput('');
    const userMsg = { role: 'user', text: q, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await askQuestion(q);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: res.data.answer, timestamp: res.data.timestamp },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'Désolé, une erreur s\'est produite. Réessayez.', timestamp: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fmtTime = (iso) =>
    new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col h-[calc(100vh-80px)]">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Assistant Financier</h1>

      <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'bot' ? 'bg-indigo-100' : 'bg-gray-200'}`}>
              {msg.role === 'bot' ? <Bot size={16} className="text-indigo-600" /> : <User size={16} className="text-gray-600" />}
            </div>
            <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'bot'
                  ? 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  : 'bg-indigo-600 text-white rounded-tr-sm'
              }`}>
                {msg.text}
              </div>
              <span className="text-xs text-gray-400 px-1">{fmtTime(msg.timestamp)}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-indigo-600" />
            </div>
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition border border-indigo-100"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez votre question..."
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
