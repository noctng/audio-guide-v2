export interface AudioTrack {
  id: string; 
  lang: string;
  langName: string;
  url: string;
}

export interface Exhibit {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  audioTracks: AudioTrack[];
}

export type ExhibitContextType = {
  exhibits: Exhibit[];
  loading: boolean;
  error: string | null;
  getExhibitById: (id: string) => Exhibit | undefined;
  addExhibit: (exhibit: Exhibit) => Promise<void>;
  updateExhibit: (exhibit: Exhibit) => Promise<void>;
  deleteExhibit: (id: string) => Promise<void>;
};

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export type LanguageContextType = {
  languages: Language[];
  selectedLanguage: Language | null;
  selectLanguage: (language: Language) => void;
};

export interface Guest {
  id: string;
  name: string;
  phone_number: string;
  created_at: string;
}

export interface GuestSession {
  id: string;
  name: string;
}

export type GuestContextType = {
  guest: GuestSession | null;
  loading: boolean;
  login: (name: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
};