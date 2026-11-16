import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const OWNER_TOKEN_STORAGE_KEY = 'mitsu_crntzz_owner_token_v1';

export interface OwnerServerStatus {
  configuredMethods: {
    passcode: boolean;
    emailOtp: boolean;
    whatsappOtp: boolean;
  };
  ownerEmailHint: string;
}

interface AuthActionResult {
  ok: boolean;
  error?: string;
  detail?: string;
}

interface OwnerAuthContextValue {
  isOwnerVerified: boolean;
  checkingSession: boolean;
  ownerEmail: string | null;
  authToken: string | null;
  serverStatus: OwnerServerStatus | null;
  loginWithPasscode: (email: string, passcode: string) => Promise<AuthActionResult>;
  requestOtp: (email: string) => Promise<AuthActionResult>;
  verifyOtp: (email: string, code: string) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  invalidateSession: () => void;
  refreshStatus: () => Promise<void>;
}

const OwnerAuthContext = createContext<OwnerAuthContextValue | null>(null);

export const OwnerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(OWNER_TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState<boolean>(true);
  const [serverStatus, setServerStatus] = useState<OwnerServerStatus | null>(null);

  const saveToken = useCallback((token: string | null, email: string | null) => {
    setAuthToken(token);
    setOwnerEmail(email);
    try {
      if (token) {
        sessionStorage.setItem(OWNER_TOKEN_STORAGE_KEY, token);
      } else {
        sessionStorage.removeItem(OWNER_TOKEN_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/owner/status');
      if (res.ok) {
        const data = await res.json();
        if (data?.ok) {
          setServerStatus({
            configuredMethods: data.configuredMethods,
            ownerEmailHint: data.ownerEmailHint || '***',
          });
        }
      }
    } catch {
      // Ignore offline check error
    }
  }, []);

  useEffect(() => {
    let active = true;
    const init = async () => {
      await refreshStatus();
      const existingToken = (() => {
        try {
          return sessionStorage.getItem(OWNER_TOKEN_STORAGE_KEY);
        } catch {
          return null;
        }
      })();

      if (!existingToken) {
        if (active) setCheckingSession(false);
        return;
      }

      try {
        const res = await fetch('/api/owner/session', {
          headers: { Authorization: `Bearer ${existingToken}` },
        });
        const data = res.ok ? await res.json() : null;
        if (!active) return;
        if (data?.authenticated && typeof data.email === 'string') {
          saveToken(existingToken, data.email);
        } else {
          saveToken(null, null);
        }
      } catch {
        if (active) saveToken(null, null);
      } finally {
        if (active) setCheckingSession(false);
      }
    };

    init();
    return () => {
      active = false;
    };
  }, [refreshStatus, saveToken]);

  const loginWithPasscode = useCallback(
    async (email: string, passcode: string): Promise<AuthActionResult> => {
      try {
        const res = await fetch('/api/owner/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), passcode }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok || !data?.token) {
          return { ok: false, error: data?.error || 'Owner verification failed.' };
        }
        saveToken(data.token, data.email);
        return { ok: true };
      } catch {
        return { ok: false, error: 'Unable to reach verification server.' };
      }
    },
    [saveToken]
  );

  const requestOtp = useCallback(async (email: string): Promise<AuthActionResult> => {
    try {
      const res = await fetch('/api/owner/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        return { ok: false, error: data?.error || 'Unable to send verification code.' };
      }
      return { ok: true, detail: data.detail };
    } catch {
      return { ok: false, error: 'Unable to reach verification server.' };
    }
  }, []);

  const verifyOtp = useCallback(
    async (email: string, code: string): Promise<AuthActionResult> => {
      try {
        const res = await fetch('/api/owner/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), code: code.trim() }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok || !data?.token) {
          return { ok: false, error: data?.error || 'Code verification failed.' };
        }
        saveToken(data.token, data.email);
        return { ok: true };
      } catch {
        return { ok: false, error: 'Unable to reach verification server.' };
      }
    },
    [saveToken]
  );

  const logout = useCallback(async () => {
    if (authToken) {
      await fetch('/api/owner/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      }).catch(() => {});
    }
    saveToken(null, null);
  }, [authToken, saveToken]);

  const invalidateSession = useCallback(() => {
    saveToken(null, null);
  }, [saveToken]);

  const value = useMemo<OwnerAuthContextValue>(
    () => ({
      isOwnerVerified: Boolean(authToken && ownerEmail),
      checkingSession,
      ownerEmail,
      authToken,
      serverStatus,
      loginWithPasscode,
      requestOtp,
      verifyOtp,
      logout,
      invalidateSession,
      refreshStatus,
    }),
    [
      authToken,
      ownerEmail,
      checkingSession,
      serverStatus,
      loginWithPasscode,
      requestOtp,
      verifyOtp,
      logout,
      invalidateSession,
      refreshStatus,
    ]
  );

  return <OwnerAuthContext.Provider value={value}>{children}</OwnerAuthContext.Provider>;
};

export function useOwnerAuth(): OwnerAuthContextValue {
  const ctx = useContext(OwnerAuthContext);
  if (!ctx) {
    throw new Error('useOwnerAuth must be used inside OwnerAuthProvider');
  }
  return ctx;
}
