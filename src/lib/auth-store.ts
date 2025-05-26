'use client';

import {create} from 'zustand';
import type { AuthCredentials, User } from '@/types/auth';
import { useRouter } from 'next/navigation'; // Import for programmatic navigation

const USERS_STORAGE_KEY = 'studentHubMockUsers';
const CURRENT_USER_STORAGE_KEY = 'studentHubMockCurrentUser';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // For initial auth check
  error: string | null;
  checkAuth: () => void;
  login: (credentials: AuthCredentials) => Promise<boolean>;
  register: (credentials: AuthCredentials) => Promise<boolean>;
  logout: () => void;
}

// Helper to get users from localStorage
// For this mock, storing {username: password}. NOT SECURE.
const getMockUsers = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
  return storedUsers ? JSON.parse(storedUsers) : {};
};

// Helper to save users to localStorage
const saveMockUsers = (users: Record<string, string>) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkAuth: () => {
    if (typeof window !== 'undefined') {
      try {
        const storedUserJson = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
        if (storedUserJson) {
          const user = JSON.parse(storedUserJson) as User;
          // Basic validation: does this user exist in our mock user list?
          const mockUsers = getMockUsers();
          if (user.username && mockUsers[user.username]) {
             set({ currentUser: user, isAuthenticated: true, isLoading: false, error: null });
          } else {
            // User in session storage but not in mock users list, treat as invalid session
            localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
            set({ currentUser: null, isAuthenticated: false, isLoading: false, error: null });
          }
        } else {
          set({ currentUser: null, isAuthenticated: false, isLoading: false, error: null });
        }
      } catch (e) {
        console.error("Error during auth check:", e);
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        set({ currentUser: null, isAuthenticated: false, isLoading: false, error: null });
      }
    } else {
       set({isLoading: false}); // SSR or non-browser, default to not authenticated
    }
  },

  login: async (credentials) => {
    set({ error: null }); // Clear previous errors
    const users = getMockUsers();
    // IMPORTANT: Comparing passwords directly. NOT SECURE.
    if (users[credentials.username] && users[credentials.username] === credentials.password) {
      const user: User = { username: credentials.username };
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
      set({ currentUser: user, isAuthenticated: true, error: null, isLoading: false });
      return true;
    }
    set({ error: 'Invalid username or password.', isAuthenticated: false, currentUser: null, isLoading: false });
    return false;
  },

  register: async (credentials) => {
    set({ error: null }); // Clear previous errors
    // IMPORTANT: This is a mock registration and is NOT secure.
    // Passwords are stored as is in localStorage for demonstration purposes only.
    // DO NOT use this in a production environment.
    if (!credentials.username || !credentials.password) {
      set({ error: 'Username and password are required.' });
      return false;
    }
    const users = getMockUsers();
    if (users[credentials.username]) {
      set({ error: 'Username already exists.' });
      return false;
    }
    users[credentials.username] = credentials.password;
    saveMockUsers(users);
    set({ error: null }); // Clear error on successful registration
    return true;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
    set({ currentUser: null, isAuthenticated: false, error: null, isLoading: false });
  },
}));
