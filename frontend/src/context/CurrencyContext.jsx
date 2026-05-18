import { createContext, useContext, useState } from 'react';

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'CNY', symbol: '¥', label: 'Chinese Yuan' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
];

const CurrencyContext = createContext({ currency: 'USD', setCurrency: () => {} });

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(
    () => localStorage.getItem('fc_currency') || 'USD'
  );

  function setCurrency(code) {
    localStorage.setItem('fc_currency', code);
    setCurrencyState(code);
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

export function useFmt() {
  const { currency } = useCurrency();
  return (value) =>
    Number(value || 0).toLocaleString('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    });
}
