import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  variant?: string;
}

export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  clearCartSilently: () => void;
  
  // Computed values
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemById: (itemId: string) => CartItem | undefined;
  subtotal: number;
  itemCount: number;
  total: number;
  
  // Loading states
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Internal helper
  _updateComputedValues: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      loading: false,
      error: null,
      subtotal: 0,
      itemCount: 0,
      total: 0,
      
      // Helper function to update computed values
      _updateComputedValues: () => {
        const { items } = get();
        const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
        const itemCount = items.reduce((total, item) => total + item.quantity, 0);
        set({ subtotal, itemCount, total: subtotal });
      },

      addItem: (newItem) => {
        const { items, _updateComputedValues } = get();
        const existingItemIndex = items.findIndex(
          (item) => 
            item.productId === newItem.productId &&
            item.size === newItem.size &&
            item.color === newItem.color &&
            item.variant === newItem.variant
        );

        if (existingItemIndex > -1) {
          // Update existing item quantity
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += newItem.quantity || 1;
          set({ items: updatedItems });
          _updateComputedValues();
          toast.success('Item quantity updated in cart');
        } else {
          // Add new item
          const cartItem: CartItem = {
            ...newItem,
            id: `${newItem.productId}-${Date.now()}`,
            quantity: newItem.quantity || 1,
          };
          set({ items: [...items, cartItem] });
          _updateComputedValues();
          toast.success('Item added to cart');
        }
      },

      removeItem: (itemId) => {
        const { items, _updateComputedValues } = get();
        const updatedItems = items.filter((item) => item.id !== itemId);
        set({ items: updatedItems });
        _updateComputedValues();
        toast.success('Item removed from cart');
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        const { items, _updateComputedValues } = get();
        const updatedItems = items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        );
        set({ items: updatedItems });
        _updateComputedValues();
      },

      clearCart: () => {
        const { _updateComputedValues } = get();
        set({ items: [] });
        _updateComputedValues();
        toast.success('Cart cleared');
      },

      clearCartSilently: () => {
        const { _updateComputedValues } = get();
        set({ items: [] });
        _updateComputedValues();
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      getItemById: (itemId) => {
        const { items } = get();
        return items.find((item) => item.id === itemId);
      },

      setLoading: (loading) => set({ isLoading: loading, loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._updateComputedValues();
        }
      },
    }
  )
);