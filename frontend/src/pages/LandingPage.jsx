import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  FileSpreadsheet,
  Gauge,
  LayoutDashboard,
  Languages,
  ListChecks,
  LineChart,
  LockKeyhole,
  MessageSquareText,
  Moon,
  PieChart,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  WalletCards,
} from 'lucide-react';
import './LandingPage.css';

const navItems = [
  { href: '#product', label: 'Product' },
  { href: '#difference', label: 'Difference' },
  { href: '#security', label: 'Security' },
  { href: '#faq', label: 'FAQ' },
];

const heroSignals = [
  { icon: Gauge, label: 'Monthly balance', value: '+1 240 EUR' },
  { icon: PieChart, label: 'Top spend', value: 'Housing' },
  { icon: Sparkles, label: 'AI signals', value: '4 ready' },
];

const productCards = [
  {
    icon: LineChart,
    label: 'Dashboard',
    title: 'See the month in one glance.',
    text: 'Income, expenses, balance, savings rate and recent activity stay visible without digging through tables.',
  },
  {
    icon: FileSpreadsheet,
    label: 'Transactions',
    title: 'Import and clean CSV data fast.',
    text: 'Upload bank exports, filter transactions and adjust categories when the automatic match needs your judgment.',
  },
  {
    icon: Target,
    label: 'Goals',
    title: 'Turn savings into a visible plan.',
    text: 'Create goals, add funds and watch progress move while the app keeps your available balance honest.',
  },
];

const timeline = [
  {
    step: '01',
    title: 'Import your money story',
    text: 'Bring transactions in through CSV and let the app normalize dates, amounts and income or expense direction.',
  },
  {
    step: '02',
    title: 'Let categories take shape',
    text: 'Rules catch common merchants instantly. AI helps with the unclear descriptions so the dashboard becomes useful faster.',
  },
  {
    step: '03',
    title: 'Ask better questions',
    text: 'The assistant answers from your current month: spending, balance, savings rate and category patterns.',
  },
];

const featureTabs = [
  {
    name: 'Overview',
    title: 'Your money, organized around decisions.',
    points: ['KPI cards for the month', 'Category breakdowns', 'Six-month evolution'],
  },
  {
    name: 'AI',
    title: 'Recommendations that know the context.',
    points: ['Savings-rate alerts', 'Food and subscription signals', 'French AI rewriting when available'],
  },
  {
    name: 'Control',
    title: 'You keep the final say.',
    points: ['Manual category override', 'Private routes by token', 'Demo data for fast review'],
  },
];

const comparisons = [
  ['What it shows', 'Transactions and totals', 'Monthly pace, categories and next actions'],
  ['Categorization', 'Manual work after import', 'Rules first, AI fallback when needed'],
  ['Goals', 'Separate notes or spreadsheets', 'Savings goals connected to balance'],
  ['Assistant', 'Generic finance chatbot', 'Answers grounded in your current financial data'],
  ['Experience', 'Desktop-only or mobile-only flow', 'Responsive web app with light and dark themes'],
];

const trustItems = [
  { icon: ShieldCheck, title: 'Authenticated access', text: 'Protected app routes use JWT sessions and profile validation.' },
  { icon: LockKeyhole, title: 'User isolation', text: 'Queries are scoped to the signed-in user for transactions, goals and insights.' },
  { icon: Languages, title: 'French and English', text: 'The interface includes a language switcher so the same app can serve both flows.' },
  { icon: Moon, title: 'Theme ready', text: 'Light and dark modes are already part of the core product experience.' },
];

const faqs = [
  {
    q: 'What does FinCoach do?',
    a: 'FinCoach helps users import spending data, understand monthly cash flow, organize categories, follow goals and ask an AI assistant about their finances.',
  },
  {
    q: 'Is the product already usable?',
    a: 'Yes. The app includes authentication, dashboard views, CSV import, transactions, savings goals, recommendations, an assistant and demo data.',
  },
  {
    q: 'Does it replace a bank account?',
    a: 'No. It is a personal finance layer for imported data and decision support. It does not move money or execute banking actions.',
  },
  {
    q: 'How do I try it?',
    a: 'Create an account or sign in, then use the dashboard demo loader or import a CSV file from the transactions page.',
  },
];

function ProductMockup() {
  return (
    <div className="landing-phone-shell" aria-label="FinCoach mobile dashboard preview">
      <div className="landing-phone">
        <div className="landing-phone-screen">
          <div className="landing-phone-status">
            <span>9:41</span>
            <span className="landing-dynamic-island" aria-hidden="true" />
            <div className="landing-status-icons" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="landing-mobile-header">
            <div className="landing-avatar">FA</div>
            <strong>Dashboard</strong>
            <div className="landing-header-actions">
              <span className="landing-bell-wrap">
                <Bell size={16} strokeWidth={1.9} />
                <small>4</small>
              </span>
              <span className="landing-theme-dot" />
            </div>
          </div>

          <h2 className="landing-mobile-greeting">Good afternoon, Sarah</h2>

          <div className="landing-mobile-alert">
            <span>
              <Sparkles size={15} strokeWidth={2} />
            </span>
            <div>
              <strong>AI recommendation ready</strong>
              <small>and 3 more insights</small>
            </div>
            <ChevronRight size={16} strokeWidth={2} />
          </div>

          <div className="landing-balance-card">
            <span>Total monthly balance</span>
            <strong>1 240,00 EUR</strong>
            <div>
              <p>
                <ArrowUpRight size={14} strokeWidth={2} />
                Income
                <b>3 250,00 EUR</b>
              </p>
              <p>
                <ArrowDownRight size={14} strokeWidth={2} />
                Expenses
                <b>2 010,00 EUR</b>
              </p>
            </div>
          </div>

          <div className="landing-mobile-actions">
            <article>
              <span className="landing-income-icon">
                <ArrowUpRight size={18} strokeWidth={2.1} />
              </span>
              <strong>Income</strong>
            </article>
            <article>
              <span className="landing-expense-icon">
                <ArrowDownRight size={18} strokeWidth={2.1} />
              </span>
              <strong>Expense</strong>
            </article>
          </div>

          <div className="landing-priority-card">
            <div>
              <span>
                <BrainCircuit size={16} strokeWidth={2} />
                Priority insight
              </span>
              <ChevronRight size={16} strokeWidth={2} />
            </div>
            <h3>Food spending is moving faster than usual</h3>
            <p>31% of this month’s expenses are in food. Set a weekly limit to stay on track.</p>
            <a href="#difference">View recommendations</a>
          </div>

          <div className="landing-mobile-tabs" aria-label="Mobile app navigation preview">
            <span className="is-active">
              <LayoutDashboard size={19} strokeWidth={2} />
              Dashboard
            </span>
            <span>
              <ListChecks size={19} strokeWidth={2} />
              Activity
            </span>
            <span>
              <Target size={19} strokeWidth={2} />
              Goals
            </span>
            <span>
              <Bot size={19} strokeWidth={2} />
              AI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WebDashboardMockup() {
  return (
    <div className="landing-device" aria-label="FinCoach web dashboard preview">
      <div className="landing-device-top">
        <div>
          <span className="landing-mini-label">This month</span>
          <strong>Financial overview</strong>
        </div>
        <span className="landing-status-pill">AI ready</span>
      </div>
      <div className="landing-kpi-grid">
        {heroSignals.map(({ icon: Icon, label, value }) => (
          <div className="landing-kpi" key={label}>
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="landing-chart-card">
        <div className="landing-chart-head">
          <span>Monthly evolution</span>
          <small>6 months</small>
        </div>
        <div className="landing-bars" aria-hidden="true">
          <span style={{ height: '42%' }} />
          <span style={{ height: '63%' }} />
          <span style={{ height: '50%' }} />
          <span style={{ height: '78%' }} />
          <span style={{ height: '58%' }} />
          <span style={{ height: '86%' }} />
        </div>
      </div>
      <div className="landing-ai-card">
        <Bot size={20} strokeWidth={1.8} />
        <div>
          <span>Recommendation</span>
          <p>Your savings rate is above target. Keep the same rhythm for the next two weeks.</p>
        </div>
      </div>
    </div>
  );
}

function MiniScreen({ tone, title, subtitle, icon: Icon }) {
  return (
    <div className={`landing-mini-screen landing-mini-screen-${tone}`}>
      <div className="landing-mini-screen-top">
        <Icon size={18} strokeWidth={1.8} />
        <span>{title}</span>
      </div>
      <p>{subtitle}</p>
      <div className="landing-screen-lines" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-nav">
        <a className="landing-brand" href="#top" aria-label="FinCoach home">
          <span className="landing-brand-mark">
            <TrendingUp size={18} strokeWidth={1.8} />
          </span>
          <span>FinCoach</span>
        </a>
        <nav className="landing-nav-links" aria-label="Landing navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>
        <div className="landing-nav-actions">
          <Link className="landing-link-button" to="/login">Sign in</Link>
          <Link className="landing-primary-button landing-small-button" to="/register">
            Start now
            <ArrowRight size={16} strokeWidth={1.9} />
          </Link>
        </div>
      </header>

      <main id="top">
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="landing-eyebrow">
              <BadgeCheck size={16} strokeWidth={1.8} />
              AI financial coach for the web
            </span>
            <h1>Know where your money goes before the month slips away.</h1>
            <p>
              FinCoach turns CSV transactions into a clear dashboard, useful categories,
              savings goals and AI answers grounded in your real monthly data.
            </p>
            <div className="landing-hero-actions">
              <Link className="landing-primary-button" to="/register">
                Create account
                <ArrowRight size={18} strokeWidth={1.9} />
              </Link>
              <Link className="landing-secondary-button" to="/login">
                Open the app
                <ChevronRight size={18} strokeWidth={1.9} />
              </Link>
            </div>
            <div className="landing-proof-row" aria-label="Product highlights">
              <span>CSV import</span>
              <span>AI recommendations</span>
              <span>Goals</span>
              <span>FR / EN</span>
            </div>
          </div>
          <div className="landing-hero-visual">
            <ProductMockup />
          </div>
        </section>

        <section className="landing-section landing-showcase" id="product">
          <div className="landing-section-head">
            <span className="landing-section-kicker">The real app</span>
            <h2>The product shows up early, because finance needs trust.</h2>
            <p>
              The landing focuses on screens and workflows that already exist in the app:
              dashboard, transactions, goals, recommendations and assistant.
            </p>
          </div>
          <div className="landing-web-preview">
            <ProductMockup />
          </div>
          <div className="landing-screen-grid">
            <MiniScreen
              tone="blue"
              title="Dashboard"
              subtitle="Income, spending, balance and category signals in one place."
              icon={LineChart}
            />
            <MiniScreen
              tone="green"
              title="Import"
              subtitle="Drop a CSV and let automatic categorization handle the first pass."
              icon={Upload}
            />
            <MiniScreen
              tone="purple"
              title="Assistant"
              subtitle="Ask how much you spent, what changed and where attention matters."
              icon={MessageSquareText}
            />
          </div>
        </section>

        <section className="landing-section landing-split">
          <div>
            <span className="landing-section-kicker">Why now</span>
            <h2>You do not need another app that only lists transactions.</h2>
            <p>
              Raw lists are useful for accountants. Everyday decisions need context:
              what changed, what deserves attention and what you can do next.
            </p>
          </div>
          <div className="landing-step-list">
            {timeline.map((item) => (
              <article className="landing-step" key={item.step}>
                <span>{item.step}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section landing-feature-band">
          <div className="landing-section-head landing-section-head-left">
            <span className="landing-section-kicker">Product</span>
            <h2>Everything important, inside a clear web interface.</h2>
          </div>
          <div className="landing-feature-layout">
            <div className="landing-feature-tabs">
              {featureTabs.map((item) => (
                <article className="landing-feature-tab" key={item.name}>
                  <span>{item.name}</span>
                  <h3>{item.title}</h3>
                  <ul>
                    {item.points.map((point) => (
                      <li key={point}>
                        <CheckCircle2 size={16} strokeWidth={1.9} />
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <div className="landing-insight-panel">
              <BrainCircuit size={30} strokeWidth={1.6} />
              <span>Context-aware AI</span>
              <h3>Ask questions against the month you are living in.</h3>
              <p>
                The assistant builds answers from your income, expenses, balance,
                savings rate and spending by category, then keeps responses short and practical.
              </p>
            </div>
          </div>
        </section>

        <section className="landing-section landing-comparison" id="difference">
          <div className="landing-section-head">
            <span className="landing-section-kicker">Difference</span>
            <h2>The difference is moving from data to decisions.</h2>
            <p>
              FinCoach does not stop at categorizing transactions. It connects tracking,
              signals, goals and AI so the next action is easier to see.
            </p>
          </div>
          <div className="landing-compare-table" role="table" aria-label="FinCoach comparison">
            <div className="landing-compare-row landing-compare-header" role="row">
              <span role="columnheader">Criteria</span>
              <span role="columnheader">Generic tools</span>
              <span role="columnheader">FinCoach</span>
            </div>
            {comparisons.map(([criteria, generic, financia]) => (
              <div className="landing-compare-row" role="row" key={criteria}>
                <span role="cell">{criteria}</span>
                <span role="cell">{generic}</span>
                <span role="cell">{financia}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-section landing-trust" id="security">
          <div className="landing-trust-copy">
            <span className="landing-section-kicker">Privacy and control</span>
            <h2>Your financial view should feel controlled, not mysterious.</h2>
            <p>
              The app uses protected routes, scoped API queries and clear local session
              handling so each user sees their own financial workspace.
            </p>
          </div>
          <div className="landing-trust-grid">
            {trustItems.map(({ icon: Icon, title, text }) => (
              <article className="landing-trust-item" key={title}>
                <Icon size={22} strokeWidth={1.8} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section landing-cta">
          <div>
            <span className="landing-section-kicker">Ready when you are</span>
            <h2>Start with demo data or import your first CSV.</h2>
            <p>
              Create an account, open the dashboard and use the demo loader to see the full
              experience before importing your own transactions.
            </p>
          </div>
          <div className="landing-cta-actions">
            <Link className="landing-primary-button" to="/register">
              Create account
              <ArrowRight size={18} strokeWidth={1.9} />
            </Link>
            <Link className="landing-secondary-button" to="/login">
              Sign in
              <ChevronRight size={18} strokeWidth={1.9} />
            </Link>
          </div>
        </section>

        <section className="landing-section landing-faq" id="faq">
          <div className="landing-section-head landing-section-head-left">
            <span className="landing-section-kicker">FAQ</span>
            <h2>The essentials, answered before sign-up.</h2>
          </div>
          <div className="landing-faq-grid">
            {faqs.map((item) => (
              <article className="landing-faq-item" key={item.q}>
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <a className="landing-brand" href="#top" aria-label="FinCoach home">
          <span className="landing-brand-mark">
            <WalletCards size={18} strokeWidth={1.8} />
          </span>
          <span>FinCoach</span>
        </a>
        <p>Personal finance with AI, built for clear decisions.</p>
        <div>
          <Link to="/login">Sign in</Link>
          <Link to="/register">Create account</Link>
        </div>
      </footer>
    </div>
  );
}
