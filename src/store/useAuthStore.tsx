import { persist } from 'zustand/middleware'
import type { SessionUser } from "../interfaces/SessionUser"
import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  sessionUser: SessionUser | null
  isAuthenticated: boolean
  isAdmin: boolean
  user: User | null;
  setSession: (sessionUser: SessionUser, user: User) => void
  clearSession: () => void
}



export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      sessionUser: null,
      isAuthenticated: false,
      isAdmin: false,
      user: null, 

      setSession: (sessionUser, user) => {
        set({
          user,
          sessionUser,
          isAuthenticated: true,
          isAdmin: false,
        });
      },



      clearSession: () => set({
        sessionUser: null,
        user: null,
        isAuthenticated: false,
        isAdmin: false
      }),
    }),
    {
      name: 'auth-v1', // Nombre de la clave en el localStorage
      version: 1,
      partialize: (state) => ({
        sessionUser: state.sessionUser,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  ) // <--- Aquí cerramos el persist
);