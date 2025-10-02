import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuest } from '../context/GuestContext';
import { MuseumIcon } from '../components/icons';

const GuestRegistrationPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, guest } = useGuest();

  useEffect(() => {
    if (guest) {
      navigate('/language-selection');
    }
  }, [guest, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
        setError('Please enter your name and phone number.');
        return;
    }
    setLoading(true);
    setError('');
    
    const result = await login(name, phone);

    if (result.success) {
      navigate('/language-selection');
    } else {
      setError(result.error || 'An unknown error occurred.');
    }
    setLoading(false);
  };

  if (guest) return null; // Prevent flicker while redirecting

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
            <MuseumIcon className="mx-auto h-12 w-12 text-gray-500" />
            <h2 className="mt-4 text-3xl font-bold text-gray-800">Welcome to the Museum</h2>
            <p className="mt-2 text-gray-600">Please register to start your audio guide experience.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-700 block">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Jane Doe"
            />
          </div>
          <div>
            <label htmlFor="phone" className="text-sm font-medium text-gray-700 block">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., (555) 123-4567"
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors"
            >
              {loading ? 'Registering...' : 'Start Session (4 hours)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuestRegistrationPage;