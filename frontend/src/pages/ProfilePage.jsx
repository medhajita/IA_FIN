import { useState } from 'react';
import { AlertCircle, CheckCircle2, Lock, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CURRENCIES, useCurrency } from '../context/CurrencyContext';
import { updateProfile } from '../services/profileService';
import { Badge, Button, Card, CardHead, Field, Input, Page, PageHeader, Select } from '../components/fincoach/FinCoachUI';

function fullName(user) {
  if (user?.name) return user.name;
  if (user?.first_name || user?.last_name) return `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
  return 'Anika Sharma';
}

function initials(name) {
  return name.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
}

function Notice({ message }) {
  if (!message) return null;
  return (
    <div className={`fc-notice ${message.ok ? 'success' : 'error'}`}>
      {message.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {message.text}
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const name = fullName(user);
  const [infoForm, setInfoForm] = useState({ phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [infoMsg, setInfoMsg] = useState(null);
  const [pwMsg, setPwMsg] = useState(null);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  async function handleInfoSave(e) {
    e.preventDefault();
    setSavingInfo(true);
    setInfoMsg(null);
    try {
      await updateProfile({ phone: infoForm.phone || null });
      updateUser({ phone: infoForm.phone || null });
      setInfoMsg({ ok: true, text: 'Profile updated.' });
    } catch {
      setInfoMsg({ ok: false, text: 'Could not update the profile.' });
    } finally {
      setSavingInfo(false);
    }
  }

  async function handlePwSave(e) {
    e.preventDefault();
    setPwMsg(null);
    if (!pwForm.current) return setPwMsg({ ok: false, text: 'Current password is required.' });
    if (pwForm.next !== pwForm.confirm) return setPwMsg({ ok: false, text: 'Passwords do not match.' });
    if (pwForm.next.length < 6) return setPwMsg({ ok: false, text: 'Use at least 6 characters.' });
    setSavingPw(true);
    try {
      await updateProfile({ current_password: pwForm.current, new_password: pwForm.next });
      setPwForm({ current: '', next: '', confirm: '' });
      setPwMsg({ ok: true, text: 'Password updated.' });
    } catch (err) {
      setPwMsg({ ok: false, text: err.response?.data?.error || 'Could not update the password.' });
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <Page>
      <PageHeader title="Profile" actions={<Badge tone="green">Protected account</Badge>} />

      <div className="fc-grid fc-two-one" style={{ alignItems: 'start', gap: 12 }}>
        {/* Left column: Personal info + Password */}
        <div className="fc-grid" style={{ alignSelf: 'start', gap: 10 }}>
          <Card>
            <CardHead title="Personal information" />
            <Notice message={infoMsg} />
            <form onSubmit={handleInfoSave} className="fc-form-grid" style={{ gap: 10 }}>
              <Field label="First name"><Input value={user?.first_name || ''} readOnly /></Field>
              <Field label="Last name"><Input value={user?.last_name || ''} readOnly /></Field>
              <Field label="Email"><Input value={user?.email || ''} readOnly /></Field>
              <Field label="Phone">
                <Input type="tel" value={infoForm.phone} onChange={(e) => setInfoForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="+1 555 0100" />
              </Field>
              <div style={{ gridColumn: '1 / -1' }}>
                <Button disabled={savingInfo}>{savingInfo ? 'Saving...' : 'Save profile'}</Button>
              </div>
            </form>
          </Card>

          <Card>
            <CardHead title="Password" />
            <Notice message={pwMsg} />
            <form onSubmit={handlePwSave} className="fc-form-grid" style={{ gap: 10 }}>
              <Field label="Current password"><Input type="password" value={pwForm.current} onChange={(e) => setPwForm((prev) => ({ ...prev, current: e.target.value }))} /></Field>
              <Field label="New password"><Input type="password" value={pwForm.next} onChange={(e) => setPwForm((prev) => ({ ...prev, next: e.target.value }))} /></Field>
              <Field label="Confirm password"><Input type="password" value={pwForm.confirm} onChange={(e) => setPwForm((prev) => ({ ...prev, confirm: e.target.value }))} /></Field>
              <div style={{ display: 'flex', alignItems: 'end' }}>
                <Button disabled={savingPw}><Lock size={16} />{savingPw ? 'Saving...' : 'Update password'}</Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right column: Currency + Security */}
        <div className="fc-grid" style={{ alignSelf: 'start', gap: 10 }}>
          <Card>
            <CardHead title="Currency" subtitle="Preferred display currency" />
            <Field label="Display currency">
              <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {CURRENCIES.map(({ code, symbol, label }) => (
                  <option key={code} value={code}>{symbol} {code} — {label}</option>
                ))}
              </Select>
            </Field>
          </Card>

          <Card>
            <CardHead title="Security state" />
            <div className="fc-list">
              {[
                ['Authenticated session', 'JWT protected routes', ShieldCheck],
                ['Verified email', user?.email || 'anika@fincoach.app', Mail],
                ['Profile phone', infoForm.phone || 'Not added yet', Phone],
                ['Private identity', 'Only visible to you', UserRound],
              ].map(([label, value, Icon]) => (
                <div className="fc-list-item" key={label}>
                  <span className="fc-item-icon" style={{ color: 'var(--fc-green)' }}><Icon size={18} /></span>
                  <div><strong>{label}</strong><span>{value}</span></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}
