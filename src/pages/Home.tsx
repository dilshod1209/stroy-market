import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, PackageSearch } from 'lucide-react';
import { motion } from 'motion/react';

const CATEGORIES = ['Barchasi', 'G\'isht', 'Sement', 'Yog\'och', 'Bo\'yoq', 'Elektr', 'Santexnika'];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(50));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
      setLoading(false);
    }, (error) => {
      console.error('Snapshot error:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'Barchasi' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gray-900 px-8 py-12 md:py-20 text-white">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 opacity-20">
          <div className="h-64 w-64 rounded-full bg-orange-600 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
          >
            Sifatli qurilish materiallari <span className="text-orange-500">bir joyda</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400 mb-8"
          >
            O'zbekistondagi eng yirik qurilish materiallari marketplace platformasi.
            Uyingizni biz bilan quring.
          </motion.p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-orange-600 hover:bg-orange-700 px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95">
              Xaridni boshlash
            </button>
            <button className="bg-white/10 hover:bg-white/20 border border-white/10 px-8 py-3 rounded-xl font-bold backdrop-blur-sm transition-all">
              Biz haqimizda
            </button>
          </div>
        </div>
      </section>

      {/* Filter & Search */}
      <div className="sticky top-20 z-40 bg-gray-50/80 backdrop-blur-md py-4 -mx-4 px-4 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-gray-200">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-200'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Mahsulot izlash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-100 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
          />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse flex flex-col space-y-3">
              <div className="aspect-square bg-gray-200 rounded-2xl" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-6">
            <PackageSearch className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Mahsulot topilmadi</h3>
          <p className="text-gray-500">Qidiruv natijalari bo'yicha hech narsa topilmadi. Boshqa so'z bilan urinib ko'ring.</p>
        </div>
      )}
    </div>
  );
}
