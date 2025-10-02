import React from 'react';
import { Routes, Route } from 'react-router-dom';
import VisitorPage from './pages/VisitorPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import Header from './components/Header';
import { ExhibitProvider } from './context/ExhibitContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LanguageSelectionPage from './pages/LanguageSelectionPage';
import { LanguageProvider } from './context/LanguageContext';
import GuestRegistrationPage from './pages/GuestRegistrationPage';
import { GuestProvider } from './context/GuestContext';
import GuestRoute from './components/GuestRoute';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <GuestProvider>
        <ExhibitProvider>
          <LanguageProvider>
            <div className="min-h-screen font-sans text-gray-800 bg-gray-50">
              <Header />
              <main className="p-4 sm:p-6 md:p-8">
                <Routes>
                  {/* Guest Flow */}
                  <Route path="/" element={<GuestRegistrationPage />} />
                  <Route path="/language-selection" element={<GuestRoute><LanguageSelectionPage /></GuestRoute>} />
                  <Route path="/guide" element={<GuestRoute><VisitorPage /></GuestRoute>} />
                  
                  {/* Admin Flow */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute>
                        <AdminPage />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </main>
            </div>
          </LanguageProvider>
        </ExhibitProvider>
      </GuestProvider>
    </AuthProvider>
  );
};

export default App;