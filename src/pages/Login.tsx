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
    <div className="min-h-screen bg-[#F6F1EB] flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#000000]/10 rounded-3xl w-full max-w-md p-8 shadow-xl relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#7a4900]/10 rounded-full blur-3xl opacity-50"></div>

        {/* Brand Header */}
        <div className="text-center mb-8 relative z-10">
          <img src="/logo.jpeg" alt="Brunch & Co" className="w-16 h-16 mx-auto mb-3 object-contain rounded-2xl shadow-xs" />
          <h1 className="font-headline-lg text-2xl font-bold text-[#000000] tracking-tight">
            Brunch<span className="text-[#7a4900]">&</span>Co Admin
          </h1>
          <p className="text-xs text-[#7a4900] font-label-caps uppercase tracking-wider mt-1">
            Internal Staff & POS Portal
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl text-center leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs relative z-10">
          <div>
            <label className="text-[#7a4900] block mb-1 font-medium">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7a4900]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@brunchandco.com"
                className="w-full bg-[#FFFDF7] border border-[#000000]/15 rounded-xl pl-9 pr-3 py-2.5 text-[#000000] placeholder-[#7a4900]/40 focus:outline-none focus:border-[#3d2500] focus:ring-1 focus:ring-[#3d2500] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[#7a4900] block mb-1 font-medium">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7a4900]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FFFDF7] border border-[#000000]/15 rounded-xl pl-9 pr-3 py-2.5 text-[#000000] placeholder-[#7a4900]/40 focus:outline-none focus:border-[#3d2500] focus:ring-1 focus:ring-[#3d2500] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#000000] hover:bg-[#3d2500] text-[#FFFDF7] font-bold py-3 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#FFFDF7]" />
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
