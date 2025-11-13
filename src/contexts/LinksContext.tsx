import { createContext, useContext, useState, ReactNode } from 'react';

export interface Link {
  id: string;
  name: string;
  url: string;
}

interface LinksContextType {
  links: Link[];
  addLink: (name: string, url: string) => void;
  removeLink: (id: string) => void;
}

const LinksContext = createContext<LinksContextType | undefined>(undefined);

const INITIAL_LINKS: Link[] = [
  { id: '1', name: 'BROADWORKS', url: 'https://broadworks.example.com' },
  { id: '2', name: 'SBC SANSAY', url: 'https://sbc-sansay.example.com' },
  { id: '3', name: 'SBC AUDIO CODES', url: 'https://sbc-audiocodes.example.com' },
  { id: '4', name: 'STFC', url: 'https://stfc.example.com' },
  { id: '5', name: 'UC4X', url: 'https://uc4x.example.com' },
];

export function LinksProvider({ children }: { children: ReactNode }) {
  const [links, setLinks] = useState<Link[]>(INITIAL_LINKS);

  const addLink = (name: string, url: string) => {
    const newLink: Link = {
      id: Date.now().toString(),
      name: name.toUpperCase(),
      url,
    };
    setLinks([...links, newLink]);
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
  };

  return (
    <LinksContext.Provider value={{ links, addLink, removeLink }}>
      {children}
    </LinksContext.Provider>
  );
}

export function useLinks() {
  const context = useContext(LinksContext);
  if (context === undefined) {
    throw new Error('useLinks must be used within a LinksProvider');
  }
  return context;
}
