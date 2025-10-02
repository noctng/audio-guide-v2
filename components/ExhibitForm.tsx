import React, { useState, useEffect } from 'react';
import { Exhibit, AudioTrack } from '../types';
import { useExhibits } from '../context/ExhibitContext';
import { PlusIcon, DeleteIcon, CloseIcon } from './icons';

interface ExhibitFormProps {
  exhibit: Exhibit | null;
  onClose: () => void;
}

const ExhibitForm: React.FC<ExhibitFormProps> = ({ exhibit, onClose }) => {
  const { addExhibit, updateExhibit } = useExhibits();
  const [formData, setFormData] = useState<Exhibit>({
    id: '',
    name: '',
    description: '',
    imageUrl: '',
    audioTracks: [],
  });

  useEffect(() => {
    if (exhibit) {
      setFormData(exhibit);
    } else {
      setFormData({
        id: '',
        name: '',
        description: '',
        imageUrl: '',
        audioTracks: [],
      });
    }
  }, [exhibit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'id') {
      setFormData({ ...formData, [name]: value.toUpperCase() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleTrackChange = (index: number, field: keyof Omit<AudioTrack, 'id'>, value: string) => {
    const newTracks = [...formData.audioTracks];
    (newTracks[index] as any)[field] = value;
    setFormData({ ...formData, audioTracks: newTracks });
  };

  const addTrack = () => {
    setFormData({
      ...formData,
      audioTracks: [
        ...formData.audioTracks,
        { id: `new-${Date.now()}`, lang: '', langName: '', url: '' },
      ],
    });
  };

  const removeTrack = (index: number) => {
    const newTracks = formData.audioTracks.filter((_, i) => i !== index);
    setFormData({ ...formData, audioTracks: newTracks });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (exhibit) {
      await updateExhibit(formData);
    } else {
      await addExhibit(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-10 pb-10">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6 sticky top-0 bg-white border-b z-10">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">
                {exhibit ? 'Edit Exhibit' : 'Add New Exhibit'}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800"
              >
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="id" className="block text-sm font-medium text-gray-700">Exhibit ID</label>
                <input type="text" name="id" id="id" value={formData.id} onChange={handleChange} required disabled={!!exhibit} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100" />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Exhibit Name</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
              <input type="url" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleChange} required placeholder="https://picsum.photos/800/600" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" id="description" value={formData.description} onChange={handleChange} required rows={4} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Audio Tracks</h4>
              <div className="space-y-4">
                {formData.audioTracks.map((track, index) => (
                  <div key={track.id} className="grid grid-cols-1 sm:grid-cols-8 gap-2 p-3 bg-gray-50 rounded-md border">
                    <input type="text" value={track.lang} onChange={(e) => handleTrackChange(index, 'lang', e.target.value)} placeholder="Lang (e.g., en)" required className="sm:col-span-2 w-full border-gray-300 rounded-md shadow-sm text-sm" />
                    <input type="text" value={track.langName} onChange={(e) => handleTrackChange(index, 'langName', e.target.value)} placeholder="Language Name" required className="sm:col-span-2 w-full border-gray-300 rounded-md shadow-sm text-sm" />
                    <input type="url" value={track.url} onChange={(e) => handleTrackChange(index, 'url', e.target.value)} placeholder="MP3 URL" required className="sm:col-span-3 w-full border-gray-300 rounded-md shadow-sm text-sm" />
                    <button type="button" onClick={() => removeTrack(index)} className="sm:col-span-1 flex items-center justify-center text-red-500 hover:text-red-700" title="Remove Track">
                        <DeleteIcon className="h-5 w-5"/>
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addTrack} className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800">
                <PlusIcon className="h-5 w-5" />
                Add Audio Track
              </button>
            </div>
          </div>
          
          <div className="p-6 bg-gray-50 border-t sticky bottom-0">
            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Save Exhibit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExhibitForm;