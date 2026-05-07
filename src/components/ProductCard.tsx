import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';
import { motion } from 'motion/react';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-xl hover:border-orange-200"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.imageUrl || `https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=400`}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button className="p-3 rounded-full bg-white text-gray-900 hover:bg-gray-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <Eye className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
            {product.category || 'Qurilish'}
          </span>
          <span className="text-xs text-gray-400">ID: {product.id.slice(0, 5)}</span>
        </div>
        <h3 className="mb-1 text-base font-semibold text-gray-900 line-clamp-1">
          {product.name}
        </h3>
        <p className="mb-4 text-xs text-gray-500 line-clamp-2">
          {product.description || 'Sifatli qurilish materiali, barcha standartlarga javob beradi.'}
        </p>
        
        <div className="mt-auto flex items-center justify-between">
          <p className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </p>
          <button
            onClick={() => addToCart(product)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white hover:bg-orange-700 active:scale-95 transition-all shadow-md shadow-orange-200"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
