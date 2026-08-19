import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signInStaff } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await signInStaff(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center p-4">
      <div className="bg-[#1c1b1b] border border-[#353534] rounded-3xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#6e4025] rounded-full blur-3xl opacity-30"></div>

        {/* Brand Header */}
        <div className="text-center mb-8 relative z-10">
          <img src="/logo.svg" alt="BR&CO CAFE" className="w-16 h-16 mx-auto mb-3 object-contain" />
          <h1 className="font-headline-lg text-2xl font-bold text-[#e5e2e1] tracking-tight">
            Brunch<span className="text-[#fab895]">&</span>Co Admin
          </h1>
          <p className="text-xs text-[#9f8d85] font-label-caps uppercase tracking-wider mt-1">
            Internal Staff & POS Portal
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-rose-950/60 border border-rose-800/50 text-rose-300 text-xs p-3 rounded-xl text-center leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs relative z-10">
          <div>
            <label className="text-[#9f8d85] block mb-1 font-medium">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9f8d85]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@brunchandco.com"
                className="w-full bg-[#131313] border border-[#353534] rounded-xl pl-9 pr-3 py-2.5 text-[#e5e2e1] focus:outline-none focus:border-[#fab895] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[#9f8d85] block mb-1 font-medium">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9f8d85]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#131313] border border-[#353534] rounded-xl pl-9 pr-3 py-2.5 text-[#e5e2e1] focus:outline-none focus:border-[#fab895] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#6e4025] to-[#4d260d] hover:from-[#804b2b] hover:to-[#5c2d10] text-[#eeae8b] border border-[#fab895]/40 font-bold py-3 rounded-xl shadow-lg shadow-[#4d260d]/40 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#eeae8b]" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
