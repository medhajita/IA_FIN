import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Bot,
  Brain,
  CheckCircle2,
  ChevronRight,
  CircuitBoard,
  Code2,
  Database,
  FileSpreadsheet,
  GitBranch,
  Globe,
  LayoutDashboard,
  Layers,
  Lightbulb,
  Lock,
  Moon,
  Puzzle,
  Server,
  Smartphone,
  Sparkles,
  Sun,
  Tag,
  Target,
  TrendingUp,
  Wrench,
  Zap,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { PhoneFrame } from './LandingPage';
import './LandingPage2.css';

/* ─── nav sections ─── */
const NAV = [
  { href: '#problematique', label: 'Problématique' },
  { href: '#presentation', label: 'Projet' },
  { href: '#technologies', label: 'Stack' },
  { href: '#architecture', label: 'Architecture' },
  { href: '#features', label: 'Fonctionnalités' },
  { href: '#ia-cat', label: 'IA — Catégorisation' },
  { href: '#ia-reco', label: 'IA — Recommandations' },
];

/* ─── tech stack data ─── */
const SI = (slug, hex) => `https://cdn.simpleicons.org/${slug}/${hex}`;

const STACK = {
  frontend: [
    { name: 'React 18',     color: '#61DAFB', bg: 'rgba(97,218,251,0.12)',   desc: "Bibliotheque UI pour construire les ecrans, composants et etats de l'application.", img: SI('react','61DAFB') },
    { name: 'Vite',         color: '#9b67ff', bg: 'rgba(155,103,255,0.12)',  desc: 'Serveur de developpement et bundler rapide pour le projet React.', img: SI('vite','9b67ff') },
    { name: 'React Router', color: '#f97316', bg: 'rgba(249,115,22,0.12)',   desc: 'Gestion des routes publiques, privees et de la navigation interne.', img: SI('reactrouter','f97316') },
    { name: 'Recharts',     color: '#22d3ee', bg: 'rgba(34,211,238,0.12)',   desc: 'Graphiques du dashboard : barres, camemberts et evolution mensuelle.', img: SI('chartdotjs','22d3ee') },
    { name: 'Lucide Icons', color: '#6ee7b7', bg: 'rgba(110,231,183,0.12)', desc: "Systeme d'icones SVG coherent dans toute l'interface.", img: SI('lucide','6ee7b7') },
    { name: 'Axios',        color: '#7c8de8', bg: 'rgba(124,141,232,0.12)', desc: 'Client HTTP qui relie le frontend aux endpoints Express.', img: SI('axios','7c8de8') },
  ],
  backend: [
    { name: 'Node.js',   color: '#68a063', bg: 'rgba(104,160,99,0.12)',  desc: "Runtime JavaScript utilise pour executer l'API cote serveur.", img: SI('nodedotjs','68a063') },
    { name: 'Express',   color: '#a0aec0', bg: 'rgba(160,174,192,0.12)', desc: 'Framework API REST pour organiser routes, middlewares et controllers.', img: SI('express','a0aec0') },
    { name: 'Sequelize', color: '#52a4db', bg: 'rgba(82,164,219,0.12)',  desc: 'ORM qui mappe les modeles metier vers PostgreSQL.', img: SI('sequelize','52a4db') },
    { name: 'JWT',       color: '#fb015b', bg: 'rgba(251,1,91,0.12)',    desc: 'Tokens de session pour proteger les routes privees.', img: SI('jsonwebtokens','fb015b') },
    { name: 'Multer',    color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', desc: "Middleware d'upload pour recevoir les fichiers CSV.", img: null },
    { name: 'csv-parse', color: '#34d399', bg: 'rgba(52,211,153,0.12)',  desc: 'Parsing et normalisation des lignes de transactions bancaires.', img: null },
  ],
  database: [
    { name: 'PostgreSQL', color: '#336791', bg: 'rgba(51,103,145,0.14)', desc: 'Base relationnelle pour utilisateurs, transactions, categories et objectifs.', img: SI('postgresql','336791') },
    { name: 'Supabase',   color: '#3ecf8e', bg: 'rgba(62,207,142,0.12)', desc: 'Hebergement cloud PostgreSQL avec connexion distante securisee.', img: SI('supabase','3ecf8e') },
  ],
  ai: [
    { name: 'Groq API',    color: '#f55036', bg: 'rgba(245,80,54,0.12)',  desc: 'Provider principal pour generer les conseils financiers personnalises.', img: 'https://app.archbee.com/api/optimize/oAyFj2GHlBeBVWF5OAir2/JYo3VFgpFhk1hMRu5r5Ud-20250916-231515.png' },
    { name: 'DeepSeek',    color: '#4d6bff', bg: 'rgba(77,107,255,0.12)', desc: 'Provider de secours quand le provider principal est indisponible.', img: SI('deepseek','4d6bff') },
    { name: 'HuggingFace', color: '#ffd21e', bg: 'rgba(255,210,30,0.12)', desc: 'Fallback IA supplementaire pour garder le service disponible.', img: SI('huggingface','ffd21e') },
  ],
  tools: [
    { name: 'GitHub', color: '#a0aec0', bg: 'rgba(160,174,192,0.10)', desc: 'Versionning, branches de developpement et pull requests croisees.', img: SI('github','a0aec0') },
    { name: 'JIRA',   color: '#2684ff', bg: 'rgba(38,132,255,0.12)',  desc: 'Suivi des sprints, backlog et coordination des taches projet.', img: SI('jira','2684ff') },
    { name: 'Figma',  color: '#f24e1e', bg: 'rgba(242,78,30,0.12)',   desc: 'Maquettes haute fidelite et systeme de design partage.', img: SI('figma','f24e1e') },
  ],
};

/* ─── features ─── */
const FEATURES = [
  { icon: FileSpreadsheet, color: '#22d3ee', bg: 'rgba(34,211,238,0.12)', title: 'Import CSV', desc: 'Import et normalisation automatique des transactions bancaires depuis un fichier CSV.' },
  { icon: LayoutDashboard, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', title: 'Dashboard KPI', desc: 'Tableau de bord avec solde, revenus, dépenses et taux d\'épargne pour le mois en cours.' },
  { icon: Tag, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', title: 'Catégorisation IA', desc: 'Catégorisation automatique des transactions par règles métier et fallback IA multi-provider.' },
  { icon: Sparkles, color: '#f472b6', bg: 'rgba(244,114,182,0.12)', title: 'Recommandations IA', desc: 'Génération de 3 recommandations financières personnalisées basées sur les données réelles du mois.' },
  { icon: Bot, color: '#34d399', bg: 'rgba(52,211,153,0.12)', title: 'Assistant IA flottant', desc: 'Chatbot contextuel répondant en FR/EN à partir des vraies données financières de l\'utilisateur.' },
  { icon: Target, color: '#f97316', bg: 'rgba(249,115,22,0.12)', title: 'Objectifs d\'épargne', desc: 'Création et suivi de goals avec progression, montants cibles et dates limites.' },
  { icon: TrendingUp, color: '#818cf8', bg: 'rgba(129,140,248,0.12)', title: 'Analytiques', desc: 'Graphiques interactifs (barres, camembert) sur l\'évolution des dépenses par période et catégorie.' },
  { icon: Globe, color: '#6ee7b7', bg: 'rgba(110,231,183,0.12)', title: 'i18n FR / EN', desc: 'Interface bilingue avec détection automatique de la langue et basculement à la volée.' },
];

/* ─── AI categorization steps ─── */
const CAT_STEPS = [
  { n: '01', title: 'Import CSV', body: 'L\'utilisateur importe son relevé bancaire. Multer parse le fichier, normalise les colonnes (date, montant, description) et insère les lignes en base.', color: '#22d3ee' },
  { n: '02', title: 'Règles métier', body: 'Un dictionnaire de patterns (regex + mots-clés) tente de matcher la description : "UBER", "SNCF", "Carrefour"… Catégorie assignée immédiatement si match.', color: '#a78bfa' },
  { n: '03', title: 'Fallback IA', body: 'Si aucune règle ne matche, la description est envoyée à Groq (LLaMA 3). Le modèle retourne l\'ID de catégorie le plus probable parmi la liste existante.', color: '#f59e0b' },
  { n: '04', title: 'Multi-provider', body: 'En cas de quota 429 sur Groq, le système bascule automatiquement sur DeepSeek puis HuggingFace. L\'utilisateur ne voit jamais d\'erreur.', color: '#f472b6' },
  { n: '05', title: 'Persistance', body: 'La catégorie (et son origine : règle ou IA) est sauvegardée en base. L\'utilisateur peut la corriger manuellement via l\'interface.', color: '#34d399' },
];

/* ─── AI reco steps ─── */
const RECO_STEPS = [
  { n: '01', title: 'Collecte des données', body: 'Le controller récupère toutes les transactions du mois courant + les dépenses transport du mois précédent.', color: '#a78bfa' },
  { n: '02', title: 'Synthèse du contexte', body: 'Un résumé structuré est construit : revenus, dépenses, solde, taux d\'épargne, top 8 catégories de dépenses.', color: '#22d3ee' },
  { n: '03', title: 'Prompt engineering', body: 'Le résumé + les données chiffrées exactes sont injectés dans un system prompt. Le modèle doit retourner exactement 3 objets JSON {message, priority}.', color: '#f59e0b' },
  { n: '04', title: 'Parse & validation', body: 'La réponse brute est nettoyée (suppression markdown), parsée en JSON, validée. Les champs manquants sont corrigés.', color: '#f472b6' },
  { n: '05', title: 'Persistance & réponse', body: 'Les anciennes recommandations sont supprimées, les nouvelles insérées en base via bulkCreate. Le frontend reçoit le tableau final.', color: '#34d399' },
];

/* ─── difficulties ─── */

/* ─── component ─── */
export default function LandingPage2() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  const [activeStack, setActiveStack] = useState('frontend');

  const stackCategories = [
    { key: 'frontend', label: 'Frontend', icon: Smartphone },
    { key: 'backend', label: 'Backend', icon: Server },
    { key: 'database', label: 'Base de données', icon: Database },
    { key: 'ai', label: 'Intelligence Artificielle', icon: Brain },
    { key: 'tools', label: 'Outils', icon: Wrench },
  ];
  const docHeroScreen = {
    key: 'dashboard',
    title: 'Tableau de bord',
    src: `/landing/screens/dashboard-${theme}-fr.png`,
  };

  return (
    <div className={`doc-page doc-page-${theme}`}>
      <main id="top">
        <section className={`landing-page landing-page-${theme} doc-landing-hero-wrap`}>
          <div className="landing-hero">
            <div className="landing-hero-copy">
              <div className="doc-hero-brand">
                <span className="doc-hero-brand-mark">
                  <img src="/favicon.svg" alt="" aria-hidden="true" />
                </span>
                <span className="doc-hero-brand-name">FinCoach</span>
              </div>
              <span className="landing-eyebrow">
                <BadgeCheck size={16} strokeWidth={1.8} />
                L'IA qui transforme vos dépenses en décisions
              </span>
              <h1>Comprenez où va votre argent avant la fin du mois.</h1>
              <p>
                FinCoach transforme vos transactions CSV en tableau de bord clair, catégories utiles,
                objectifs d'épargne et réponses IA basées sur vos vraies données mensuelles.
              </p>
              <div className="doc-team-row">
                {['Oumayma MEKTANE', 'Mohamed HAJITA', 'Wassim RHILANE', 'Ilyasse DBIZA', 'Israe EL HILALI'].map((name, i) => (
                  <span key={i} className="doc-team-member">{name}</span>
                ))}
              </div>
            </div>
            <div className="landing-hero-visual">
              <PhoneFrame screen={docHeroScreen} priority />
            </div>
          </div>
        </section>
        {/* ── HERO ── */}
        <section className="doc-hero doc-hero-replaced" aria-hidden="true">
          <div className="doc-hero-eyebrow">
            <span className="doc-tag doc-tag-blue"><Code2 size={13} /> React + Node.js</span>
            <span className="doc-tag doc-tag-purple"><Brain size={13} /> IA Multi-provider</span>
            <span className="doc-tag doc-tag-green"><CircuitBoard size={13} /> PostgreSQL / Supabase</span>
          </div>
          <h1 className="doc-hero-title">
            <span className="doc-hero-gradient">FinCoach</span>
            <br />Application de finances<br />personnelles avec IA
          </h1>
          <p className="doc-hero-sub">
            Dossier de présentation technique — architecture, stack, fonctionnalités et choix d'implémentation.
          </p>
          <div className="doc-hero-tools">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="doc-tool-badge">
              <GitBranch size={15} strokeWidth={2} />
              <span>GitHub</span>
            </a>
            <span className="doc-tool-badge">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 11.429V6.857L7.714 3H3v4.714L6.857 12 3 16.286V21h4.714l3.857-3.857V12l3.857 3.857V21H20.1v-4.714L16.243 12l3.857-4.286V3H15.3l-3.728 3.857z"/></svg>
              <span>JIRA</span>
            </span>
            <span className="doc-tool-badge">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5zm7 0V2h3.5a3.5 3.5 0 0 1 0 7H12zm-7 7A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5zm7 0V9h3.5a3.5 3.5 0 1 1 0 7H12zm-5 4.5h3.5V22H8.5a3.5 3.5 0 0 1 0-7z"/></svg>
              <span>Figma</span>
            </span>
            <span className="doc-tool-badge doc-tool-badge-dim">
              <Puzzle size={15} strokeWidth={2} />
              <span>9 fonctionnalités</span>
            </span>
            <span className="doc-tool-badge doc-tool-badge-dim">
              <Layers size={15} strokeWidth={2} />
              <span>3 providers IA</span>
            </span>
          </div>
        </section>

        {/* ── PROBLÉMATIQUE ── */}
        <section className="doc-section" id="problematique">
          <div className="doc-section-label">
            <AlertTriangle size={14} strokeWidth={2.2} />
            01 — Problématique
          </div>
          <h2 className="doc-section-title">Pourquoi FinCoach&nbsp;?</h2>
          <p className="doc-section-lead">
            La majorité des individus n'ont aucune visibilité claire sur leurs finances personnelles au quotidien. Les relevés bancaires bruts sont illisibles, les tableurs fastidieux, et les outils existants soit trop complexes, soit déconnectés de la réalité mensuelle.
          </p>
          <div className="doc-problem-grid">
            {[
              { icon: FileSpreadsheet, color: '#f87171', title: 'Données brutes inutilisables', body: 'Les exports CSV des banques sont non structurés, hétérogènes et sans catégorisation. Impossible d\'identifier rapidement où part l\'argent.' },
              { icon: TrendingUp, color: '#fb923c', title: 'Absence de pilotage mensuel', body: 'Sans tableau de bord, l\'utilisateur ne sait pas en temps réel si son taux d\'épargne est satisfaisant ou si une catégorie de dépenses dérape.' },
              { icon: Brain, color: '#a78bfa', title: 'Pas de conseil personnalisé', body: 'Les outils génériques donnent des conseils théoriques. Aucun ne base ses recommandations sur les vrais chiffres du mois en cours de l\'utilisateur.' },
              { icon: Target, color: '#34d399', title: 'Objectifs sans suivi', body: 'Épargner pour un projet (voyage, achat) requiert un suivi actif. Sans outil dédié, les objectifs restent abstraits et peu motivants.' },
            ].map(p => {
              const Icon = p.icon;
              return (
                <article className="doc-problem-card" key={p.title}>
                  <span className="doc-problem-icon" style={{ background: `${p.color}18`, color: p.color }}>
                    <Icon size={20} strokeWidth={1.8} />
                  </span>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── PRÉSENTATION ── */}
        <section className="doc-section doc-section-alt" id="presentation">
          <div className="doc-section-label">
            <Lightbulb size={14} strokeWidth={2.2} />
            02 — Présentation générale
          </div>
          <h2 className="doc-section-title">Ce qu'est FinCoach</h2>
          <div className="doc-present-text">
            <p className="doc-section-lead">
              FinCoach est une <strong>application web full-stack</strong> de finances personnelles qui transforme des transactions CSV brutes en un tableau de bord actionnable, enrichi par de l'intelligence artificielle.
            </p>
            <p className="doc-body">
              L'utilisateur importe son relevé bancaire, l'IA catégorise automatiquement chaque transaction, le dashboard affiche les KPIs du mois, et l'assistant répond à ses questions en se basant sur ses vraies données — pas des moyennes génériques.
            </p>
            <p className="doc-body">
              Le projet a été développé en <strong>méthodologie agile</strong> sur deux branches parallèles, avec suivi JIRA, versionning GitHub et maquettes Figma.
            </p>
            <div className="doc-kpi-row">
              {[
                { val: '9', label: 'Fonctionnalités' },
                { val: '3', label: 'Providers IA' },
                { val: '2', label: 'Langues' },
                { val: '∞', label: 'Transactions' },
              ].map(k => (
                <div className="doc-kpi" key={k.label}>
                  <strong>{k.val}</strong>
                  <span>{k.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TECHNOLOGIES ── */}
        <section className="doc-section" id="technologies">
          <div className="doc-section-label">
            <Code2 size={14} strokeWidth={2.2} />
            03 — Technologies utilisées
          </div>
          <h2 className="doc-section-title">Stack technique</h2>
          <div className="doc-stack-tabs">
            {stackCategories.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  className={`doc-stack-tab${activeStack === cat.key ? ' is-active' : ''}`}
                  onClick={() => setActiveStack(cat.key)}
                >
                  <Icon size={15} strokeWidth={1.9} />
                  {cat.label}
                </button>
              );
            })}
          </div>
          <div className="doc-stack-grid">
            {STACK[activeStack].map(tech => (
              <div className="doc-tech-card" key={tech.name} style={{ '--tc': tech.color }}>
                {tech.img
                  ? <span className="doc-tech-logo" style={{ background: tech.bg }}><img src={tech.img} alt={tech.name} /></span>
                  : <span className="doc-tech-dot" style={{ background: tech.bg }} />
                }
                <div className="doc-tech-copy">
                  <strong>{tech.name}</strong>
                  <p>{tech.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ARCHITECTURE ── */}
        <section className="doc-section doc-section-alt" id="architecture">
          <div className="doc-section-label">
            <Server size={14} strokeWidth={2.2} />
            04 — Architecture du système
          </div>
          <h2 className="doc-section-title">Vue d'ensemble</h2>
          <p className="doc-section-lead">Architecture client-serveur classique avec couche IA externe découplée via un client abstrait multi-provider.</p>

          <div className="doc-arch-diagram">
            {/* Client */}
            <div className="doc-arch-col">
              <div className="doc-arch-box doc-arch-box-blue">
                <Smartphone size={18} strokeWidth={1.8} />
                <strong>Client (Browser)</strong>
                <span>React 18 + Vite</span>
                <div className="doc-arch-pills">
                  <span>Router</span><span>Context</span><span>Recharts</span>
                </div>
              </div>
            </div>

            <div className="doc-arch-arrow">
              <span>REST / JSON</span>
              <ChevronRight size={20} />
            </div>

            {/* API */}
            <div className="doc-arch-col">
              <div className="doc-arch-box doc-arch-box-purple">
                <Server size={18} strokeWidth={1.8} />
                <strong>API Backend</strong>
                <span>Node.js + Express</span>
                <div className="doc-arch-pills">
                  <span>Auth JWT</span><span>Controllers</span><span>Multer</span>
                </div>
              </div>
            </div>

            <div className="doc-arch-arrow">
              <span>Sequelize ORM</span>
              <ChevronRight size={20} />
            </div>

            {/* DB */}
            <div className="doc-arch-col">
              <div className="doc-arch-box doc-arch-box-green">
                <Database size={18} strokeWidth={1.8} />
                <strong>Base de données</strong>
                <span>PostgreSQL</span>
                <div className="doc-arch-pills">
                  <span>Supabase</span><span>Migrations</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Layer */}
          <div className="doc-arch-ai-layer">
            <div className="doc-arch-ai-connector">
              <span>API calls</span>
              <div className="doc-arch-ai-line" />
            </div>
            <div className="doc-arch-box doc-arch-box-amber doc-arch-ai-box">
              <Brain size={18} strokeWidth={1.8} />
              <strong>Couche IA — aiClient.js</strong>
              <span>Abstraction multi-provider avec fallback automatique</span>
              <div className="doc-arch-pills">
                <span className="doc-pill-primary">Groq (LLaMA 3)</span>
                <span>→ DeepSeek</span>
                <span>→ HuggingFace</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="doc-section" id="features">
          <div className="doc-section-label">
            <Puzzle size={14} strokeWidth={2.2} />
            05 — Fonctionnalités principales
          </div>
          <h2 className="doc-section-title">Ce que fait l'application</h2>
          <div className="doc-feat-grid">
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <article className="doc-feat-card" key={f.title}>
                  <span className="doc-feat-icon" style={{ background: f.bg, color: f.color }}>
                    <Icon size={20} strokeWidth={1.8} />
                  </span>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── IA CATÉGORISATION ── */}
        <section className="doc-section doc-section-dark" id="ia-cat">
          <div className="doc-section-label doc-section-label-light">
            <Tag size={14} strokeWidth={2.2} />
            06 — Fonctionnalité phare
          </div>
          <h2 className="doc-section-title">Catégorisation IA des transactions</h2>
          <p className="doc-section-lead">
            Chaque transaction importée est automatiquement étiquetée. L'IA ne prend le relais que quand les règles métier échouent — garantissant vitesse et pertinence.
          </p>

          <div className="doc-flow">
            {CAT_STEPS.map((s, i) => (
              <div className="doc-flow-step" key={s.n}>
                <div className="doc-flow-step-head" style={{ '--sc': s.color }}>
                  <span className="doc-flow-num">{s.n}</span>
                  <h3>{s.title}</h3>
                </div>
                <p>{s.body}</p>
                {i < CAT_STEPS.length - 1 && <span className="doc-flow-connector" style={{ '--sc': s.color }} />}
              </div>
            ))}
          </div>

        </section>

        {/* ── IA RECOMMANDATIONS ── */}
        <section className="doc-section" id="ia-reco">
          <div className="doc-section-label">
            <Sparkles size={14} strokeWidth={2.2} />
            07 — Fonctionnalité phare
          </div>
          <h2 className="doc-section-title">Recommandations IA personnalisées</h2>
          <p className="doc-section-lead">
            3 recommandations actionables générées à partir des vraies données du mois — pas des conseils génériques. Le modèle voit les chiffres exacts de l'utilisateur.
          </p>

          <div className="doc-reco-layout">
            <div className="doc-flow doc-flow-compact">
              {RECO_STEPS.map((s, i) => (
                <div className="doc-flow-step" key={s.n}>
                  <div className="doc-flow-step-head" style={{ '--sc': s.color }}>
                    <span className="doc-flow-num">{s.n}</span>
                    <h3>{s.title}</h3>
                  </div>
                  <p>{s.body}</p>
                  {i < RECO_STEPS.length - 1 && <span className="doc-flow-connector" style={{ '--sc': s.color }} />}
                </div>
              ))}
            </div>

            <div className="doc-reco-preview">
              <div className="doc-reco-card doc-reco-high">
                <span className="doc-reco-badge">High</span>
                <Sparkles size={14} />
                <p>Vos dépenses alimentation ont augmenté de 23% ce mois. Envisagez un budget hebdomadaire de 120€ pour retrouver votre rythme habituel.</p>
              </div>
              <div className="doc-reco-card doc-reco-medium">
                <span className="doc-reco-badge">Medium</span>
                <Sparkles size={14} />
                <p>Avec un taux d'épargne de 34%, vous êtes au-dessus de la moyenne. Augmentez votre objectif "Vacances" de 50€/mois pour l'atteindre en juin.</p>
              </div>
              <div className="doc-reco-card doc-reco-low">
                <span className="doc-reco-badge">Low</span>
                <Sparkles size={14} />
                <p>Vos abonnements représentent 8% de vos dépenses. Un audit rapide pourrait libérer 30-40€ par mois.</p>
              </div>
              <p className="doc-reco-note">
                <Lock size={12} /> Exemples — les vraies recommandations utilisent vos chiffres exacts
              </p>
            </div>
          </div>

        </section>

        {/* ── CONCLUSION ── */}
        <section className="doc-section" id="conclusion">
          <div className="doc-section-label">
            <CheckCircle2 size={14} strokeWidth={2.2} />
            08 — Conclusion
          </div>
          <h2 className="doc-section-title">Ce que nous avons accompli</h2>
          <p className="doc-section-lead">
            FinCoach est le résultat d'un travail collaboratif structuré autour d'une architecture full-stack moderne, d'une intégration IA réelle et d'une expérience utilisateur soignée.
          </p>
          <div className="doc-conclusion-grid">
            <div className="doc-conclusion-card">
              <span className="doc-conclusion-icon" style={{ background: 'rgba(110,160,255,0.12)', color: '#6ea0ff' }}>
                <Code2 size={20} strokeWidth={1.8} />
              </span>
              <h3>Stack moderne</h3>
              <p>React 18, Node.js/Express, PostgreSQL/Supabase — un écosystème professionnel de bout en bout avec authentification JWT et routes protégées.</p>
            </div>
            <div className="doc-conclusion-card">
              <span className="doc-conclusion-icon" style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}>
                <Brain size={20} strokeWidth={1.8} />
              </span>
              <h3>IA multi-provider</h3>
              <p>Chaîne de fallback Groq → DeepSeek → HuggingFace garantissant une disponibilité maximale pour la catégorisation et les recommandations personnalisées.</p>
            </div>
            <div className="doc-conclusion-card">
              <span className="doc-conclusion-icon" style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}>
                <Target size={20} strokeWidth={1.8} />
              </span>
              <h3>Méthodologie agile</h3>
              <p>Développement en parallèle sur deux branches, coordination JIRA, versionning GitHub et maquettes Figma partagées pour une livraison organisée.</p>
            </div>
            <div className="doc-conclusion-card">
              <span className="doc-conclusion-icon" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}>
                <Sparkles size={20} strokeWidth={1.8} />
              </span>
              <h3>Expérience utilisateur</h3>
              <p>Interface responsive bilingue FR/EN, thème clair/sombre, dashboard KPI interactif et assistant IA flottant ancré sur les vraies données du mois.</p>
            </div>
          </div>
          <div className="doc-conclusion-quote">
            <p>
              "FinCoach démontre qu'une application de finances personnelles peut aller au-delà du simple relevé de compte — en transformant des données brutes en décisions financières claires grâce à l'intelligence artificielle."
            </p>
            <div className="doc-conclusion-team">
              {['Oumayma MEKTANE', 'Mohamed HAJITA', 'Wassim RHILANE', 'Ilyasse DBIZA', 'Israe EL HILALI'].map((name, i) => (
                <span key={i}>{name}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="doc-cta-banner">
          <div className="doc-cta-banner-inner">
            <div className="doc-cta-banner-copy">
              <span className="doc-cta-banner-kicker">Votre espace FinCoach</span>
              <h2>Ouvrez FinCoach et mettez votre mois en clair.</h2>
              <p>Créez un compte, chargez la démo ou importez un CSV, puis consultez tableau de bord, transactions, objectifs et recommandations IA.</p>
            </div>
            <Link className="doc-cta-banner-btn" to="/">
              Explorons l'application <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </div>
        </section>
      </main>

    </div>
  );
}
