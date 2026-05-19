import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpDown,
  BadgeCheck,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Languages,
  LayoutDashboard,
  LockKeyhole,
  Moon,
  ShieldCheck,
  Sun,
  Target,
} from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';
import './LandingPage.css';

const screenKeys = ['dashboard', 'transactions', 'goals', 'assistant', 'profile'];

const trustIcons = {
  shield: ShieldCheck,
  lock: LockKeyhole,
  lang: Languages,
  moon: Moon,
};

const featureIcons = {
  overview: LayoutDashboard,
  transactions: ArrowUpDown,
  goals: Target,
  ai: BrainCircuit,
};

const landingCopy = {
  en: {
    meta: {
      signIn: 'Sign in',
      start: 'Start now',
      create: 'Create account',
      open: 'Open the app',
      langLabel: 'Landing language',
      themeLabel: 'Switch landing theme',
      light: 'Light',
      dark: 'Dark',
      brandAria: 'FinCoach home',
      navAria: 'Landing navigation',
      productHighlights: 'Product highlights',
      comparisonAria: 'FinCoach comparison',
    },
    nav: [
      { href: '#product', label: 'Product' },
      { href: '#difference', label: 'Difference' },
      { href: '#security', label: 'Security' },
      { href: '#faq', label: 'FAQ' },
    ],
    hero: {
      eyebrow: 'AI that turns spending into decisions',
      title: 'Know where your money goes before the month slips away.',
      text: 'FinCoach turns CSV transactions into a clear dashboard, useful categories, savings goals and AI answers grounded in your real monthly data.',
      proof: ['CSV import', 'AI recommendations', 'Goals'],
    },
    screens: {
      dashboard: {
        title: 'Dashboard',
        kicker: '01 / First screen',
        text: 'The real mobile dashboard with KPIs, period control, category chart and bottom navigation.',
      },
      transactions: {
        title: 'Transactions',
        kicker: '02 / Money flow',
        text: 'Import CSV, filter by type and review every recent expense or income item from mobile.',
      },
      goals: {
        title: 'Goals',
        kicker: '03 / Savings',
        text: 'Savings goals stay connected to the available balance, progress and target dates.',
      },
      assistant: {
        title: 'AI Assistant',
        kicker: '04 / Guidance',
        text: "The assistant answers from the user's current financial data and keeps quick prompts close at hand.",
      },
      profile: {
        title: 'Profile',
        kicker: '05 / Account',
        text: 'A clean account page for personal details, password changes and session control.',
      },
    },
    showcase: {
      kicker: 'Product tour',
      title: 'FinCoach, shown through the app itself.',
      text: 'Explore the dashboard, transaction flow and savings goals through screens captured directly from the project.',
    },
    timelineIntro: {
      kicker: 'How it works',
      title: 'From CSV import to clearer financial decisions.',
      text: 'FinCoach connects transactions, categories, goals and AI insights so each monthly view is easier to understand and act on.',
    },
    timeline: [
      {
        step: '01',
        title: 'Import your money story',
        text: 'Bring transactions in through CSV and let the app normalize dates, amounts and income or expense direction.',
      },
      {
        step: '02',
        title: 'Let categories take shape',
        text: 'Rules catch common merchants instantly. AI helps with unclear descriptions so the dashboard becomes useful faster.',
      },
      {
        step: '03',
        title: 'Ask better questions',
        text: 'The assistant answers from your current month: spending, balance, savings rate and category patterns.',
      },
    ],
    product: {
      kicker: 'Product',
      title: 'Your money, organized at a glance.',
      insightLabel: 'Context-aware AI',
      insightTitle: 'Ask questions against the month you are living in.',
      insightText: 'The assistant builds answers from your income, expenses, balance, savings rate and spending by category, then keeps responses short and practical.',
    },
    featureTabs: [
      {
        name: 'Overview',
        title: 'Your money, organized at a glance.',
        points: ['Monthly KPIs', 'Category breakdowns', 'Signals that show what deserves attention'],
      },
      {
        name: 'AI',
        title: 'An AI that understands your finances.',
        points: ['Answers grounded in your data', 'Spending and savings signals', 'French and English answers'],
      },
      {
        name: 'Control',
        title: 'Transactions that stay under control.',
        points: ['CSV import', 'Manual category override', 'Private routes by token'],
      },
    ],
    difference: {
      kicker: 'Difference',
      title: 'The difference is moving from data to decisions.',
      text: 'FinCoach does not stop at categorizing transactions. It connects tracking, signals, goals and AI so the next action is easier to see.',
      headers: ['Criteria', 'Generic tools', 'FinCoach'],
      rows: [
        ['What it shows', 'Transactions and totals', 'Monthly pace, categories and next actions'],
        ['Categorization', 'Manual work after import', 'Rules first, AI fallback when needed'],
        ['Goals', 'Separate notes or spreadsheets', 'Savings goals connected to balance'],
        ['Assistant', 'Generic finance chatbot', 'Answers grounded in your current financial data'],
        ['Experience', 'Desktop-only or mobile-only flow', 'Responsive web app with light and dark themes'],
      ],
    },
    trustIntro: {
      kicker: 'Privacy and control',
      title: 'Your financial view should feel controlled, not mysterious.',
      text: 'The app uses protected routes, scoped API queries and clear local session handling so each user sees their own financial workspace.',
    },
    trustItems: [
      { icon: 'shield', title: 'Authenticated access', text: 'Protected app routes use JWT sessions and profile validation.' },
      { icon: 'lock', title: 'User isolation', text: 'Queries are scoped to the signed-in user for transactions, goals and insights.' },
      { icon: 'lang', title: 'French and English', text: 'The interface includes a language switcher so the same app can serve both flows.' },
      { icon: 'moon', title: 'Light and dark themes', text: 'The interface adapts to both visual modes across the landing and the app screens.' },
    ],
    cta: {
      kicker: 'Your FinCoach workspace',
      title: 'Open FinCoach and bring your first month into view.',
      text: 'Create an account, load demo data or import a CSV, then review your dashboard, transactions, goals and AI recommendations.',
    },
    faqIntro: {
      kicker: 'FAQ',
      title: 'The essentials, answered before sign-up.',
    },
    faqs: [
      {
        q: 'What does FinCoach do?',
        a: 'FinCoach helps users import spending data, understand monthly cash flow, organize categories, follow goals and ask an AI assistant about their finances.',
      },
      {
        q: 'What can I do inside FinCoach?',
        a: 'You can create an account, import CSV transactions, review the dashboard, manage goals, read recommendations and ask the AI assistant about your finances.',
      },
      {
        q: 'Does it replace a bank account?',
        a: 'No. It is a personal finance layer for imported data and decision support. It does not move money or execute banking actions.',
      },
      {
        q: 'How do I try it?',
        a: 'Create an account or sign in, then use the dashboard demo loader or import a CSV file from the transactions page.',
      },
    ],
    footer: {
      text: 'Personal finance with AI, built for clear decisions every month.',
      productTitle: 'Product',
      trustTitle: 'Trust',
      accessTitle: 'Access',
      trustItems: ['Protected routes', 'User-scoped data', 'Light and dark UI'],
      note: 'CSV import, goals, recommendations and AI answers in one clear workspace.',
      copyright: 'FinCoach. Clear money decisions, every month.',
    },
  },
  fr: {
    meta: {
      signIn: 'Se connecter',
      start: 'Commencer',
      create: 'Créer un compte',
      open: "Ouvrir l'app",
      langLabel: 'Langue de la landing',
      themeLabel: 'Changer le thème de la landing',
      light: 'Clair',
      dark: 'Sombre',
      brandAria: 'Accueil FinCoach',
      navAria: 'Navigation de la landing',
      productHighlights: 'Points forts du produit',
      comparisonAria: 'Comparaison FinCoach',
    },
    nav: [
      { href: '#product', label: 'Produit' },
      { href: '#difference', label: 'Différence' },
      { href: '#security', label: 'Sécurité' },
      { href: '#faq', label: 'FAQ' },
    ],
    hero: {
      eyebrow: "L'IA qui transforme vos dépenses en décisions",
      title: "Comprenez où va votre argent avant la fin du mois.",
      text: "FinCoach transforme vos transactions CSV en tableau de bord clair, catégories utiles, objectifs d'épargne et réponses IA basées sur vos vraies données mensuelles.",
      proof: ['Import CSV', 'Recommandations IA', 'Objectifs'],
    },
    screens: {
      dashboard: {
        title: 'Tableau de bord',
        kicker: '01 / Premier écran',
        text: 'Le vrai tableau de bord mobile avec KPIs, période, graphique par catégorie et navigation basse.',
      },
      transactions: {
        title: 'Transactions',
        kicker: "02 / Flux d'argent",
        text: 'Importez un CSV, filtrez par type et consultez chaque dépense ou revenu depuis le mobile.',
      },
      goals: {
        title: 'Objectifs',
        kicker: '03 / Épargne',
        text: 'Les objectifs restent reliés au solde disponible, à la progression et aux dates cibles.',
      },
      assistant: {
        title: 'Assistant IA',
        kicker: '04 / Guidance',
        text: "L'assistant répond à partir des données financières actuelles et propose des questions rapides.",
      },
      profile: {
        title: 'Profil',
        kicker: '05 / Compte',
        text: 'Une page de compte claire pour les informations personnelles, le mot de passe et la session.',
      },
    },
    showcase: {
      kicker: 'Visite du produit',
      title: "FinCoach se présente par l'application.",
      text: 'Découvrez le tableau de bord, les transactions et les objectifs à travers les écrans capturés directement depuis le projet.',
    },
    timelineIntro: {
      kicker: 'Comment ça marche',
      title: 'De l’import CSV à des décisions financières plus claires.',
      text: 'FinCoach relie transactions, catégories, objectifs et insights IA pour rendre chaque vue mensuelle plus simple à comprendre et à utiliser.',
    },
    timeline: [
      {
        step: '01',
        title: 'Importez votre histoire financière',
        text: "Ajoutez vos transactions en CSV et laissez l'app normaliser les dates, montants, revenus et dépenses.",
      },
      {
        step: '02',
        title: 'Laissez les catégories se construire',
        text: "Les règles reconnaissent les marchands courants. L'IA aide pour les descriptions moins claires.",
      },
      {
        step: '03',
        title: 'Posez de meilleures questions',
        text: "L'assistant répond depuis votre mois en cours: dépenses, solde, taux d'épargne et catégories.",
      },
    ],
    product: {
      kicker: 'Produit',
      title: "Votre argent organisé en un coup d'œil.",
      insightLabel: 'IA avec contexte',
      insightTitle: 'Posez vos questions sur le mois que vous êtes en train de vivre.',
      insightText: "L'assistant construit ses réponses depuis vos revenus, dépenses, solde, taux d'épargne et catégories, puis reste court et pratique.",
    },
    featureTabs: [
      {
        name: 'Vue globale',
        title: "Votre argent organisé en un coup d'œil.",
        points: ['KPIs du mois', 'Répartition par catégorie', "Signaux qui montrent ce qui mérite attention"],
      },
      {
        name: 'IA',
        title: 'Une IA qui comprend vos finances.',
        points: ['Réponses basées sur vos données', 'Signaux dépenses et épargne', 'Réponses en français et anglais'],
      },
      {
        name: 'Contrôle',
        title: 'Des transactions toujours sous contrôle.',
        points: ['Import CSV', 'Correction manuelle des catégories', 'Routes privées par token'],
      },
    ],
    difference: {
      kicker: 'Différence',
      title: 'La vraie différence: passer des données aux décisions.',
      text: "FinCoach ne s'arrête pas à catégoriser. Il relie suivi, signaux, objectifs et IA pour rendre la prochaine action plus visible.",
      headers: ['Critère', 'Outils classiques', 'FinCoach'],
      rows: [
        ['Ce que ça montre', 'Transactions et totaux', 'Rythme du mois, catégories et actions'],
        ['Catégorisation', 'Travail manuel après import', "Règles d'abord, IA si nécessaire"],
        ['Objectifs', 'Notes ou tableurs séparés', 'Objectifs reliés au solde'],
        ['Assistant', 'Chatbot financier générique', 'Réponses basées sur vos données actuelles'],
        ['Expérience', 'Flux seulement desktop ou mobile', 'App web responsive avec thèmes clair et sombre'],
      ],
    },
    trustIntro: {
      kicker: 'Confidentialité et contrôle',
      title: 'Votre vue financière doit être maîtrisée, pas mystérieuse.',
      text: "L'app utilise des routes protégées, des requêtes API limitées à l'utilisateur et une session locale claire.",
    },
    trustItems: [
      { icon: 'shield', title: 'Accès authentifié', text: 'Les routes privées utilisent des sessions JWT et la validation du profil.' },
      { icon: 'lock', title: 'Données isolées', text: "Les transactions, objectifs et insights restent liés à l'utilisateur connecté." },
      { icon: 'lang', title: 'Français et anglais', text: 'Le sélecteur de langue permet de servir les deux parcours dans la même app.' },
      { icon: 'moon', title: 'Thèmes clair et sombre', text: "L'interface s'adapte aux deux modes visuels sur la landing et dans les écrans de l'app." },
    ],
    cta: {
      kicker: 'Votre espace FinCoach',
      title: 'Ouvrez FinCoach et mettez votre mois en clair.',
      text: 'Créez un compte, chargez la démo ou importez un CSV, puis consultez tableau de bord, transactions, objectifs et recommandations IA.',
    },
    faqIntro: {
      kicker: 'FAQ',
      title: "L'essentiel avant de créer un compte.",
    },
    faqs: [
      {
        q: 'À quoi sert FinCoach ?',
        a: 'FinCoach aide à importer les dépenses, comprendre le mois, organiser les catégories, suivre les objectifs et interroger un assistant IA.',
      },
      {
        q: 'Que peut-on faire dans FinCoach ?',
        a: "Vous pouvez créer un compte, importer des transactions CSV, consulter le tableau de bord, gérer les objectifs, lire les recommandations et interroger l'assistant IA.",
      },
      {
        q: 'Est-ce que ça remplace une banque ?',
        a: "Non. C'est une couche de finances personnelles pour les données importées et l'aide à la décision. L'app ne déplace pas d'argent.",
      },
      {
        q: 'Comment essayer ?',
        a: 'Créez un compte ou connectez-vous, puis utilisez la démo du tableau de bord ou importez un CSV depuis Transactions.',
      },
    ],
    footer: {
      text: 'Finances personnelles avec IA, conçues pour décider clairement chaque mois.',
      productTitle: 'Produit',
      trustTitle: 'Confiance',
      accessTitle: 'Accès',
      trustItems: ['Routes protégées', 'Données isolées', 'Interface claire et sombre'],
      note: 'Import CSV, objectifs, recommandations et réponses IA dans un espace clair.',
      copyright: 'FinCoach. Des décisions financières plus claires, chaque mois.',
    },
  },
};

function getScreens(copy, theme, lang) {
  return screenKeys.map((key) => ({
    key,
    ...copy.screens[key],
    src: `/landing/screens/${key}-${theme}-${lang}.png`,
  }));
}

export function PhoneFrame({ screen, priority = false, size = 'md' }) {
  return (
    <div className={`landing-phone-shot landing-phone-shot-${size} landing-phone-shot-${screen.key}`}>
      <div className="landing-phone-device" aria-label={`${screen.title} mobile app screenshot`}>
        <span className="landing-device-side landing-device-side-left" aria-hidden="true" />
        <span className="landing-device-side landing-device-side-right" aria-hidden="true" />
        <div className="landing-real-screen">
          <div className="landing-ios-status" aria-hidden="true">
            <span>9:41</span>
            <span className="landing-real-island" />
            <div className="landing-real-status-icons">
              <svg className="landing-status-signal" viewBox="0 0 18 14" focusable="false">
                <rect x="1" y="8" width="3" height="6" rx="1.5" />
                <rect x="5.5" y="5.5" width="3" height="8.5" rx="1.5" />
                <rect x="10" y="3" width="3" height="11" rx="1.5" />
                <rect x="14.5" y="0.5" width="3" height="13.5" rx="1.5" />
              </svg>
              <svg className="landing-status-wifi" viewBox="0 0 20 14" focusable="false">
                <path d="M10 13.3a2.15 2.15 0 1 0 0-4.3 2.15 2.15 0 0 0 0 4.3Z" />
                <path d="M5.35 7.55a6.58 6.58 0 0 1 9.3 0l-2.22 2.22a3.45 3.45 0 0 0-4.86 0L5.35 7.55Z" />
                <path d="M1.45 3.65a12.1 12.1 0 0 1 17.1 0l-2.22 2.22a8.97 8.97 0 0 0-12.66 0L1.45 3.65Z" />
              </svg>
              <svg className="landing-status-battery" viewBox="0 0 29 15" focusable="false">
                <rect x="1.5" y="2" width="22" height="11" rx="5.5" />
                <rect x="24.8" y="5" width="2.7" height="5" rx="1.35" />
                <path d="M13.25 3.2 8.8 8.15h3.32l-1.45 3.65 4.85-5.28h-3.28l1.01-3.32Z" />
              </svg>
            </div>
          </div>
          <div className="landing-real-shot-wrap">
            <img
              src={screen.src}
              alt={`${screen.title} page in the FinCoach mobile app`}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { theme, toggle } = useTheme();
  const { lang, setLang } = useI18n();
  const copy = landingCopy[lang] || landingCopy.fr;
  const appScreens = getScreens(copy, theme, lang);
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState(1);

  const isFr = lang === 'fr';
  const featureSections = [
    {
      tag: copy.featureTabs[0].name,
      title: copy.featureTabs[0].title,
      desc: copy.featureTabs[0].points[0],
      points: copy.featureTabs[0].points,
      screenKey: 'dashboard',
      iconKey: 'overview',
    },
    {
      tag: copy.screens.transactions.title,
      title: isFr ? 'Toutes vos transactions, filtrées et claires.' : 'All your transactions, filtered and clear.',
      desc: copy.screens.transactions.text,
      points: copy.featureTabs[2].points,
      screenKey: 'transactions',
      iconKey: 'transactions',
    },
    {
      tag: copy.screens.goals.title,
      title: isFr ? "Objectifs reliés à votre solde réel." : 'Goals connected to your real balance.',
      desc: copy.screens.goals.text,
      points: [
        isFr ? 'Progression en temps réel' : 'Real-time progress',
        isFr ? 'Relié au solde disponible' : 'Connected to balance',
        isFr ? 'Dates cibles personnalisées' : 'Custom target dates',
      ],
      screenKey: 'goals',
      iconKey: 'goals',
    },
    {
      tag: copy.featureTabs[1].name,
      title: copy.featureTabs[1].title,
      desc: copy.featureTabs[1].points[0],
      points: copy.featureTabs[1].points,
      screenKey: 'assistant',
      iconKey: 'ai',
    },
  ];

  const activeScreen = appScreens.find(s => s.key === featureSections[activeTab].screenKey) || appScreens[0];

  return (
    <div className={`landing-page landing-page-${theme}`}>
      <header className="landing-nav">
        <a className="landing-brand" href="#top" aria-label={copy.meta.brandAria}>
          <span className="landing-brand-mark">
            <img src="/favicon.svg" alt="" aria-hidden="true" />
          </span>
          <span>FinCoach</span>
        </a>
        <nav className="landing-nav-links" aria-label={copy.meta.navAria}>
          {copy.nav.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>
        <div className="landing-nav-actions">
          <div className="landing-mode-switch" aria-label={copy.meta.langLabel}>
            <button type="button" className={lang === 'fr' ? 'is-active' : ''} onClick={() => setLang('fr')} aria-pressed={lang === 'fr'}>
              FR
            </button>
            <button type="button" className={lang === 'en' ? 'is-active' : ''} onClick={() => setLang('en')} aria-pressed={lang === 'en'}>
              EN
            </button>
          </div>
          <button type="button" className="landing-theme-button" onClick={toggle} aria-label={copy.meta.themeLabel}>
            {isDark ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
            <span>{isDark ? copy.meta.light : copy.meta.dark}</span>
          </button>
        </div>
      </header>

      <main id="top">
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="landing-eyebrow">
              <BadgeCheck size={16} strokeWidth={1.8} />
              {copy.hero.eyebrow}
            </span>
            <h1>{copy.hero.title}</h1>
            <p>{copy.hero.text}</p>
            <div className="landing-hero-actions">
              <Link className="landing-primary-button" to="/register">
                {copy.meta.create}
                <ArrowRight size={18} strokeWidth={1.9} />
              </Link>
              <Link className="landing-secondary-button" to="/login">
                {copy.meta.open}
                <ChevronRight size={18} strokeWidth={1.9} />
              </Link>
            </div>
            <div className="landing-proof-row" aria-label={copy.meta.productHighlights}>
              {copy.hero.proof.map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>
          <div className="landing-hero-visual">
            <PhoneFrame screen={appScreens[0]} priority />
          </div>
        </section>

        <section className="landing-section landing-showcase" id="product">
          <div className="landing-section-head">
            <span className="landing-section-kicker">{copy.showcase.kicker}</span>
            <h2>{copy.showcase.title}</h2>
            <p>{copy.showcase.text}</p>
          </div>
          <div className="landing-3phones">
            {[
              { key: 'transactions' },
              { key: 'dashboard' },
              { key: 'goals' },
            ].map(({ key }) => {
              const s = appScreens.find(sc => sc.key === key);
              return (
                <div key={key} className="landing-3phone-wrap">
                  <PhoneFrame screen={s} size="md" />
                  <div className="landing-3phone-label">
                    <span className="landing-3phone-tag">{s.kicker.split(' / ')[1] || s.title}</span>
                    <p>{s.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="landing-section landing-split landing-process">
          <div>
            <span className="landing-section-kicker">{copy.timelineIntro.kicker}</span>
            <h2>{copy.timelineIntro.title}</h2>
            <p>{copy.timelineIntro.text}</p>
          </div>
          <div className="landing-step-list">
            {copy.timeline.map((item) => (
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

        <section className="landing-section landing-feat3-section" id="focus">
          <div className="landing-section-head">
            <span className="landing-section-kicker">{copy.product.kicker}</span>
            <h2>{copy.product.title}</h2>
          </div>
          <div className="landing-feat3-layout">
            <div className="landing-feat3-tabs">
              {featureSections.map((tab, i) => {
                const Icon = featureIcons[tab.iconKey];
                return (
                  <button
                    key={tab.tag}
                    className={`landing-feat3-tab${activeTab === i ? ' is-active' : ''}`}
                    onClick={() => setActiveTab(i)}
                  >
                    <div className="landing-feat3-tab-icon">
                      <Icon size={18} strokeWidth={1.8} />
                    </div>
                    <div className="landing-feat3-tab-body">
                      <span className="landing-feat3-tab-name">{tab.tag}</span>
                      <strong className="landing-feat3-tab-title">{tab.title}</strong>
                      <p className="landing-feat3-tab-text">{tab.desc}</p>
                    </div>
                    <ChevronRight size={16} strokeWidth={2} className="landing-feat3-arrow" />
                  </button>
                );
              })}
            </div>
            <div className="landing-feat3-phone">
              <PhoneFrame key={activeScreen?.key} screen={activeScreen} size="lg" priority />
            </div>
            <div className="landing-feat3-pills">
              {featureSections[activeTab].points.map((point) => (
                <div key={point} className="landing-feat3-pill">
                  <CheckCircle2 size={15} strokeWidth={2} />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section landing-comparison" id="difference">
          <div className="landing-section-head">
            <span className="landing-section-kicker">{copy.difference.kicker}</span>
            <h2>{copy.difference.title}</h2>
            <p>{copy.difference.text}</p>
          </div>
          <div className="landing-compare-table" role="table" aria-label={copy.meta.comparisonAria}>
            <div className="landing-compare-row landing-compare-header" role="row">
              {copy.difference.headers.map((header) => <span role="columnheader" key={header}>{header}</span>)}
            </div>
            {copy.difference.rows.map(([criteria, generic, fincoach]) => (
              <div className="landing-compare-row" role="row" key={criteria}>
                <span role="cell">{criteria}</span>
                <span role="cell">{generic}</span>
                <span className="landing-compare-win" role="cell">
                  <CheckCircle2 size={17} strokeWidth={2.1} />
                  <span>{fincoach}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-section landing-trust" id="security">
          <div className="landing-trust-copy">
            <span className="landing-section-kicker">{copy.trustIntro.kicker}</span>
            <h2>{copy.trustIntro.title}</h2>
            <p>{copy.trustIntro.text}</p>
          </div>
          <div className="landing-trust-grid">
            {copy.trustItems.map(({ icon, title, text }) => {
              const Icon = trustIcons[icon];
              return (
                <article className="landing-trust-item" key={title}>
                  <span className="landing-trust-icon">
                    <Icon size={20} strokeWidth={1.9} />
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="landing-section landing-cta">
          <div>
            <span className="landing-section-kicker">{copy.cta.kicker}</span>
            <h2>{copy.cta.title}</h2>
            <p>{copy.cta.text}</p>
          </div>
          <div className="landing-cta-actions">
            <Link className="landing-primary-button" to="/register">
              {copy.meta.create}
              <ArrowRight size={18} strokeWidth={1.9} />
            </Link>
            <Link className="landing-secondary-button" to="/login">
              {copy.meta.signIn}
              <ChevronRight size={18} strokeWidth={1.9} />
            </Link>
          </div>
        </section>

        <section className="landing-section landing-faq" id="faq">
          <div className="landing-section-head landing-section-head-left">
            <span className="landing-section-kicker">{copy.faqIntro.kicker}</span>
            <h2>{copy.faqIntro.title}</h2>
          </div>
          <div className="landing-faq-grid">
            {copy.faqs.map((item, index) => (
              <article className="landing-faq-item" key={item.q}>
                <div className="landing-faq-question">
                  <span className="landing-faq-index">{String(index + 1).padStart(2, '0')}</span>
                  <h3>{item.q}</h3>
                </div>
                <p>{item.a}</p>
              </article>
            ))}
          </div>
        </section>

      </main>

      <footer className="landing-footer">
        <div className="landing-footer-panel">
          <div className="landing-footer-brand">
            <a className="landing-brand" href="#top" aria-label={copy.meta.brandAria}>
              <span className="landing-brand-mark">
                <img src="/favicon.svg" alt="" aria-hidden="true" />
              </span>
              <span>FinCoach</span>
            </a>
            <p>{copy.footer.text}</p>
            <div className="landing-footer-badges">
              {copy.hero.proof.map((item) => (
                <span key={item}>
                  <BadgeCheck size={14} strokeWidth={2} />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <nav className="landing-footer-column" aria-label={copy.meta.navAria}>
            <h3>{copy.footer.productTitle}</h3>
            {copy.nav.map((item) => (
              <a key={item.href} href={item.href}>{item.label}</a>
            ))}
          </nav>

          <div className="landing-footer-column">
            <h3>{copy.footer.trustTitle}</h3>
            {copy.footer.trustItems.map((item) => (
              <span className="landing-footer-trust" key={item}>
                <CheckCircle2 size={15} strokeWidth={2} />
                {item}
              </span>
            ))}
          </div>

          <div className="landing-footer-card">
            <h3>{copy.footer.accessTitle}</h3>
            <p>{copy.footer.note}</p>
            <div className="landing-footer-actions">
              <Link className="landing-primary-button landing-small-button" to="/register">
                {copy.meta.create}
                <ArrowRight size={16} strokeWidth={1.9} />
              </Link>
              <Link className="landing-secondary-button landing-small-button" to="/login">
                {copy.meta.signIn}
              </Link>
            </div>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <span>{copy.footer.copyright}</span>
          <a
            className="landing-footer-top-button"
            href="#top"
            aria-label={lang === 'fr' ? 'Retour en haut' : 'Back to top'}
            title={lang === 'fr' ? 'Retour en haut' : 'Back to top'}
          >
            {lang === 'fr' ? 'Retour en haut' : 'Back to top'}
          </a>
        </div>
      </footer>
    </div>
  );
}
