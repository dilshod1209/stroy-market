import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, UserProfile, Order } from '../types';
import { formatPrice } from '../lib/utils';
import { Users, ShoppingBag, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, these should be server-side aggregations
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setStats(prev => ({ ...prev, users: snap.size }));
    });
    const unsubProds = onSnapshot(collection(db, 'products'), (snap) => {
      setStats(prev => ({ ...prev, products: snap.size }));
    });
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
        const orders = snap.docs.map(doc => doc.data() as Order);
        const revenue = orders.reduce((acc, order) => acc + (order.total || 0), 0);
        setStats(prev => ({ ...prev, orders: snap.size, revenue }));
        setLoading(false);
    });

    return () => {
      unsubUsers();
      unsubProds();
      unsubOrders();
    };
  }, []);

  const chartData = [
    { name: 'Dush', sales: 4000 },
    { name: 'Sesh', sales: 3000 },
    { name: 'Chor', sales: 2000 },
    { name: 'Pay', sales: 2780 },
    { name: 'Jum', sales: 1890 },
    { name: 'Shan', sales: 2390 },
    { name: 'Yak', sales: 3490 },
  ];

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <TrendingUp className="h-4 w-4 text-green-500" />
      </div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Platformaning umumiy holati va statistikasi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Foydalanuvchilar" 
          value={stats.users} 
          icon={Users} 
          color="bg-blue-600" 
        />
        <StatCard 
          title="Mahsulotlar" 
          value={stats.products} 
          icon={ShoppingBag} 
          color="bg-orange-600" 
        />
        <StatCard 
          title="Buyurtmalar" 
          value={stats.orders} 
          icon={Activity} 
          color="bg-purple-600" 
        />
        <StatCard 
          title="Umumiy tushum" 
          value={formatPrice(stats.revenue)} 
          icon={DollarSign} 
          color="bg-green-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Haftalik savdo grafigi</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Oxirgi harakatlar</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-orange-600 font-bold border border-gray-100">
                    U
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Yangi foydalanuvchi qo'shildi</p>
                    <p className="text-xs text-gray-500">2 daqiqa oldin</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-orange-600 uppercase">
                  Ko'rish
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
