import {
  ShoppingBasket, Car, RefreshCw, Ticket, HeartPulse,
  Home, MinusCircle, Banknote, ArrowUpCircle, Wallet, PiggyBank,
} from 'lucide-react';

export const CATEGORY_ICONS = {
  'Alimentation':  { icon: ShoppingBasket, bg: 'rgba(24,185,119,0.14)',  color: '#18b977' },
  'Transport':     { icon: Car,            bg: 'rgba(47,107,255,0.14)',  color: '#2f6bff' },
  'Abonnements':   { icon: RefreshCw,      bg: 'rgba(118,87,255,0.14)', color: '#7657ff' },
  'Loisirs':       { icon: Ticket,         bg: 'rgba(255,159,26,0.14)', color: '#ff9f1a' },
  'Santé':         { icon: HeartPulse,     bg: 'rgba(255,59,48,0.14)',  color: '#ff3b30' },
  'Logement':      { icon: Home,           bg: 'rgba(20,184,166,0.14)', color: '#14b8a6' },
  'Autre dépense': { icon: MinusCircle,    bg: 'rgba(156,167,186,0.14)',color: '#9ca7ba' },
  'Salaire':       { icon: Banknote,       bg: 'rgba(24,185,119,0.14)', color: '#18b977' },
  'Autre revenu':  { icon: ArrowUpCircle,  bg: 'rgba(24,185,119,0.14)', color: '#18b977' },
  'Épargne':       { icon: PiggyBank,      bg: 'rgba(118,87,255,0.14)', color: '#7657ff' },
  'Epargne':       { icon: PiggyBank,      bg: 'rgba(118,87,255,0.14)', color: '#7657ff' },
  'Savings':       { icon: PiggyBank,      bg: 'rgba(118,87,255,0.14)', color: '#7657ff' },
};

export const FALLBACK_ICON = { icon: Wallet, bg: 'rgba(156,167,186,0.14)', color: '#9ca7ba' };

export function getCategoryIcon(categoryName, description = '') {
  if (CATEGORY_ICONS[categoryName]) return CATEGORY_ICONS[categoryName];
  if (description && /épargne|epargne/i.test(description)) {
    return { icon: PiggyBank, bg: 'rgba(118,87,255,0.14)', color: '#7657ff' };
  }
  return FALLBACK_ICON;
}
