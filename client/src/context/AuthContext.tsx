import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { login as loginRequest, logout as logoutRequest, me as meRequest, register as registerRequest } from '../api/authApi';
import { setAuthToken } from '../api/client';
import type { User } from '../types';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const storageKey = 'sudoku-token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(storageKey));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthToken(token);
    if (!token) {
      setLoading(false);
      return;
    }

    void meRequest()
      .then((result) => setUser(result.user))
      .catch(() => {
        localStorage.removeItem(storageKey);
        setToken(null);
        setAuthToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleAuth(result: { user: User; token: string }) {
    setUser(result.user);
    setToken(result.token);
    setAuthToken(result.token);
    localStorage.setItem(storageKey, result.token);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login: async (payload) => handleAuth(await loginRequest(payload)),
        register: async (payload) => handleAuth(await registerRequest(payload)),
        logout: async () => {
          await logoutRequest();
          setUser(null);
          setToken(null);
          setAuthToken(null);
          localStorage.removeItem(storageKey);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
