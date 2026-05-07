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
      // Basic validation
      if (formData.password.length < 6) {
        throw new Error('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      }

      await setPersistence(auth, browserLocalPersistence);
      
      // Internal email mapping logic
      // We use phone number for unique identification since multiple users can have the same display name.
      // For signup, both name and phone are required.
      // For login, the user provides a name, and we find the associated phone/email.
      
      if (mode === 'signup') {
        if (!formData.phone || formData.phone.length < 9) {
          throw new Error('Iltimos to\'g\'ri telefon raqamini kiriting');
        }

        const internalEmail = `${formData.phone.replace(/[^0-9]/g, '')}@stroy.market`;
        const result = await createUserWithEmailAndPassword(auth, internalEmail, formData.password);
        const user = result.user;
        
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: internalEmail,
          displayName: formData.name,
          phoneNumber: formData.phone,
          role: role,
          createdAt: new Date().toISOString()
        });
      } else {
        // LOGIN MODE
        const loginInput = formData.name.trim();
        let targetEmail = '';

        if (loginInput.includes('@')) {
          targetEmail = loginInput;
        } else if (/^\+?\d+$/.test(loginInput.replace(/\s/g, ''))) {
          // Input looks like a phone number
          const cleanPhone = loginInput.replace(/[^0-9]/g, '');
          targetEmail = `${cleanPhone}@stroy.market`;
        } else {
          // Input is a Name. Try to find the user in Firestore.
          try {
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const q = query(collection(db, 'users'), where('displayName', '==', loginInput));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              // Get the first user found with this name
              targetEmail = querySnapshot.docs[0].data().email;
            } else {
              throw new Error('Ushbu ism bilan foydalanuvchi topilmadi. Iltimos telefon raqamingizni kiriting.');
            }
          } catch (err: any) {
             console.error('User lookup error:', err);
             throw new Error(err.message || 'Foydalanuvchini topishda xatolik yuz berdi');
          }
        }
        
        await signInWithEmailAndPassword(auth, targetEmail, formData.password);
      }
      
      navigate('/');
    } catch (err: any) {
      console.error('Auth logic error:', err);
      let errorMsg = err.message || 'Xatolik yuz berdi';
      
      if (err.code === 'auth/network-request-failed') {
        errorMsg = 'Tarmoq xatoligi. Iltimos internetingizni tekshiring yoki keyinroq qayta urunib ko\'ring.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMsg = 'Ism, telefon yoki parol noto\'g\'ri.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'Ushbu telefon raqami allaqachon ro\'yxatdan o\'tgan.';
      }
      
      setError(errorMsg);
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
        )}

        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            required
            name="name"
            placeholder={mode === 'signup' ? "To'liq ismingiz" : "Ismingiz yoki Telefon"}
            value={formData.name}
            onChange={handleInputChange}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
          />
        </div>

        {mode === 'signup' && (
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
        )}

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

        {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-xl">{error}</p>}

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
