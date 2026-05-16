import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles } from 'lucide-react';
import { askQuestion } from '../services/chatbotService';
import IconBox from '../components/ui/IconBox';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function AssistantPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [messages, setMessages] = useState(() => [{
    role: 'bot',
    text: null,
    isWelcome: true,
    timestamp: new Date().toISOString(),
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const q = text || input;
    if (!q.trim() || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: q, timestamp: new Date().toISOString() }]);
    setLoading(true);
    try {
      const res = await askQuestion(q);
      setMessages((prev) => [...prev, { role: 'bot', text: res.data.answer, timestamp: res.data.timestamp }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', text: t('assistant.error'), timestamp: new Date().toISOString() }]);
    } finally { setLoading(false); }
  };

  const fmtTime = (iso) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    /*
     * Fixed overlay: top = navbar (56px), bottom = 0 desktop / 80px mobile (tab bar).
     * This makes the chat truly full-height with no unused space.
     */
    <div
      className="top-0 md:top-[56px] md:bottom-0 bottom-[68px]"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        background: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Centered column — fills the fixed overlay */}
      <div
        className="px-3 md:px-7 pt-3 md:pt-5 pb-3 md:pb-4"
        style={{
          maxWidth: 1100,
          width: '100%',
          margin: '0 auto',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 13, flexShrink: 0,
              background: 'linear-gradient(135deg, #5856D6 0%, #7B79F0 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(88,86,214,0.30)',
            }}>
              <Sparkles size={22} color="#fff" strokeWidth={1.75} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
                {t('assistant.title')}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, margin: '3px 0 0' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--green-text)' }}>{t('assistant.online')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages — takes all remaining vertical space, scrolls internally */}
        <div style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          background: 'var(--bg-primary)',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--card-shadow)',
          padding: '16px 16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-end', gap: 10,
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            }}>
              {msg.role === 'bot' ? (
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--purple-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bot size={15} color="var(--purple)" strokeWidth={1.75} />
                </div>
              ) : (
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--blue)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.03em', userSelect: 'none',
                }}>
                  {getInitials(user?.name)}
                </div>
              )}

              <div style={{
                flex: 1, minWidth: 0,
                display: 'flex', flexDirection: 'column', gap: 3,
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div className={msg.role === 'bot' ? 'bubble-bot' : 'bubble-user'}>
                  {msg.isWelcome ? t('assistant.welcome') : msg.text}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)', paddingLeft: 2, paddingRight: 2 }}>
                  {fmtTime(msg.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: 'var(--purple-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bot size={15} color="var(--purple)" strokeWidth={1.75} />
              </div>
              <div className="bubble-bot" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {[0, 150, 300].map((d) => (
                  <span key={d} style={{
                    width: 6, height: 6, background: 'var(--text-tertiary)', borderRadius: '50%',
                    animation: `bounce 1.2s ease-in-out ${d}ms infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions — shown only before first reply */}
        {messages.length === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, flexShrink: 0 }}>
            {[t('assistant.s0'), t('assistant.s1'), t('assistant.s2'), t('assistant.s3')].map((s) => (
              <button key={s} onClick={() => send(s)} style={{
                fontSize: 12, fontWeight: 500, padding: '8px 12px',
                background: 'var(--purple-bg)', color: 'var(--purple-text)',
                border: '1px solid var(--purple)', borderRadius: 'var(--radius-tag)',
                cursor: 'pointer', transition: 'opacity 0.15s',
                textAlign: 'left', lineHeight: 1.4,
              }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input — always at bottom, never scrolls away */}
        <div style={{
          flexShrink: 0,
          background: 'var(--bg-primary)',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--card-shadow)',
          padding: '12px 16px',
        }}>
          <form onSubmit={(e) => { e.preventDefault(); send(); }} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="text" value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('assistant.placeholder')}
              disabled={loading}
              className="chat-input"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 14, color: 'var(--text-primary)', fontFamily: 'inherit',
              }}
            />
            <button type="submit" disabled={loading || !input.trim()} style={{
              width: 38, height: 38, borderRadius: 'var(--radius-sm)', flexShrink: 0,
              background: 'var(--blue)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: loading || !input.trim() ? 0.4 : 1, transition: 'opacity 0.15s',
            }}>
              <Send size={15} color="#fff" strokeWidth={1.75} />
            </button>
          </form>
        </div>

      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
