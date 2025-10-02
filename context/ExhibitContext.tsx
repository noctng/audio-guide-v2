import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Exhibit, ExhibitContextType } from '../types';

const ExhibitContext = createContext<ExhibitContextType | undefined>(undefined);

const API_URL = 'http://localhost:5000/api/exhibits'; // Base URL for the backend API

export const ExhibitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExhibits = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Exhibit[] = await response.json();
        setExhibits(data);
      } catch (e: any) {
        if (e instanceof TypeError && e.message === 'Failed to fetch') {
          setError('Connection failed. Could not connect to the backend. Please ensure the backend server is running and try again.');
        } else {
          setError('Failed to load exhibits. An unexpected error occurred.');
        }
        console.error("Detailed fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibits();
  }, []);
  
  const getExhibitById = (id: string) => {
    return exhibits.find(exhibit => exhibit.id === id);
  };

  const addExhibit = async (exhibitData: Exhibit) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exhibitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to add exhibit.');
      }

      const newExhibit = await response.json();
      setExhibits(prevExhibits => [...prevExhibits, newExhibit].sort((a, b) => a.id.localeCompare(b.id)));
    } catch (err: any) {
      console.error('Add exhibit error:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const updateExhibit = async (updatedExhibit: Exhibit) => {
    try {
        const response = await fetch(`${API_URL}/${updatedExhibit.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedExhibit),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Failed to update exhibit.');
        }
        
        const returnedExhibit = await response.json();
        setExhibits(prevExhibits => 
            prevExhibits.map(exhibit => 
                exhibit.id === returnedExhibit.id ? returnedExhibit : exhibit
            )
        );
    } catch (err: any) {
        console.error('Update exhibit error:', err);
        alert(`Error: ${err.message}`);
    }
  };

  const deleteExhibit = async (id: string) => {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Failed to delete exhibit.');
        }

        setExhibits(prevExhibits => prevExhibits.filter(exhibit => exhibit.id !== id));
    } catch (err: any) {
        console.error('Delete exhibit error:', err);
        alert(`Error: ${err.message}`);
    }
  };

  const contextValue: ExhibitContextType = {
    exhibits,
    loading,
    error,
    getExhibitById,
    addExhibit,
    updateExhibit,
    deleteExhibit
  };

  return (
    <ExhibitContext.Provider value={contextValue}>
      {children}
    </ExhibitContext.Provider>
  );
};

export const useExhibits = (): ExhibitContextType => {
  const context = useContext(ExhibitContext);
  if (context === undefined) {
    throw new Error('useExhibits must be used within an ExhibitProvider');
  }
  return context;
};