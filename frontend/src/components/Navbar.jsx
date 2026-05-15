import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  TrendingUp, LayoutDashboard, ArrowUpDown,
  Target, MessageSquare, Sun, Moon, LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';

const NAV_KEYS = [
  { to: '/dashboard',    tKey: 'nav.dashboard',    icon: LayoutDashboard },
  { to: '/transactions', tKey: 'nav.transactions',  icon: ArrowUpDown },
  { to: '/goals',        tKey: 'nav.goals',         icon: Target },
  { to: '/assistant',    tKey: 'nav.assistant',     icon: MessageSquare },
];

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function Avatar({ name, size = 28, fontSize = 11 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--blue)', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize, fontWeight: 700, letterSpacing: '0.03em', flexShrink: 0,
      userSelect: 'none',
    }}>
      {getInitials(name)}
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const [desktopDrop, setDesktopDrop] = useState(false);
  const [mobileDrop, setMobileDrop]   = useState(false);
  const desktopDropRef = useRef(null);
  const mobileDropRef  = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (desktopDropRef.current && !desktopDropRef.current.contains(e.target)) setDesktopDrop(false);
      if (mobileDropRef.current  && !mobileDropRef.current.contains(e.target))  setMobileDrop(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleLogout() {
    setDesktopDrop(false);
    setMobileDrop(false);
    logout();
    navigate('/login');
  }

  function isActive(to) {
    if (to === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(to);
  }

  const langBtnStyle = (l) => ({
    fontSize: 12, fontWeight: 700, padding: '3px 7px',
    borderRadius: 6, border: '1px solid var(--border)',
    background: lang === l ? 'var(--blue)' : 'transparent',
    color: lang === l ? '#fff' : 'var(--text-secondary)',
    cursor: 'pointer', transition: 'all 0.15s',
    lineHeight: 1,
  });

  return (
    <>
      {/* ══ DESKTOP TOP NAV (md+) ═════════════════ */}
      <nav className="top-nav hidden md:block">
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', position: 'relative', display: 'flex', alignItems: 'center', height: 56 }}>

          {/* Left — Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#fff" strokeWidth={1.75} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
              FinancIA
            </span>
          </div>

          {/* Center — Nav links */}
          <div style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: 2,
          }}>
            {NAV_KEYS.map(({ to, tKey, icon: Icon }) => {
              const active = isActive(to);
              return (
                <NavLink key={to} to={to} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 13px', borderRadius: 'var(--radius-sm)',
                  fontSize: 13, fontWeight: 500, textDecoration: 'none',
                  color: active ? 'var(--blue)' : 'var(--text-secondary)',
                  background: active ? 'var(--blue-bg)' : 'transparent',
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}>
                  <Icon size={14} strokeWidth={1.75} />
                  {t(tKey)}
                </NavLink>
              );
            })}
          </div>

          {/* Right — Lang toggle + Theme toggle + Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>

            {/* Lang switcher */}
            <div style={{ display: 'flex', gap: 3 }}>
              <button onClick={() => setLang('fr')} style={langBtnStyle('fr')}>FR</button>
              <button onClick={() => setLang('en')} style={langBtnStyle('en')}>EN</button>
            </div>

            {/* Theme toggle */}
            <button onClick={toggle} style={{
              background: 'none', border: 'none', padding: 4,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {theme === 'dark'
                ? <Sun  size={22} strokeWidth={1.75} color="var(--orange)" />
                : <Moon size={22} strokeWidth={1.75} color="var(--blue)"   />}
            </button>

            {/* Avatar dropdown */}
            <div ref={desktopDropRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setDesktopDrop((v) => !v)}
                style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <Avatar name={user?.name} size={32} fontSize={12} />
              </button>

              {desktopDrop && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'var(--bg-primary)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-card)', minWidth: 220,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.14)', zIndex: 200, overflow: 'hidden',
                }}>
                  <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={user?.name} size={40} fontSize={15} />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user?.name}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: 4 }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                        padding: '9px 12px', background: 'none', border: 'none',
                        borderRadius: 10, cursor: 'pointer',
                        fontSize: 13, fontWeight: 500, color: 'var(--red-text)',
                        textAlign: 'left', transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--red-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <LogOut size={14} strokeWidth={1.75} />
                      {t('nav.signOut')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ══ MOBILE BOTTOM TAB BAR (<md) ═══════════ */}
      <div className="md:hidden" style={{ position: 'fixed', bottom: 10, left: 10, right: 10, zIndex: 100 }}>

        {mobileDrop && (
          <div
            ref={mobileDropRef}
            style={{
              position: 'absolute', bottom: 'calc(100% + 8px)', right: 0,
              background: 'var(--bg-primary)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-card)', minWidth: 200,
              boxShadow: '0 -4px 24px rgba(0,0,0,0.16)', zIndex: 110, overflow: 'hidden',
            }}
          >
            <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={user?.name} size={38} fontSize={14} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
            {/* Lang switcher in mobile dropdown */}
            <div style={{ padding: '10px 16px 8px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6 }}>
              <button onClick={() => setLang('fr')} style={langBtnStyle('fr')}>FR</button>
              <button onClick={() => setLang('en')} style={langBtnStyle('en')}>EN</button>
            </div>
            <div style={{ padding: 4 }}>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 12px', background: 'none', border: 'none',
                  borderRadius: 10, cursor: 'pointer',
                  fontSize: 13, fontWeight: 500, color: 'var(--red-text)',
                  textAlign: 'left', transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--red-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <LogOut size={14} strokeWidth={1.75} />
                {t('nav.signOut')}
              </button>
            </div>
          </div>
        )}

        <div style={{
          background: 'var(--bg-primary)',
          borderRadius: 22,
          border: '1px solid var(--border)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.16)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-around',
          padding: '6px 4px 8px',
        }}>
          {NAV_KEYS.map(({ to, tKey, icon: Icon }) => {
            const active = isActive(to);
            const label  = t(tKey);
            // Shorten label for mobile tab bar
            const short  = label.length > 9 ? label.slice(0, 8) + '…' : label;
            return (
              <NavLink key={to} to={to} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '6px 10px', borderRadius: 14, textDecoration: 'none',
                background: active ? 'var(--blue-bg)' : 'transparent',
                transition: 'background 0.15s', minWidth: 52,
              }}>
                <Icon size={20} strokeWidth={1.5} color={active ? 'var(--blue)' : 'var(--text-secondary)'} />
                <span style={{
                  fontSize: 9.5, fontWeight: active ? 600 : 500,
                  color: active ? 'var(--blue)' : 'var(--text-secondary)',
                  letterSpacing: '0.01em', lineHeight: 1,
                }}>
                  {short}
                </span>
              </NavLink>
            );
          })}

          <button
            onClick={() => setMobileDrop((v) => !v)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '6px 10px', borderRadius: 14, background: mobileDrop ? 'var(--blue-bg)' : 'transparent',
              border: 'none', cursor: 'pointer', transition: 'background 0.15s', minWidth: 52,
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: mobileDrop ? 'var(--blue)' : 'var(--bg-tertiary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 8.5, fontWeight: 700, color: mobileDrop ? '#fff' : 'var(--text-secondary)',
              letterSpacing: '0.03em',
            }}>
              {getInitials(user?.name)}
            </div>
            <span style={{
              fontSize: 9.5, fontWeight: mobileDrop ? 600 : 500,
              color: mobileDrop ? 'var(--blue)' : 'var(--text-secondary)',
              letterSpacing: '0.01em', lineHeight: 1,
            }}>
              {t('nav.profile')}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
