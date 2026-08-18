/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store/store';
import { AppRoutes } from './routes/AppRoutes';
import { onAuthStateListener } from './services/auth.service';
import { login, logout, setLoading } from './store/authSlice';

function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const unsubscribe = onAuthStateListener((user, token) => {
      if (user && token) {
        store.dispatch(login({ user, token }));
      } else {
        store.dispatch(logout());
      }
    });

    return () => unsubscribe();
  }, []);

  return <>{children}</>;
}

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  );
}
