import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageBackground from '../components/PageBackground';
import revealTextTree from '../components/TextReveal';
import { Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';

export default function Auth({ mode = 'night' }) {
  const isDay = mode === 'day';
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
      } else {
        login(data.user);
        navigate(isDay ? '/day/profile' : '/my');
      }
    } catch {
      setError('Unable to reach sanctuary server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return revealTextTree((
    <div className={`relative min-h-screen bg-transparent pt-32 pb-20 px-4 flex flex-col justify-center items-center ${isDay ? 'day-auth' : ''}`}>
      {!isDay && <PageBackground image="/images/img-01.jpg" />}

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Toggle Pills */}
        <div className="liquid-glass rounded-full p-1 flex mb-8 max-w-xs mx-auto border border-white/10">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
              isLogin ? 'bg-white text-black font-semibold shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
              !isLogin ? 'bg-white text-black font-semibold shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Create account
          </button>
        </div>

        {/* Auth Glass Card */}
        <div className="liquid-glass rounded-3xl p-7 sm:p-9 border border-white/15 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl sm:text-4xl text-white text-aura mb-2">
              {isLogin ? 'Welcome back' : 'Your private sanctuary'}
            </h1>
            <p className="text-zinc-300 text-sm">
              {isLogin
                ? 'Step back into your private letters and thoughts.'
                : 'Sign up with email. You will receive a random anonymous handle.'}
            </p>
          </div>

          {!isLogin && (
            <div className="liquid-glass rounded-2xl p-3.5 mb-6 border border-white/10 flex items-start gap-3 text-left">
              <Sparkles className="w-4 h-4 text-zinc-300 mt-0.5 shrink-0" />
              <p className="text-xs text-zinc-300 leading-relaxed">
                <strong className="text-white">Strict privacy:</strong> Your email is strictly private and never displayed publicly. Your public identity will be a generated handle like <em className="text-zinc-100">quiet_owl_482</em>.
              </p>
            </div>
          )}

          {error && (
            <div className="liquid-glass bg-red-950/20 border border-red-500/30 text-zinc-200 text-xs rounded-2xl p-3 mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full liquid-glass rounded-full px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none border border-white/15 focus:border-white/50"
                />
                <Mail className="absolute right-4 top-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5 font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full liquid-glass rounded-full px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none border border-white/15 focus:border-white/50"
                />
                <Lock className="absolute right-4 top-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
              {!isLogin && (
                <span className="text-[11px] text-zinc-500 mt-1 block px-2">Minimum 6 characters</span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 active:scale-98 transition-all disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isLogin ? 'Enter sanctuary' : 'Create anonymous space'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-zinc-400" />
            <span>Encrypted passwords • No IP tracking</span>
          </div>
        </div>
      </div>
    </div>
  ));
}
