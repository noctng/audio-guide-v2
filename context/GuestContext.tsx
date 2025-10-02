import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { GuestContextType, GuestSession } from '../types';

const GUEST_SESSION_KEY = 'museumGuestSession';
const API_URL = 'http://localhost:5000/api/guests';

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export const GuestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [guest, setGuest] = useState<GuestSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const storedSession = localStorage.getItem(GUEST_SESSION_KEY);
        if (storedSession) {
          const { id } = JSON.parse(storedSession);
          const response = await fetch(`${API_URL}/session/${id}`);
          
          if (response.ok) {
            const sessionData = await response.json();
            setGuest(sessionData);
          } else {
            // Session is invalid or expired, clear it
            localStorage.removeItem(GUEST_SESSION_KEY);
            setGuest(null);
          }
        }
      } catch (error) {
        console.error("Error verifying guest session:", error);
        localStorage.removeItem(GUEST_SESSION_KEY);
        setGuest(null);
      } finally {
        setLoading(false);
      }
    };
    verifySession();
  }, []);

  const login = async (name: string, phone: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.msg || "Registration failed." };
      }

      const newGuest = await response.json();
      const sessionData = { id: newGuest.id, name: newGuest.name };
      localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(sessionData));
      setGuest(sessionData);
      return { success: true };
    } catch (err: any) {
      console.error('Guest login error:', err);
      return { success: false, error: "An unexpected error occurred." };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(GUEST_SESSION_KEY);
    setGuest(null);
  };

  const contextValue: GuestContextType = {
    guest,
    loading,
    login,
    logout,
  };

  return (
    <GuestContext.Provider value={contextValue}>
      {children}
    </GuestContext.Provider>
  );
};

export const useGuest = (): GuestContextType => {
  const context = useContext(GuestContext);
  if (context === undefined) {
    throw new Error('useGuest must be used within a GuestProvider');
  }
  return context;
};