import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: vi.fn() }),
}));

vi.mock('../context/I18nContext', () => ({
  useI18n: () => ({
    t: (key) => ({
      'login.title': 'Welcome back',
      'login.subtitle': 'Sign in to continue',
      'login.email': 'Email',
      'login.password': 'Password',
      'login.passwordPlaceholder': 'Your password',
      'login.submit': 'Sign in',
      'login.noAccount': 'No account?',
      'login.createOne': 'Create one',
      'login.errRequired': 'Email and password are required',
      'login.errFailed': 'Login failed',
    }[key] || key),
  }),
}));

vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

import api from '../services/api';

const renderLogin = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );

describe('LoginPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders email and password fields', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/alice@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your password/i)).toBeInTheDocument();
  });

  it('shows error on empty submit', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/email and password are required/i)).toBeInTheDocument();
    });
  });

  it('shows error on wrong credentials', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { error: 'Invalid email or password' } },
    });
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/alice@example.com/i), {
      target: { value: 'bad@user.com', name: 'email' },
    });
    fireEvent.change(screen.getByPlaceholderText(/your password/i), {
      target: { value: 'wrongpass', name: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });
});
