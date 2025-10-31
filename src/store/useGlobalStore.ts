import { create } from 'zustand';
import { News, Pool, PoolStake, User } from '@/types';

interface GlobalState {
  // ============================================
  // MODEL B: News + Pool State (NEW)
  // ============================================

  // News state
  newsList: News[];
  setNewsList: (news: News[]) => void;

  // Current news (when viewing detail)
  currentNews: News | null;
  setCurrentNews: (news: News | null) => void;

  // Pools state
  pools: Pool[];
  setPools: (pools: Pool[]) => void;

  // Current pool (when viewing detail)
  currentPool: Pool | null;
  setCurrentPool: (pool: Pool | null) => void;

  // Pool stakes
  poolStakes: PoolStake[];
  setPoolStakes: (stakes: PoolStake[]) => void;

  // ============================================
  // Legacy markets removed - using News/Pool only
  // ============================================

  // ============================================
  // SHARED STATE
  // ============================================

  // User state
  user: User | null;
  setUser: (user: User | null) => void;

  // Loading states
  loading: {
    news: boolean;
    pools: boolean;
    stakes: boolean;
  };
  setLoading: (key: keyof GlobalState['loading'], value: boolean) => void;

  // Error states (for smart contract integration)
  error: {
    news: string | null;
    pools: string | null;
    stakes: string | null;
    contract: string | null;
  };
  setError: (key: keyof GlobalState['error'], value: string | null) => void;
  clearError: (key: keyof GlobalState['error']) => void;
  clearAllErrors: () => void;

  // Transaction states (for smart contract integration)
  transactions: {
    pending: string[]; // Transaction hashes
    confirmed: string[];
    failed: string[];
  };
  addTransaction: (hash: string, status: 'pending' | 'confirmed' | 'failed') => void;
  updateTransaction: (hash: string, status: 'pending' | 'confirmed' | 'failed') => void;
  clearTransactions: () => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  // ============================================
  // Initial State
  // ============================================
  newsList: [],
  currentNews: null,
  pools: [],
  currentPool: null,
  poolStakes: [],
  user: null,
  loading: {
    news: false,
    pools: false,
    stakes: false,
  },
  error: {
    news: null,
    pools: null,
    stakes: null,
    contract: null,
  },
  transactions: {
    pending: [],
    confirmed: [],
    failed: [],
  },

  // ============================================
  // Actions
  // ============================================
  setNewsList: (newsList) => set({ newsList }),
  setCurrentNews: (currentNews) => set({ currentNews }),
  setPools: (pools) => set({ pools }),
  setCurrentPool: (currentPool) => set({ currentPool }),
  setPoolStakes: (poolStakes) => set({ poolStakes }),
  setUser: (user) => set({ user }),
  setLoading: (key, value) =>
    set((state) => ({
      loading: { ...state.loading, [key]: value }
    })),

  // Error actions
  setError: (key, value) =>
    set((state) => ({
      error: { ...state.error, [key]: value }
    })),
  clearError: (key) =>
    set((state) => ({
      error: { ...state.error, [key]: null }
    })),
  clearAllErrors: () =>
    set({
      error: {
        news: null,
        pools: null,
        stakes: null,
        contract: null,
      }
    }),

  // Transaction actions
  addTransaction: (hash, status) =>
    set((state) => ({
      transactions: {
        ...state.transactions,
        [status]: [...state.transactions[status], hash],
      }
    })),
  updateTransaction: (hash, status) =>
    set((state) => {
      // Remove from all lists
      const pending = state.transactions.pending.filter(h => h !== hash);
      const confirmed = state.transactions.confirmed.filter(h => h !== hash);
      const failed = state.transactions.failed.filter(h => h !== hash);

      // Add to new status list
      return {
        transactions: {
          pending,
          confirmed,
          failed,
          [status]: [...(status === 'pending' ? pending : status === 'confirmed' ? confirmed : failed), hash],
        }
      };
    }),
  clearTransactions: () =>
    set({
      transactions: {
        pending: [],
        confirmed: [],
        failed: [],
      }
    }),
}));