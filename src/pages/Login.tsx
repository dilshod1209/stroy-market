import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRole } from '../types';
import { LogIn, UserPlus, Box, Phone, User, Key, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<UserRole>('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await setPersistence(auth, browserLocalPersistence);
      
      if (mode === 'signup') {
        const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = result.user;
        
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: formData.name,
          phoneNumber: formData.phone,
          role: role,
          createdAt: new Date().toISOString()
        });
      } else {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      }
      
      navigate('/');
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto mt-8 bg-white p-8 rounded-3xl shadow-2xl border border-gray-100"
    >
      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 mb-4">
          <Box className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stroy-Market</h1>
        <div className="flex justify-center mt-6 p-1 bg-gray-100 rounded-2xl">
          <button 
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${mode === 'login' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Kirish
          </button>
          <button 
            onClick={() => setMode('signup')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${mode === 'signup' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Ro'yxatdan o'tish
          </button>
        </div>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        {mode === 'signup' && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${role === 'buyer' ? 'border-orange-600 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-500'}`}
              >
                Xaridor
              </button>
              <button
                type="button"
                onClick={() => setRole('seller')}
                className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${role === 'seller' ? 'border-orange-600 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-500'}`}
              >
                Sotuvchi
              </button>
            </div>
            
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                required
                name="name"
                placeholder="To'liq ismingiz"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                required
                name="phone"
                placeholder="Telefon raqamingiz"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              />
            </div>
          </>
        )}

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            required
            type="email"
            name="email"
            placeholder="Email manzilingiz"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
          />
        </div>

        <div className="relative">
          <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            required
            type="password"
            name="password"
            placeholder="Parolingiz"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
          />
        </div>

        {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-gray-200"
        >
          {loading ? 'Kutilmoqda...' : (mode === 'login' ? 'Kirish' : "Ro'yxatdan o'tish")}
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-gray-100 text-center">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
          Stroy-Market &bull; Xavfsiz Tranzaksiyalar
        </p>
      </div>
    </motion.div>
  );
}
