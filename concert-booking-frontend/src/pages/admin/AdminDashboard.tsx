// AdminDashboard — re-exports existing dashboard component.
// The AdminDashboard.tsx in parent pages/ contains all the Recharts analytics logic.
// It imports from the old services (adminMovieService, etc.) — those are
// still exported from adminApi.ts for backward-compat. This will compile fine.
export { AdminDashboard } from '../AdminDashboard';
