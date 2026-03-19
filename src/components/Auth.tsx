import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, googleProvider, signInWithPopup, db, doc, setDoc, getDoc, serverTimestamp, sendPasswordResetEmail, getNextUserNumber } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, User } from 'firebase/auth';
import { Cpu, Mail, Lock, LogIn, UserPlus, Chrome, AlertCircle, User as UserIcon, AtSign, Check, X, RefreshCw, Sparkles } from 'lucide-react';

interface AuthProps {
  darkMode: boolean;
}

export const Auth: React.FC<AuthProps> = ({ darkMode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [profession, setProfession] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    document.title = isLogin ? 'Login - DXM SMART AI' : 'Sign Up - DXM SMART AI';
  }, [isLogin]);

  const createUserProfile = async (user: User, extraData?: { fullName?: string, username?: string, profession?: string }) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const userNumber = await getNextUserNumber();
      const profileData = {
        uid: user.uid,
        userNumber,
        name: extraData?.fullName || user.displayName || user.email?.split('@')[0],
        email: user.email,
        displayName: extraData?.fullName || user.displayName || user.email?.split('@')[0],
        username: extraData?.username || user.email?.split('@')[0] + Math.floor(1000 + Math.random() * 9000),
        profession: extraData?.profession || 'User',
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        role: 'user',
        status: 'active',
        warningCount: 0,
        warnings: 0,
        totalMessages: 0,
        createdAt: serverTimestamp(),
        reg_no: `DXM-${String(userNumber).padStart(4, '0')}`
      };

      await setDoc(userDocRef, profileData);
      localStorage.setItem('dxm_user_profile', JSON.stringify(profileData));
    } else {
      localStorage.setItem('dxm_user_profile', JSON.stringify(userDoc.data()));
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await createUserProfile(result.user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        if (result.user) {
          await createUserProfile(result.user);
        }
      } else {
        if (!fullName || !username) throw new Error('Please fill in all fields');
        const result = await createUserWithEmailAndPassword(auth, email, password);
        if (result.user) {
          await createUserProfile(result.user, { fullName, username, profession });
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setSuccess('Password reset link sent to your email.');
      setShowResetModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden perspective-2000 ${darkMode ? 'bg-[#0b0e11] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-400/10 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      
      <div className="relative w-full max-w-md h-[650px] preserve-3d transition-transform duration-1000" style={{ transform: isLogin ? 'rotateY(0deg)' : 'rotateY(180deg)' }}>
        {/* Sign In Card */}
        <div className={`absolute inset-0 p-8 rounded-[2.5rem] glass-dark backface-hidden flex flex-col shadow-2xl border border-white/10 z-10`}>
          <div className="flex flex-col items-center mb-8">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20 mb-4"
            >
              <Sparkles size={32} />
            </motion.div>
            <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">SIGN IN</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">v10</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4 flex-1">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-4">Email</label>
              <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus-within:border-sky-400/50 transition-all">
                <Mail size={16} className="text-slate-500" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="bg-transparent border-none focus:ring-0 text-sm w-full p-0" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-4">Password</label>
              <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus-within:border-sky-400/50 transition-all">
                <Lock size={16} className="text-slate-500" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-transparent border-none focus:ring-0 text-sm w-full p-0" />
              </div>
              <div className="flex justify-end px-2">
                <button type="button" onClick={() => setShowResetModal(true)} className="text-[9px] font-black text-sky-400 hover:text-blue-500 transition-colors uppercase tracking-widest">Forgot Password?</button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-sky-400 to-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-[9px] uppercase"><span className="px-4 bg-[#0b0e11] text-slate-500 font-black tracking-widest">Social Connect</span></div>
          </div>

          <button onClick={handleGoogleSignIn} disabled={loading} className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3">
            <Chrome size={18} className="text-sky-400" /> Google Account
          </button>

          <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
            New here? <button onClick={() => setIsLogin(false)} className="text-sky-400 font-black hover:underline">Create Account</button>
          </p>
        </div>

        {/* Sign Up Card */}
        <div className={`absolute inset-0 p-8 rounded-[2.5rem] glass-dark backface-hidden flex flex-col shadow-2xl border border-white/10 [transform:rotateY(180deg)]`}>
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-sky-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-3">
              <UserPlus size={28} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent">SIGN UP</h1>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Join the v10 Era</p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-3">Full Name</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-600/50 text-xs focus:ring-0" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-3">Username</label>
                <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="User" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-600/50 text-xs focus:ring-0" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-3">Profession</label>
              <input type="text" required value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="e.g. Developer, Student" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-600/50 text-xs focus:ring-0" />
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-3">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-600/50 text-xs focus:ring-0" />
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 ml-3">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-blue-600/50 text-xs focus:ring-0" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-sky-400 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-2">
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <><UserPlus size={18} /> Sign Up</>}
            </button>
          </form>

          <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Already joined? <button onClick={() => setIsLogin(true)} className="text-blue-600 font-black hover:underline">Sign In</button>
          </p>
        </div>
      </div>

      {/* Reset Modal - Glassmorphism */}
      <AnimatePresence>
        {showResetModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-md w-full p-8 rounded-[2.5rem] glass-dark border border-white/10 shadow-2xl relative">
              <button onClick={() => setShowResetModal(false)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
              <h2 className="text-2xl font-black tracking-tighter mb-2 text-sky-400">RESET PASSWORD</h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6">Enter email to receive reset link</p>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="your@email.com" className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-sky-400/50 text-sm focus:ring-0" />
                <button type="submit" disabled={loading} className="w-full py-4 bg-sky-400 text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:opacity-90 transition-all">
                  {loading ? <RefreshCw size={18} className="animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
