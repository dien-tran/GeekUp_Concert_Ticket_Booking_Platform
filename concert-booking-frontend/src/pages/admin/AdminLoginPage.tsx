import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ROUTES } from '../../constants/routes';


export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAdmin } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    try {
      await loginAdmin(email, password);
      navigate(ROUTES.ADMIN.DASHBOARD, { replace: true });
    } catch (err: any) {
      const msg = err?.message || err?.response?.data?.message || 'Invalid credentials or insufficient permissions.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0A1E] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="orb orb-primary w-96 h-96 -top-48 -right-48 opacity-20" />
      <div className="orb orb-secondary w-64 h-64 bottom-0 left-0 opacity-15" />
      <div className="h-1 bg-gradient-to-r from-primary via-secondary to-accent absolute top-0 left-0 right-0" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="bg-[#1E1B4B]/90 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl p-8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-primary">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-white">ShowPass</p>
              <p className="text-purple-400 text-xs">Admin Console</p>
            </div>
          </div>

          <h1 className="text-2xl font-black text-white mb-1">Admin Sign In</h1>
          <p className="text-purple-300 text-sm mb-6">Enter your admin credentials to access the dashboard.</p>

          {error && (
            <div className="mb-4 bg-red-900/40 border border-red-700/50 rounded-xl p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="admin@showpass.vn"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/40 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient text-white py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
