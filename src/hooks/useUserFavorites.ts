import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_favorites')
        .select('wine_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setFavorites(data?.map(f => f.wine_id) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (wineId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_favorites')
        .insert({ user_id: user.id, wine_id: wineId });

      if (error) throw error;

      setFavorites(prev => [...prev, wineId]);
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  };

  const removeFavorite = async (wineId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('wine_id', wineId);

      if (error) throw error;

      setFavorites(prev => prev.filter(id => id !== wineId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const isFavorite = (wineId: string) => favorites.includes(wineId);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    refetch: fetchFavorites
  };
};