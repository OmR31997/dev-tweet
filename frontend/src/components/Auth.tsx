import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  auth,
  googleProvider,
  signInWithPopup,
  onAuthStateChanged,
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from '../apiClient';
import { LogIn, Mail, Lock, User as UserIcon, X, Globe, Eye, EyeOff } from 'lucide-react';
import PageLoader from './ui/PageLoader';
import ErrorMessage from './ui/ErrorMessage';
import { formatAuthError } from '../utils/authErrorMessage';
import Avatar from './ui/Avatar';

/** Module-level component so the form is not remounted every parent render (fixes focus loss on each keystroke). */
function AuthFormFields({
  isLogin,
  setIsLogin,
  email,
  setEmail,
  password,
  setPassword,
  displayName,
  setDisplayName,
  error,
  showPassword,
  setShowPassword,
  onEmailAuth,
  onGoogleLogin,
}: {
  isLogin: boolean;
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  displayName: string;
  setDisplayName: (v: string) => void;
  error: string;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  onEmailAuth: (e: React.FormEvent) => void;
  onGoogleLogin: () => void;
}) {
  return (
    <div className="px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
      <div className="mb-4 text-center">
        <h2 className="heading text-2xl sm:text-3xl">{isLogin ? 'Welcome back' : 'Create account'}</h2>
        <p className="mt-1 text-muted">{isLogin ? 'Sign in to your workspace' : 'Join the developer community'}</p>
      </div>

      <form onSubmit={onEmailAuth} className="space-y-3">
        {!isLogin && (
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-[0.95rem] font-semibold text-[var(--text-primary)]">
              <UserIcon size={15} className="text-black" /> Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-field"
              placeholder="Ada Lovelace"
            />
          </div>
        )}
        <div className="space-y-1">
          <label className="flex items-center gap-1.5 text-[0.95rem] font-semibold text-[var(--text-primary)]">
            <Mail size={15} className="text-black" /> Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="you@company.dev"
            autoComplete="email"
          />
        </div>
        <div className="space-y-1">
          <label className="flex items-center gap-1.5 text-[0.95rem] font-semibold text-[var(--text-primary)]">
            <Lock size={15} className="text-black" /> Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pr-10"
              placeholder="••••••••"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted hover:bg-primary/15 hover:text-black"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error ? <ErrorMessage>{error}</ErrorMessage> : null}

        <motion.button
          type="submit"
          className="btn-cta mt-0.5 w-full py-2.5 text-base font-semibold"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {isLogin ? 'Sign in' : 'Sign up'}
        </motion.button>
      </form>

      <div className="mt-4 space-y-3 text-center">
        <p className="text-[0.95rem] text-muted">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold text-black underline decoration-primary decoration-2 underline-offset-4 hover:bg-primary/20"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        <div className="relative py-0.5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[var(--surface-elevated)] px-2 text-[0.85rem] text-muted">Or continue with</span>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={onGoogleLogin}
          className="btn-secondary flex w-full items-center justify-center gap-2 py-2.5 text-base font-semibold"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Globe size={16} className="text-black" /> Google
        </motion.button>
      </div>
    </div>
  );
}

export default function Auth({ onAuthReady, inline = false }: { onAuthReady: (user: User | null) => void; inline?: boolean }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      onAuthReady(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [onAuthReady]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setShowAuthModal(false);
    } catch (error: unknown) {
      setError(formatAuthError(error instanceof Error ? error.message : 'Google sign-in failed'));
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const name = displayName.trim() || email.split('@')[0];
        await updateProfile(userCredential.user, { displayName: name });
        setUser({ ...userCredential.user, displayName: name });
      }
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (error: unknown) {
      setError(formatAuthError(error instanceof Error ? error.message : 'Authentication failed'));
    }
  };

  if (loading) {
    if (inline) {
      return (
        <div className="auth-pages surface-loader-card flex min-h-[200px] w-full max-w-sm items-center justify-center">
          <PageLoader variant="auth" compact />
        </div>
      );
    }
    return null;
  }

  const formProps = {
    isLogin,
    setIsLogin,
    email,
    setEmail,
    password,
    setPassword,
    displayName,
    setDisplayName,
    error,
    showPassword,
    setShowPassword,
    onEmailAuth: handleEmailAuth,
    onGoogleLogin: handleGoogleLogin,
  };

  if (inline) {
    return (
      <motion.div
        className="surface-card relative w-full max-w-[20rem] shrink-0 rounded-xl sm:max-w-[22rem]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      >
        <AuthFormFields {...formProps} />
      </motion.div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {user ? (
        <div className="flex min-w-0 items-center">
          <Avatar
            name={user.displayName}
            src={user.photoURL}
            alt={user.displayName || 'Your profile'}
            className="h-9 w-9 shrink-0 rounded-full border border-black/12 object-cover ring-2 ring-primary/20 sm:h-10 sm:w-10"
            initialsClassName="flex items-center justify-center rounded-full border border-black/12 bg-black/85 text-xs font-bold text-primary ring-2 ring-primary/20 sm:text-sm"
          />
        </div>
      ) : (
        <>
          <motion.button
            type="button"
            onClick={() => setShowAuthModal(true)}
            className="btn-cta flex items-center gap-2 px-4 py-2 text-sm touch-manipulation"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogIn size={16} className="shrink-0" />
            <span className="hidden min-[400px]:inline">Sign in</span>
          </motion.button>

          <AnimatePresence>
            {showAuthModal && (
              <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/50 p-4 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAuthModal(false)}
              >
                <motion.div
                  className="auth-pages surface-card relative my-auto w-full max-w-[20rem] rounded-xl sm:max-w-[22rem]"
                  initial={{ opacity: 0, scale: 0.96, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(false)}
                    className="absolute right-3 top-3 rounded-xl p-2 text-muted hover:bg-black/5"
                  >
                    <X size={20} />
                  </button>
                  <AuthFormFields {...formProps} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
