import { createContext, useState } from 'react';

import axiosClient from '../lib/axiosClient';

const AuthContext = createContext(null);
const SESSION_KEY = 'session';

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : { token: null, cartId: null, user: null };
  } catch {
    return { token: null, cartId: null, user: null };
  }
}

function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);

  // Recibe la respuesta del backend: { sessionToken, user, cart, ... }
  const login = (data) => {
    const s = { token: data.sessionToken, cartId: data.cart?.id ?? null, user: data.user };
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
  };

  const logout = async () => {
    if (session.token) {
      try {
        await axiosClient.post('/auth/logout');
      } catch {
        // Si falla el logout en el backend, limpiamos la sesión local igualmente
      }
    }
    localStorage.removeItem(SESSION_KEY);
    setSession({ token: null, cartId: null, user: null });
  };

  const value = {
    currentUser: session.user,
    token: session.token,
    cartId: session.cartId,
    isAuthenticated: Boolean(session.token && session.user),
    isAdmin: session.user?.role === 'ADMIN',
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };
