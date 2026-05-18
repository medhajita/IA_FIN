import { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Send, Sparkles, X } from 'lucide-react';
import { askQuestion } from '../../services/chatbotService';
import { useI18n } from '../../context/I18nContext';

export default function FloatingAssistant() {
  const { lang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);

  const welcome = useMemo(
    () =>
      lang === 'fr'
        ? 'Bonjour ! Je suis FinCoach IA. Posez-moi une question sur vos finances.'
        : 'Hello! I am FinCoach IA. Ask me anything about your finances.',
    [lang]
  );

  const suggestions = useMemo(
    () =>
      lang === 'fr'
        ? [
            'Quel est mon solde ce mois-ci ?',
            'Quelle est ma plus grosse catégorie de dépenses ?',
            'Comment puis-je épargner davantage ?',
            'Quel est mon taux d’épargne ?',
          ]
        : [
            'What is my balance this month?',
            'What is my biggest expense category?',
            'How can I save more?',
            'What is my savings rate?',
          ],
    [lang]
  );

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'bot', text: welcome }]);
    }
  }, [welcome, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  async function send(textArg) {
    const text = (typeof textArg === 'string' ? textArg : input).trim();
    if (!text || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);
    try {
      const res = await askQuestion(text);
      const answer = res?.data?.answer || (lang === 'fr' ? 'Je n’ai pas pu répondre.' : 'I could not answer.');
      setMessages((prev) => [...prev, { role: 'bot', text: answer }]);
    } catch (err) {
      const apiMsg = err?.response?.data?.error;
      const fallback =
        lang === 'fr'
          ? 'Service IA indisponible pour le moment. Réessayez dans un instant.'
          : 'AI service unavailable right now. Try again in a moment.';
      setMessages((prev) => [...prev, { role: 'bot', text: apiMsg || fallback }]);
    } finally {
      setLoading(false);
    }
  }

  const showSuggestions = messages.length <= 1 && !loading;

  return (
    <>
      {open && (
        <section className="fc-chat-popup" role="dialog" aria-label="FinCoach assistant">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
              borderBottom: '1px solid var(--fc-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="fc-item-icon" style={{ color: 'var(--fc-blue)' }}>
                <Bot size={18} />
              </span>
              <div>
                <strong>FinCoach IA</strong>
                <span style={{ display: 'block', color: 'var(--fc-green)', fontSize: 12 }}>● Online</span>
              </div>
            </div>
            <button
              className="fc-icon-button"
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('nav.signOut') ? 'Close' : 'Close'}
            >
              <X size={17} />
            </button>
          </div>

          <div
            ref={scrollRef}
            style={{
              maxHeight: 360,
              minHeight: 220,
              overflowY: 'auto',
              padding: 16,
              display: 'grid',
              gap: 10,
            }}
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                style={{
                  justifySelf: message.role === 'user' ? 'end' : 'start',
                  maxWidth: '86%',
                  borderRadius:
                    message.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: message.role === 'user' ? 'var(--fc-blue)' : 'var(--fc-card-soft)',
                  color: message.role === 'user' ? '#fff' : 'var(--fc-text)',
                  padding: '10px 12px',
                  fontSize: 13,
                  lineHeight: 1.45,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {message.text}
              </div>
            ))}
            {loading && (
              <div style={{ color: 'var(--fc-muted)', fontSize: 13 }}>
                {lang === 'fr' ? 'FinCoach réfléchit…' : 'FinCoach is thinking…'}
              </div>
            )}

            {showSuggestions && (
              <div className="fc-floating-suggestions" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 10px',
                      borderRadius: 999,
                      background: 'rgba(47,107,255,0.10)',
                      color: 'var(--fc-blue)',
                      fontSize: 12,
                      fontWeight: 600,
                      border: '1px solid rgba(47,107,255,0.25)',
                      cursor: 'pointer',
                    }}
                  >
                    <Sparkles size={12} />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            style={{
              display: 'flex',
              gap: 8,
              padding: 14,
              borderTop: '1px solid var(--fc-border)',
            }}
          >
            <input
              className="fc-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={lang === 'fr' ? 'Posez votre question…' : 'Ask a question…'}
              disabled={loading}
            />
            <button className="fc-button" type="submit" aria-label="Send" disabled={loading || !input.trim()}>
              <Send size={16} />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="fc-chat-fab"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
      >
        <Bot size={24} strokeWidth={2.2} />
      </button>
    </>
  );
}
