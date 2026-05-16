import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Test User' }, logout: vi.fn() }),
}));

vi.mock('../context/I18nContext', () => ({
  useI18n: () => ({
    t: (key, vars = {}) => ({
      'dashboard.errLoad': 'Unable to load dashboard',
      'dashboard.errDemo': 'Unable to load demo',
      'dashboard.title': 'Dashboard',
      'dashboard.subtitle': 'Overview',
      'dashboard.loadDemo': 'Load demo data',
      'dashboard.income': 'Income',
      'dashboard.expenses': 'Expenses',
      'dashboard.balance': 'Balance',
      'dashboard.savingsRate': 'Savings rate',
      'dashboard.noData': 'No data yet',
      'dashboard.noDataSub': 'Import your first CSV to see your dashboard.',
      'dashboard.recommendations': 'Recommendations',
      'dashboard.recentTransactions': 'Recent transactions',
      'dashboard.importCsv': 'Import CSV',
      'dashboard.byCategory': 'By category',
      'dashboard.monthlyEvolution': 'Monthly evolution',
      'dashboard.transactions': `${vars.count ?? 0} transactions`,
    }[key] || key),
  }),
}));

vi.mock('../services/dashboardService', () => ({
  getSummary: vi.fn(),
  getByCategory: vi.fn(),
  getMonthlyEvolution: vi.fn(),
}));

vi.mock('../services/api', () => ({
  default: { get: vi.fn() },
}));

import { getSummary, getByCategory, getMonthlyEvolution } from '../services/dashboardService';
import api from '../services/api';

const mockSummary = {
  data: { data: { totalIncome: 2000, totalExpenses: 800, balance: 1200, savingsRate: 60, transactionCount: 5 } },
};
const mockCategories = { data: { data: { categories: [], totalExpenses: 800 } } };
const mockEvolution = { data: { data: { evolution: [] } } };
const mockRecommendations = { data: { recommendations: [] } };
const mockTransactions = { data: { data: [] } };

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );

describe('DashboardPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading skeleton while fetching', () => {
    getSummary.mockReturnValue(new Promise(() => {}));
    getByCategory.mockReturnValue(new Promise(() => {}));
    getMonthlyEvolution.mockReturnValue(new Promise(() => {}));
    api.get.mockReturnValue(new Promise(() => {}));
    renderDashboard();
    expect(document.querySelector('[style*="shimmer"]')).toBeTruthy();
  });

  it('renders KPI cards with correct values', async () => {
    getSummary.mockResolvedValue(mockSummary);
    getByCategory.mockResolvedValue(mockCategories);
    getMonthlyEvolution.mockResolvedValue(mockEvolution);
    api.get.mockResolvedValue(mockRecommendations);

    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/2\s*000/)).toBeInTheDocument();
    });
  });

  it('shows empty state when no transactions', async () => {
    getSummary.mockResolvedValue({
      data: { data: { totalIncome: 0, totalExpenses: 0, balance: 0, savingsRate: 0, transactionCount: 0 } },
    });
    getByCategory.mockResolvedValue(mockCategories);
    getMonthlyEvolution.mockResolvedValue(mockEvolution);
    api.get.mockResolvedValue(mockRecommendations);

    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/No data yet/i)).toBeInTheDocument();
    });
  });
});
