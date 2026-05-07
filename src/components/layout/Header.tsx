import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, Shield, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { auth } from '../../lib/firebase';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

export default function Header() {
  const { user, profile } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white font-bold text-xl">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 hidden sm:block">
            Stroy-Market
          </span>
        </Link>

        <nav className="flex items-center space-x-4">
          <Link
            to="/"
            className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
          >
            Barcha mahsulotlar
          </Link>
          
          {user ? (
            <>
              {profile?.role === 'seller' && (
                <Link
                  to="/seller"
                  className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
                >
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Sotuvchi paneli</span>
                </Link>
              )}
              
              {profile?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin panel</span>
                </Link>
              )}

              <Link
                to="/cart"
                className="relative flex items-center justify-center p-2 text-gray-600 hover:text-orange-600 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div className="flex items-center space-x-2 border-l pl-4">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900 leading-none">
                    {profile?.displayName || user.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{profile?.role || 'User'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/cart"
                className="relative flex items-center justify-center p-2 text-gray-600 hover:text-orange-600 transition-colors mr-2"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                to="/login"
                className="group flex items-center justify-center space-x-2 rounded-full bg-orange-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-orange-700 hover:shadow-lg active:scale-95"
              >
                <User className="h-4 w-4" />
                <span>Kirish</span>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
