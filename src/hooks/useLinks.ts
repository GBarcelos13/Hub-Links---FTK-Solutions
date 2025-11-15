import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';

export interface Link {
  id: string;
  name: string;
  url: string;
  display_order: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useLinks() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useSupabaseAuth();

  const fetchLinks = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast.error('Erro ao carregar links');
      console.error(error);
    } else {
      setLinks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLinks();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('links-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'links'
        },
        () => {
          fetchLinks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addLink = async (name: string, url: string) => {
    if (!user) return;

    const maxOrder = links.length > 0 ? Math.max(...links.map(l => l.display_order)) : -1;

    const { error } = await supabase
      .from('links')
      .insert({
        name: name.toUpperCase(),
        url,
        display_order: maxOrder + 1,
        created_by: user.id
      });

    if (error) {
      toast.error('Erro ao adicionar link');
      console.error(error);
    } else {
      toast.success('Link adicionado com sucesso!');
    }
  };

  const removeLink = async (id: string) => {
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao remover link');
      console.error(error);
    } else {
      toast.success('Link removido com sucesso!');
    }
  };

  const updateLinkOrder = async (linkId: string, newOrder: number) => {
    const { error } = await supabase
      .from('links')
      .update({ display_order: newOrder })
      .eq('id', linkId);

    if (error) {
      console.error('Erro ao atualizar ordem:', error);
    }
  };

  const reorderLinks = async (reorderedLinks: Link[]) => {
    // Update all links with new order
    const updates = reorderedLinks.map((link, index) => 
      updateLinkOrder(link.id, index)
    );

    await Promise.all(updates);
  };

  const canEditLink = (link: Link) => {
    return isAdmin || link.created_by === user?.id;
  };

  return {
    links,
    loading,
    addLink,
    removeLink,
    reorderLinks,
    canEditLink,
    isAdmin
  };
}
