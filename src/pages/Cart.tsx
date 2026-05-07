import { ShoppingCart, ArrowLeft, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../lib/utils';
import { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function Cart() {
  const { items, removeFromCart, addToCart, clearCart, total } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!auth.currentUser) {
      alert('Iltimos, buyurtma berish uchun tizimga kiring');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'orders'), {
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName,
        items: items,
        total: total,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      alert('Buyurtmangiz muvaffaqiyatli qabul qilindi!');
      clearCart();
      navigate('/');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Buyurtma berishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <Link to="/" className="p-2 rounded-xl bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 transition-all">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Savatcha</h1>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  key={item.id}
                  className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
                >
                  <div className="h-20 w-20 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden">
                    <img 
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=200'} 
                      alt={item.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.category}</p>
                    <p className="font-bold text-orange-600 mt-1">{formatPrice(item.price)}</p>
                  </div>

                  <div className="flex items-center space-x-3 bg-gray-50 p-1 rounded-xl">
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-gray-700">{item.quantity}</span>
                    <button 
                      onClick={() => addToCart(item)}
                      className="p-1 rounded-lg text-gray-400 hover:text-orange-600 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Buyurtma xulosasi</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Mahsulotlar</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Yetkazib berish</span>
                <span className="text-green-600 font-bold">Bepul</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-xl text-gray-900">
                <span>Jami</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <CreditCard className="h-5 w-5" />
              <span>{loading ? 'Yuborilmoqda...' : 'Rasmiylashtirish'}</span>
            </button>
            <p className="text-[10px] text-gray-400 text-center">
              "Rasmiylashtirish" tugmasini bosish orqali siz xarid shartlariga rozilik bildirasiz.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gray-50 text-gray-300 mb-6">
            <ShoppingCart className="h-12 w-12" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Savatcha bo'sh</h3>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto">Siz hali birorta mahsulotni savatchaga qo'shmagansiz.</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-orange-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-orange-700 transition-all active:scale-95 shadow-lg shadow-orange-200"
          >
            <span>Xaridni boshlash</span>
          </Link>
        </div>
      )}
    </div>
  );
}
