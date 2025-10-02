import React, { useState, useEffect } from 'react';
import { useExhibits } from '../context/ExhibitContext';
import { Exhibit, Guest } from '../types';
import ExhibitForm from '../components/ExhibitForm';
import { EditIcon, DeleteIcon, PlusIcon } from '../components/icons';

type Tab = 'exhibits' | 'guests';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('exhibits');

  return (
    <div className="container mx-auto">
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('exhibits')}
            className={`${
              activeTab === 'exhibits'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Manage Exhibits
          </button>
          <button
            onClick={() => setActiveTab('guests')}
            className={`${
              activeTab === 'guests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Manage Guests
          </button>
        </nav>
      </div>
      
      <div>
        {activeTab === 'exhibits' && <ExhibitsManager />}
        {activeTab === 'guests' && <GuestsManager />}
      </div>
    </div>
  );
};

const ExhibitsManager: React.FC = () => {
  const { exhibits, deleteExhibit, loading, error } = useExhibits();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExhibit, setEditingExhibit] = useState<Exhibit | null>(null);

  const handleAddNew = () => {
    setEditingExhibit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (exhibit: Exhibit) => {
    setEditingExhibit(exhibit);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this exhibit?')) {
      deleteExhibit(id);
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingExhibit(null);
  };

  if (loading) return <p className="text-center mt-8">Loading exhibits...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Exhibits</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
        >
          <PlusIcon className="h-5 w-5" />
          Add New Exhibit
        </button>
      </div>

      {isFormOpen && <ExhibitForm exhibit={editingExhibit} onClose={closeForm} />}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audio Tracks</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exhibits.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No exhibits found.</td></tr>
              ) : (
                exhibits.map((exhibit) => (
                  <tr key={exhibit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap"><img src={exhibit.imageUrl} alt={exhibit.name} className="h-12 w-16 object-cover rounded-md" /></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{exhibit.id}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{exhibit.name}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{exhibit.audioTracks.length}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-4">
                        <button onClick={() => handleEdit(exhibit)} className="text-indigo-600 hover:text-indigo-900" title="Edit"><EditIcon className="h-5 w-5" /></button>
                        <button onClick={() => handleDelete(exhibit.id)} className="text-red-600 hover:text-red-900" title="Delete"><DeleteIcon className="h-5 w-5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

const GuestsManager: React.FC = () => {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGuests = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/guests');
            if (!response.ok) throw new Error('Failed to fetch guests');
            const data = await response.json();
            setGuests(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchGuests();
    }, []);

    const handleReactivate = async (guestId: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/guests/${guestId}/reactivate`, { method: 'PUT' });
            if (!response.ok) throw new Error('Failed to reactivate guest');
            await fetchGuests(); // Refresh the list
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    const getStatus = (createdAt: string): { text: 'Active' | 'Expired'; className: string } => {
        const sessionStartTime = new Date(createdAt).getTime();
        const fourHoursInMillis = 4 * 60 * 60 * 1000;
        const isExpired = Date.now() > sessionStartTime + fourHoursInMillis;
        return isExpired 
            ? { text: 'Expired', className: 'bg-red-100 text-red-800' }
            : { text: 'Active', className: 'bg-green-100 text-green-800' };
    };

    if (loading) return <p className="text-center mt-8">Loading guests...</p>;
    if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

    return (
        <>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Guests</h2>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Time</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {guests.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No guests have registered yet.</td></tr>
                        ) : (
                            guests.map((guest) => {
                                const status = getStatus(guest.created_at);
                                return (
                                    <tr key={guest.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{guest.name}</div></td>
                                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{guest.phone_number}</div></td>
                                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-500">{new Date(guest.created_at).toLocaleString()}</div></td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.className}`}>
                                                {status.text}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {status.text === 'Expired' && (
                                                <button onClick={() => handleReactivate(guest.id)} className="text-indigo-600 hover:text-indigo-900">Reactivate</button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        </>
    );
};

export default AdminPage;