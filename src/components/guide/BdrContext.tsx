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
    const [{ data: profileRows }, { data: snapRows }] = await Promise.all([
      supabase.from('bdr_profiles').select('*').order('name'),
      supabase.from('bdr_snapshots').select('bdr_id, data').eq('bdr_id', '__members'),
    ]);
    const profiles = (profileRows || []) as unknown as BdrProfile[];

    // Augment with members from the latest uploaded workbook so every BDR shows up
    // in the Active BDR dropdown without needing a manual profile row.
    const memberData = (snapRows?.[0]?.data ?? {}) as Record<string, { name: string; market?: string; region?: string }>;
    const synthetic: BdrProfile[] = Object.values(memberData)
      .filter(m => m && m.name && !profiles.some(p => p.name.trim().toLowerCase() === m.name.trim().toLowerCase()))
      .map(m => ({
        id: `snapshot:${m.name}`,
        name: m.name,
        region: m.region ?? null,
        markets: m.market ? [m.market] : [],
        inventory_locations: [],
        target_verticals: [],
        excluded_markets: [],
      }));

    const list = [...profiles, ...synthetic].sort((a, b) => a.name.localeCompare(b.name));
    setBdrs(list);
    if (!selectedId && list.length > 0) {
      setSelId(list[0].id);
      localStorage.setItem(STORAGE_KEY, list[0].id);
    }
    setLoading(false);
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);

  const setSelectedId = async (id: string) => {
    // Synthetic snapshot IDs aren't real bdr_profile uuids — promote to a real
    // profile row so downstream queries (opportunities.assigned_bdr uuid, scan
    // edge function) work.
    if (id.startsWith('snapshot:')) {
      const synth = bdrs.find(b => b.id === id);
      if (synth) {
        const { data, error } = await supabase
          .from('bdr_profiles')
          .insert({
            name: synth.name,
            region: synth.region,
            markets: synth.markets,
            inventory_locations: synth.inventory_locations,
            target_verticals: synth.target_verticals,
            excluded_markets: synth.excluded_markets,
          })
          .select('id')
          .single();
        if (!error && data) {
          await refresh();
          setSelId(data.id);
          localStorage.setItem(STORAGE_KEY, data.id);
          return;
        }
      }
    }
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
