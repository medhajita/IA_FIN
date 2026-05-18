import { Bell, Database, Lock, Moon, ShieldCheck, SlidersHorizontal, Sparkles, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Badge, Button, Card, CardHead, Field, Input, Page, PageHeader, Select } from '../components/fincoach/FinCoachUI';

function getName(user) {
  if (user?.name) return user.name;
  if (user?.first_name || user?.last_name) return `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
  return 'Anika Sharma';
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <Page>
      <PageHeader
        title="Settings"
        subtitle="Tune your FinCoach workspace, security and AI preferences"
        actions={<Badge tone={theme === 'dark' ? 'purple' : 'blue'}>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</Badge>}
      />

      <div className="fc-grid fc-two-one">
        <div className="fc-grid">
          <Card>
            <CardHead title="Profile" subtitle="Visible identity and contact details" />
            <div className="fc-form-grid">
              <Field label="Name"><Input defaultValue={getName(user)} /></Field>
              <Field label="Email"><Input defaultValue={user?.email || 'anika@fincoach.app'} /></Field>
              <Field label="Currency">
                <Select defaultValue="USD">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="MAD">MAD</option>
                </Select>
              </Field>
              <Field label="Month starts on">
                <Select defaultValue="1">
                  <option value="1">1st day</option>
                  <option value="payday">Payday</option>
                </Select>
              </Field>
            </div>
            <div style={{ marginTop: 18 }}><Button>Save settings</Button></div>
          </Card>

          <Card>
            <CardHead title="AI Preferences" subtitle="Control how FinCoach explains and predicts" />
            <div className="fc-settings-list">
              {[
                ['Proactive insights', 'Send alerts when spending changes suddenly.', Sparkles],
                ['Category learning', 'Improve merchant rules after every correction.', SlidersHorizontal],
                ['Financial summaries', 'Generate weekly and monthly summaries.', Database],
              ].map(([title, text, Icon]) => (
                <div className="fc-setting-row" key={title}>
                  <span className="fc-item-icon" style={{ color: 'var(--fc-purple)' }}><Icon size={19} /></span>
                  <div><strong>{title}</strong><span>{text}</span></div>
                  <span className="fc-switch active"><span /></span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="fc-grid">
          <Card>
            <CardHead title="Appearance" />
            <button type="button" className="fc-setting-row" onClick={toggle}>
              <span className="fc-item-icon" style={{ color: 'var(--fc-blue)' }}><Moon size={19} /></span>
              <div><strong>Dark Mode</strong><span>Switch between light and dark FinCoach.</span></div>
              <span className="fc-switch"><span /></span>
            </button>
          </Card>

          <Card>
            <CardHead title="Security" />
            <div className="fc-list">
              {[
                ['Protected routes', 'JWT session required', ShieldCheck],
                ['Notifications', 'Spending alerts enabled', Bell],
                ['Profile access', 'Private account settings', UserRound],
                ['Password', 'Change from profile page', Lock],
              ].map(([title, text, Icon]) => (
                <div className="fc-list-item" key={title}>
                  <span className="fc-item-icon" style={{ color: 'var(--fc-green)' }}><Icon size={18} /></span>
                  <div><strong>{title}</strong><span>{text}</span></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
