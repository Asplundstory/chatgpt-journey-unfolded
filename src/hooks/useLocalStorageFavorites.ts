import { useState, useEffect } from 'react';

const FAVORITES_STORAGE_KEY = 'wine-favorites';

export const useLocalStorageFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing stored favorites:', error);
        setFavorites([]);
      }
    }
  }, []);

  const addFavorite = (wineId: string) => {
    const newFavorites = [...favorites, wineId];
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
  };

  const removeFavorite = (wineId: string) => {
    const newFavorites = favorites.filter(id => id !== wineId);
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
  };

  const isFavorite = (wineId: string) => favorites.includes(wineId);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite
  };
};