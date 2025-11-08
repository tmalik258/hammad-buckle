import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  addedAt: Date;
}

export interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addItem: (item: Omit<WishlistItem, 'id' | 'addedAt'>) => void;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
  toggleItem: (item: Omit<WishlistItem, 'id' | 'addedAt'>) => void;
  
  // Computed values
  getTotalItems: () => number;
  isInWishlist: (productId: string) => boolean;
  getItemByProductId: (productId: string) => WishlistItem | undefined;
  
  // Loading states
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      addItem: (newItem) => {
        const { items } = get();
        const existingItem = items.find((item) => item.productId === newItem.productId);
        
        if (existingItem) {
          toast.info('Item already in wishlist');
          return;
        }

        const wishlistItem: WishlistItem = {
          ...newItem,
          id: `wishlist-${newItem.productId}-${Date.now()}`,
          addedAt: new Date(),
        };
        
        set({ items: [...items, wishlistItem] });
        toast.success('Item added to wishlist');
      },

      removeItem: (productId) => {
        const { items } = get();
        const updatedItems = items.filter((item) => item.productId !== productId);
        set({ items: updatedItems });
        toast.success('Item removed from wishlist');
      },

      clearWishlist: () => {
        set({ items: [] });
        toast.success('Wishlist cleared');
      },

      toggleItem: (item) => {
        const { items, addItem, removeItem } = get();
        const existingItem = items.find((wishlistItem) => wishlistItem.productId === item.productId);
        
        if (existingItem) {
          removeItem(item.productId);
        } else {
          addItem(item);
        }
      },

      getTotalItems: () => {
        const { items } = get();
        return items.length;
      },

      isInWishlist: (productId) => {
        const { items } = get();
        return items.some((item) => item.productId === productId);
      },

      getItemByProductId: (productId) => {
        const { items } = get();
        return items.find((item) => item.productId === productId);
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);