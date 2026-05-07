import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';
import { Plus, Pencil, Trash2, Package, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';

export default function SellerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm<Partial<Product>>();

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'products'), 
      where('sellerId', '==', auth.currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setValue('name', product.name);
      setValue('price', product.price);
      setValue('category', product.category);
      setValue('stock', product.stock);
      setValue('description', product.description);
      setValue('imageUrl', product.imageUrl);
    } else {
      setEditingProduct(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: Partial<Product>) => {
    if (!auth.currentUser) return;
    setSubmitting(true);

    try {
      const productData = {
        ...data,
        price: Number(data.price),
        stock: Number(data.stock),
        sellerId: auth.currentUser.uid,
        updatedAt: serverTimestamp(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: serverTimestamp(),
        });
      }
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Haqiqatdan ham ushbu mahsulotni o\'chirmoqchimisiz?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mening mahsulotlarim</h1>
          <p className="text-gray-500">Sotuvdagi barcha mahsulotlaringizni boshqaring</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-orange-700 transition-all active:scale-95 shadow-lg shadow-orange-200"
        >
          <Plus className="h-5 w-5" />
          <span>Yangi qo'shish</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <motion.div
              layout
              key={product.id}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="flex gap-4">
                <div className="h-20 w-20 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                  <img 
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=200'} 
                    alt="" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center flex-1">
                  <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                  <p className="text-orange-600 font-bold mt-1">{formatPrice(product.price)}</p>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Omborda</span>
                  <span className="text-sm font-bold text-gray-700">{product.stock} dona</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal(product)}
                    className="p-2.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400 mb-4">
            <Package className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Mahsulotlar yo'q</h3>
          <p className="text-gray-500 max-w-xs mx-auto mt-2">Siz hali birorta mahsulot qo'shmagansiz. Sotishni boshlash uchun "Yangi qo'shish" tugmasini bosing.</p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nomi</label>
                  <input
                    {...register('name', { required: true })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    placeholder="Masalan: Pishgan g'isht"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Narxi (UZS)</label>
                    <input
                      type="number"
                      {...register('price', { required: true })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Soni (ko'rinishda)</label>
                    <input
                      type="number"
                      {...register('stock', { required: true })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Kategoriya</label>
                  <select
                    {...register('category')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  >
                    <option value="G'isht">G'isht</option>
                    <option value="Sement">Sement</option>
                    <option value="Yog'och">Yog'och</option>
                    <option value="Bo'yoq">Bo'yoq</option>
                    <option value="Elektr">Elektr</option>
                    <option value="Santexnika">Santexnika</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Rasm URL (ixtiyoriy)</label>
                  <input
                    {...register('imageUrl')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tavsif</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  />
                </div>

                <div className="pt-4">
                  <button
                    disabled={submitting}
                    className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-orange-100"
                  >
                    {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                    <span>{editingProduct ? 'Saqlash' : 'Qo\'shish'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
