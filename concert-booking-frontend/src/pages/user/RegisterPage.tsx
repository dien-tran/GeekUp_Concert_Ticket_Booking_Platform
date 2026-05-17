import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userService } from '../../services/bookingService';
import { Button } from '../../components/ui/Button';
import { FormInput } from '../../components/ui/FormInputs';
import { ROUTES } from '../../constants/routes';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError('Please fill in all fields.'); return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }

    setLoading(true);
    setError('');
    try {
      await userService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });
      setSuccess(true);
      setTimeout(() => navigate(ROUTES.LOGIN), 2000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F7FF] via-white to-[#FDF2F8] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Account Created!</h2>
          <p className="text-gray-500">Redirecting you to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F7FF] via-white to-[#FDF2F8] flex items-center justify-center p-4">
      <div className="orb orb-primary w-72 h-72 -top-24 -right-24 animate-float" />
      <div className="orb orb-accent w-64 h-64 bottom-0 left-0 animate-float-slow" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="bg-white rounded-3xl shadow-card-hover border border-gray-100 p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <span className="font-bold text-xl text-gradient-primary">ShowPass</span>
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm mb-6">Join thousands of fans booking concerts every day.</p>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange('name')}
              required
            />
            <FormInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange('email')}
              required
            />
            <FormInput
              label="Phone"
              type="tel"
              placeholder="0912345678"
              value={formData.phone}
              onChange={handleChange('phone')}
              required
            />
            <FormInput
              label="Password"
              type="password"
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={handleChange('password')}
              required
            />
            <FormInput
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              required
            />

            <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
