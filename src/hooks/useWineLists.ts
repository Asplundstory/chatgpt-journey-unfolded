import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface WineList {
  id: string;
  name: string;
  description?: string;
  wines: string[]; // wine IDs
  created_at: Date;
  updated_at: Date;
}

const LISTS_STORAGE_KEY = 'wine-lists';

export const useWineLists = () => {
  const [lists, setLists] = useState<WineList[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // TODO: Fetch from Supabase when we add the database table
      fetchLocalLists();
    } else {
      fetchLocalLists();
    }
  }, [user]);

  const fetchLocalLists = () => {
    const stored = localStorage.getItem(LISTS_STORAGE_KEY);
    if (stored) {
      try {
        const parsedLists = JSON.parse(stored).map((list: any) => ({
          ...list,
          created_at: new Date(list.created_at),
          updated_at: new Date(list.updated_at)
        }));
        setLists(parsedLists);
      } catch (error) {
        console.error('Error parsing stored lists:', error);
        setLists([]);
      }
    }
  };

  const saveToLocalStorage = (newLists: WineList[]) => {
    localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(newLists));
  };

  const createList = (name: string, description?: string) => {
    const newList: WineList = {
      id: crypto.randomUUID(),
      name,
      description,
      wines: [],
      created_at: new Date(),
      updated_at: new Date()
    };

    const newLists = [...lists, newList];
    setLists(newLists);
    saveToLocalStorage(newLists);
    return newList;
  };

  const deleteList = (listId: string) => {
    const newLists = lists.filter(list => list.id !== listId);
    setLists(newLists);
    saveToLocalStorage(newLists);
  };

  const updateList = (listId: string, updates: Partial<WineList>) => {
    const newLists = lists.map(list => 
      list.id === listId 
        ? { ...list, ...updates, updated_at: new Date() }
        : list
    );
    setLists(newLists);
    saveToLocalStorage(newLists);
  };

  const addWineToList = (listId: string, wineId: string) => {
    const newLists = lists.map(list => 
      list.id === listId && !list.wines.includes(wineId)
        ? { ...list, wines: [...list.wines, wineId], updated_at: new Date() }
        : list
    );
    setLists(newLists);
    saveToLocalStorage(newLists);
  };

  const removeWineFromList = (listId: string, wineId: string) => {
    const newLists = lists.map(list => 
      list.id === listId 
        ? { ...list, wines: list.wines.filter(id => id !== wineId), updated_at: new Date() }
        : list
    );
    setLists(newLists);
    saveToLocalStorage(newLists);
  };

  const getListsContainingWine = (wineId: string) => {
    return lists.filter(list => list.wines.includes(wineId));
  };

  return {
    lists,
    loading,
    createList,
    deleteList,
    updateList,
    addWineToList,
    removeWineFromList,
    getListsContainingWine
  };
};