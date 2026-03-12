import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const ROLE_LABELS = {
    SUPER_ADMIN: 'Super Admin',
    PM: 'Project Manager',
    MENTOR_MOTHER: 'Mentor Mother',
};

export const useAuthStore = create(
    persist(
        (set, get) => ({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,

            setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken, isAuthenticated: true }),
            setUser: (user) => set({ user }),
            logout: () => set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false }),

            roleLabel: () => ROLE_LABELS[get().user?.role] || get().user?.role || '',
            hasPermission: (code) => {
                const u = get().user;
                if (!u) return false;
                if (u.role === 'SUPER_ADMIN') return true;
                return Array.isArray(u.permission_codes) && u.permission_codes.includes(code);
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
