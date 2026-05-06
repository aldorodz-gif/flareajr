import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BdrProfile {
  id: string;
  name: string;
  region: string | null;
  markets: string[];
  inventory_locations: Array<{ name: string; city: string; state: string; lat?: number; lng?: number }>;
  target_verticals: string[];
  excluded_markets: string[];
}

interface Ctx {
  bdrs: BdrProfile[];
  selected: BdrProfile | null;
  setSelectedId: (id: string) => void;
  loading: boolean;
  refresh: () => Promise<void>;
}

const BdrContext = createContext<Ctx | null>(null);
const STORAGE_KEY = 'flare.selectedBdrId';

export function BdrProvider({ children }: { children: ReactNode }) {
  const [bdrs, setBdrs] = useState<BdrProfile[]>([]);
  const [selectedId, setSelId] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const { data } = await supabase.from('bdr_profiles').select('*').order('name');
    const list = (data || []) as unknown as BdrProfile[];
    setBdrs(list);
    if (!selectedId && list.length > 0) {
      setSelId(list[0].id);
      localStorage.setItem(STORAGE_KEY, list[0].id);
    }
    setLoading(false);
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);

  const setSelectedId = (id: string) => {
    setSelId(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  const selected = bdrs.find(b => b.id === selectedId) || null;
  return <BdrContext.Provider value={{ bdrs, selected, setSelectedId, loading, refresh }}>{children}</BdrContext.Provider>;
}

export function useBdr() {
  const ctx = useContext(BdrContext);
  if (!ctx) throw new Error('useBdr must be inside BdrProvider');
  return ctx;
}
