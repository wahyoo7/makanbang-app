import React, { useState, useMemo, useEffect } from 'react';
import { 
  Utensils, Wallet, Users, Store, List, 
  ShoppingCart, Plus, Minus, Check, LogOut, 
  AlertCircle, ChevronRight, Receipt, Clock,
  Sparkles, Star, MessageSquare, Copy, ChevronDown,
  TrendingUp, MapPin, Navigation, Compass, Award,
  Flame, Bell, Search, Filter, ShieldCheck, ArrowLeft
} from 'lucide-react';

// --- DATABASE SIMULASI (TEMA ADVENTURE FOOD) ---
const initialRestaurants = [
  { 
    id: 1, 
    name: 'Warteg Bahari Kingdom', 
    rating: 4.9, 
    reviews: 320, 
    category: 'Local Culinary • Cozy', 
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    tag: 'Terpopuler 🔥',
    distance: '200m dari Kantor',
    time: '15-20 mnt'
  },
  { 
    id: 2, 
    name: 'Geprek Bensu Volcano', 
    rating: 4.8, 
    reviews: 154, 
    category: 'Spicy Grill • Fast Food', 
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
    tag: 'Promo Juara 🏷️',
    distance: '800m dari Kantor',
    time: '20-25 mnt'
  },
  { 
    id: 3, 
    name: 'Soto Lamongan Cak Legendaris', 
    rating: 4.9, 
    reviews: 412, 
    category: 'Warm Soup • Authentic', 
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80',
    tag: 'Pilihan OB ⭐',
    distance: '1.2km dari Kantor',
    time: '25-30 mnt'
  }
];

const initialMenus = [
  { id: 1, restaurant_id: 1, name: 'Nasi Telur Dadar + Orek Tempe', price: 15000, desc: 'Perpaduan klasik nasi hangat, telur dadar krispi tebal, dan orek tempe manis basah.', popular: true, tag: 'Recomended' },
  { id: 2, restaurant_id: 1, name: 'Nasi Ayam Goreng Serundeng', price: 18000, desc: 'Ayam goreng empuk bumbu ungkep ditaburi serundeng kelapa gurih melimpah.', popular: true, tag: 'Must Try' },
  { id: 3, restaurant_id: 1, name: 'Es Teh Manis Jumbo Booster', price: 4000, desc: 'Es teh manis dingin ukuran gelas raksasa siap mengembalikan fokus kerjamu.', popular: false },
  { id: 4, restaurant_id: 2, name: 'Paket Geprek Lava Mozzarella', price: 25000, desc: 'Ayam geprek krispi diselimuti lelehan keju mozzarella molor dan sambal korek level petir.', popular: true, tag: 'Pedas Gila' },
  { id: 5, restaurant_id: 2, name: 'Jamur Crispy Kriuk Nagih', price: 10000, desc: 'Jamur tiram pilihan digoreng tepung bumbu rahasia super renyah.', popular: false },
  { id: 6, restaurant_id: 3, name: 'Soto Ayam Koya Istimewa', price: 18000, desc: 'Soto Lamongan kuah kuning kaya rempah dengan taburan koya gurih yang melimpah ruah.', popular: true, tag: 'Legendaris' },
  { id: 7, restaurant_id: 3, name: 'Soto Sapi Kuah Bening', price: 22000, desc: 'Potongan daging sapi empuk disiram kuah soto bening hangat menyegarkan.', popular: false },
];

const initialOrders = [
  {
    id: 1,
    userName: "Mbak Rini (HRD)",
    total: 19000,
    items: [
      { menuId: 1, name: 'Nasi Telur Dadar + Orek Tempe', price: 15000, qty: 1, notes: "Oreknya basah ya mas" },
      { menuId: 3, name: 'Es Teh Manis Jumbo Booster', price: 4000, qty: 1, notes: "" },
    ]
  },
  {
    id: 2,
    userName: "Mas Bimo (IT Support)",
    total: 25000,
    items: [
      { menuId: 4, name: 'Paket Geprek Lava Mozzarella', price: 25000, qty: 1, notes: "Sambal level 5!" },
    ]
  }
];

const formatRp = (num) => 'Rp ' + num.toLocaleString('id-ID');

export default function App() {
  // Navigation Screens State
  // "onboarding" | "login" | "user_dashboard" | "admin_dashboard" | "restaurant_detail" | "ticket_view"
  const [currentScreen, setCurrentScreen] = useState('onboarding');
  
  // App States
  const [currentUser, setCurrentUser] = useState(null);
  const [restaurants] = useState(initialRestaurants);
  const [menus] = useState(initialMenus);
  const [orders, setOrders] = useState(initialOrders);
  const [selectedResto, setSelectedResto] = useState(initialRestaurants[0]);
  const [cart, setCart] = useState([]);
  
  // Configuration
  const [session, setSession] = useState({
    isOpen: true,
    openRestoIds: [1, 2, 3],
    endTime: '11:45',
    bankAccount: 'BCA 872-019-2831 a.n Joko Susilo (OB)',
    rejectMessage: 'Waduh petualangan kuliner hari ini sudah ditutup! 😭 Hubungi OB jika darurat!'
  });

  const handleStartAdventure = () => {
    setCurrentScreen('login');
  };

  const handleLogin = (name, phone) => {
    const role = phone === '0000' ? 'admin' : 'user';
    setCurrentUser({ name, phone, role });
    if (role === 'admin') {
      setCurrentScreen('admin_dashboard');
    } else {
      setCurrentScreen('user_dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCart([]);
    setCurrentScreen('onboarding');
  };

  const viewRestoDetail = (resto) => {
    setSelectedResto(resto);
    setCurrentScreen('restaurant_detail');
  };

  const handleUpdateCart = (menu, delta) => {
    setCart(prev => {
      const existing = prev.find(item => item.menuId === menu.id);
      if (!existing) {
        if (delta > 0) return [...prev, { menuId: menu.id, name: menu.name, price: menu.price, qty: 1, notes: '' }];
        return prev;
      }
      const newQty = existing.qty + delta;
      if (newQty <= 0) return prev.filter(item => item.menuId !== menu.id);
      return prev.map(item => item.menuId === menu.id ? { ...item, qty: newQty } : item);
    });
  };

  const handleUpdateNotes = (menuId, notes) => {
    setCart(prev => prev.map(item => item.menuId === menuId ? { ...item, notes } : item));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleCheckout = () => {
    setOrders([...orders, {
      id: Date.now(),
      userName: currentUser.name + " (You)",
      items: cart,
      total: cartTotal
    }]);
    setCurrentScreen('ticket_view');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center font-sans antialiased p-4">
      
      {/* Container Device-Mockup (Sangat dioptimalkan untuk HP) */}
      <div className="w-full max-w-[410px] bg-[#F7F8FC] h-[820px] flex flex-col relative shadow-[0_24px_60px_rgba(0,0,0,0.6)] rounded-[48px] border-[10px] border-slate-950 overflow-hidden">
        
        {/* Notch Kamera Depan HP */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-12 h-1.5 bg-slate-800 rounded-full"></div>
        </div>

        {/* SCREEN 1: ONBOARDING / ADVENTURE WELCOME (Kombinasi Gambar 1 & 2) */}
        {currentScreen === 'onboarding' && (
          <div className="flex-1 flex flex-col justify-between p-8 pt-16 bg-gradient-to-b from-[#E2E6FF] via-[#EAEFFF] to-[#F5F8FF]">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-indigo-600 tracking-wider">9:40 PM</span>
              <div className="flex gap-1 items-center">
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
              </div>
            </div>

            {/* Ilustrasi Utama 3D-Look */}
            <div className="my-auto text-center space-y-6">
              <div className="relative inline-block mx-auto">
                {/* Bubble Hiasan */}
                <div className="absolute -top-6 -left-6 w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center text-slate-900 shadow-md font-black text-lg transform -rotate-12 animate-bounce">
                  Hi! 👋
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center text-white shadow-lg transform rotate-12">
                  <Flame size={28} className="animate-pulse" />
                </div>
                
                {/* Gambar Karakter / Makanan (Menggunakan Avatar/Simbol Premium) */}
                <div className="w-48 h-48 rounded-[40px] bg-gradient-to-tr from-indigo-200 to-indigo-100 flex items-center justify-center shadow-inner border-4 border-white">
                  <span className="text-8xl">🍱</span>
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
                  Let's Start Your <br />
                  <span className="text-indigo-600 bg-indigo-100 px-3 py-1 rounded-2xl inline-block mt-1 transform -rotate-1">
                    Food Adventure
                  </span>
                </h1>
                <p className="text-xs text-slate-500 max-w-[250px] mx-auto leading-relaxed">
                  Pesan makan siang bersama rekan kantor dengan menyenangkan, cepat, & terkoordinasi.
                </p>
              </div>
            </div>

            {/* Tombol Aksi Bawah */}
            <div className="space-y-3">
              <button 
                onClick={handleStartAdventure}
                className="w-full bg-indigo-600 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 active:scale-[0.98] transition duration-200 flex items-center justify-between text-sm"
              >
                <span>Mulai Petualangan</span>
                <div className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center">
                  <ChevronRight size={18} />
                </div>
              </button>
              <div className="flex justify-between items-center px-2">
                <span className="text-xs text-slate-400 font-semibold cursor-pointer hover:text-indigo-600" onClick={() => handleLogin('Admin OB', '0000')}>Masuk OB</span>
                <span className="text-xs text-slate-400 font-semibold">MakanBang v2.5</span>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: LOGIN */}
        {currentScreen === 'login' && (
          <div className="flex-1 flex flex-col justify-between p-8 pt-16 bg-gradient-to-b from-[#FFF5E6] via-white to-[#F7F8FC]">
            <button onClick={() => setCurrentScreen('onboarding')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-800 border self-start">
              <ArrowLeft size={18} />
            </button>

            <div className="my-auto space-y-6">
              <div>
                <span className="text-xs font-extrabold text-amber-600 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">Level 1: Lapar</span>
                <h2 className="text-2xl font-black text-slate-800 mt-2">Daftarkan Karaktermu!</h2>
                <p className="text-xs text-slate-500 leading-relaxed">Masukkan identitas panggilan kantormu agar OB tidak salah antar makanan.</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Panggilan Kantor</label>
                  <input 
                    type="text" 
                    placeholder="Misal: Mas Wahyu, Mbak Isna" 
                    id="login-name"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white p-3.5 rounded-2xl text-xs focus:outline-none transition-all duration-200 text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nomor Handphone</label>
                  <input 
                    type="text" 
                    placeholder="Masukkan No. HP Anda..." 
                    id="login-phone"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white p-3.5 rounded-2xl text-xs focus:outline-none transition-all duration-200 text-slate-800 font-bold"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                const name = document.getElementById('login-name')?.value || 'Karyawan Keren';
                const phone = document.getElementById('login-phone')?.value || '123';
                handleLogin(name, phone);
              }}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 hover:from-indigo-700 active:scale-[0.98] transition duration-200 text-xs"
            >
              Masuk ke Dashboard 🚀
            </button>
          </div>
        )}

        {/* SCREEN 3: USER DASHBOARD (Kombinasi Sempurna Gambar 1 & 2) */}
        {currentScreen === 'user_dashboard' && (
          <div className="flex-1 flex flex-col bg-[#F7F8FC] pt-12">
            {/* Header Profil & Level (Gambar 1) */}
            <div className="px-5 pb-4 flex justify-between items-center bg-white border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-indigo-500 flex items-center justify-center text-lg shadow-sm">
                  👨‍💻
                </div>
                <div>
                  <h4 className="font-black text-xs text-slate-800">Hello, {currentUser?.name}</h4>
                  <p className="text-[9px] text-indigo-600 font-semibold flex items-center gap-0.5"><Award size={10}/> Level 1: Lapar Berat</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="w-8 h-8 bg-slate-50 border rounded-full flex items-center justify-center text-slate-600 relative">
                  <Bell size={14} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
                </button>
                <button onClick={handleLogout} className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center text-red-500 transition">
                  <LogOut size={14} />
                </button>
              </div>
            </div>

            {/* Level Progress Bar (Mengambil ide Gamifikasi dari Gambar 1) */}
            <div className="px-5 pt-4">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-4 rounded-3xl shadow-md relative overflow-hidden">
                <div className="absolute right-2 bottom-2 text-5xl opacity-10">🏆</div>
                <div className="flex justify-between items-center text-[10px] font-extrabold tracking-wider text-indigo-200">
                  <span>EXP PETUALANGAN</span>
                  <span>10% menuju Kenyang</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-indigo-900/50 h-3 rounded-full mt-2 overflow-hidden p-0.5 border border-indigo-500/20">
                  <div className="bg-gradient-to-r from-amber-400 to-amber-300 h-full rounded-full transition-all duration-500" style={{ width: '10%' }}></div>
                </div>
                <p className="text-[9px] text-amber-300 font-medium mt-2">🔥 Tips: Pesan sebelum pukul {session.endTime} agar petualangan sukses!</p>
              </div>
            </div>

            {/* Kategori Makanan Quick Filter (Ide Kategori Lingkaran Gambar 1) */}
            <div className="px-5 pt-5 shrink-0">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Kategori Kuliner</h3>
                <span className="text-[10px] font-bold text-indigo-600">Lihat Semua</span>
              </div>
              <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
                {[
                  { icon: '🍛', name: 'Nasi Rames' },
                  { icon: '🍗', name: 'Ayam Geprek' },
                  { icon: '🍜', name: 'Soto Hangat' },
                  { icon: '🍹', name: 'Minuman' },
                ].map((cat, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 cursor-pointer group flex-shrink-0">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-slate-100 group-hover:border-indigo-500 transition duration-200">
                      {cat.icon}
                    </div>
                    <span className="text-[9px] font-bold text-slate-500">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Restoran Terbuka (Menggunakan Opsi Petualangan dari Gambar 2) */}
            <div className="flex-1 px-5 pt-4 overflow-y-auto pb-24 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Misi Makan Siang Aktif</h3>
                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full flex items-center gap-1">
                  <Clock size={10} /> Sisa {session.endTime}
                </span>
              </div>

              <div className="space-y-3">
                {restaurants.map(resto => (
                  <div key={resto.id} className="bg-white rounded-[24px] overflow-hidden border border-slate-150 shadow-sm hover:shadow-md transition duration-200">
                    <div className="relative h-28">
                      <img src={resto.image} alt={resto.name} className="w-full h-full object-cover brightness-90" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-4 flex flex-col justify-between">
                        <span className="self-end bg-amber-500 text-slate-950 font-black text-[8px] py-1 px-2.5 rounded-full uppercase tracking-wider">
                          {resto.tag}
                        </span>
                        <div>
                          <span className="text-[8px] font-bold text-amber-400 uppercase tracking-wider">REKOMENDASI OB</span>
                          <h4 className="text-sm font-black text-white">{resto.name}</h4>
                        </div>
                      </div>
                    </div>
                    {/* Detail Informasi Tiket Perjalanan (Gambar 2 Vibe) */}
                    <div className="p-4 flex justify-between items-center text-xs">
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 flex items-center gap-1"><MapPin size={10} /> {resto.distance}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1"><Clock size={10} /> Est. Pengiriman: {resto.time}</p>
                      </div>
                      <button 
                        onClick={() => viewRestoDetail(resto)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2 px-4 rounded-xl shadow-md text-[10px] flex items-center gap-1 transition"
                      >
                        Pilih Menu <ChevronRight size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Navigasi Bawah (Persis Gambar 1) */}
            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 backdrop-blur-md rounded-[24px] p-2.5 flex justify-around items-center text-slate-400 z-30 shadow-lg">
              <button className="flex flex-col items-center gap-0.5 text-amber-400">
                <Compass size={18} />
                <span className="text-[8px] font-bold uppercase">Explore</span>
              </button>
              <button onClick={() => setCurrentScreen('admin_dashboard')} className="flex flex-col items-center gap-0.5 hover:text-white transition">
                <Store size={18} />
                <span className="text-[8px] font-bold uppercase">OB Panel</span>
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 4: RESTORAN DETAIL (Gaya Rencana Wisata Gambar 2) */}
        {currentScreen === 'restaurant_detail' && (
          <div className="flex-1 flex flex-col bg-[#F7F8FC] pt-12">
            {/* Header / Hero Cover (Gambar 2) */}
            <div className="relative h-44 shrink-0">
              <img src={selectedResto.image} alt={selectedResto.name} className="w-full h-full object-cover brightness-75" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 p-4 flex flex-col justify-between">
                <button 
                  onClick={() => setCurrentScreen('user_dashboard')} 
                  className="w-9 h-9 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 self-start"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <span className="text-[8px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-0.5"><Star size={10} className="fill-amber-400 text-amber-400"/> {selectedResto.rating} ({selectedResto.reviews} ulasan)</span>
                  <h3 className="text-xl font-black text-white">{selectedResto.name}</h3>
                  <p className="text-[10px] text-slate-300">{selectedResto.category}</p>
                </div>
              </div>
            </div>

            {/* Menu List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pilih Perlengkapan Energi Makan Siang</p>
              {menus.filter(m => m.restaurant_id === selectedResto.id).map(menu => {
                const cartItem = cart.find(c => c.menuId === menu.id);
                const qty = cartItem ? cartItem.qty : 0;
                return (
                  <div key={menu.id} className={`bg-white rounded-2xl p-4 border transition duration-200 ${qty > 0 ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-100'}`}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <h4 className="font-extrabold text-xs text-slate-800">{menu.name}</h4>
                          {menu.tag && <span className="text-[8px] font-black bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md uppercase">{menu.tag}</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal line-clamp-2">{menu.desc}</p>
                        <p className="text-xs font-black text-indigo-600 mt-2">{formatRp(menu.price)}</p>
                      </div>

                      {/* Controls */}
                      {qty === 0 ? (
                        <button 
                          onClick={() => handleUpdateCart(menu, 1)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-extrabold text-[10px] py-1.5 px-3.5 rounded-lg border border-indigo-200 transition"
                        >
                          Pilih
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-slate-50 border p-1 rounded-lg">
                          <button onClick={() => handleUpdateCart(menu, -1)} className="w-6 h-6 bg-white border text-slate-800 rounded flex items-center justify-center font-bold text-xs">-</button>
                          <span className="text-xs font-black w-4 text-center">{qty}</span>
                          <button onClick={() => handleUpdateCart(menu, 1)} className="w-6 h-6 bg-indigo-600 text-white rounded flex items-center justify-center font-bold text-xs">+</button>
                        </div>
                      )}
                    </div>

                    {qty > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <input 
                          type="text" 
                          placeholder="Tambahkan instruksi kustom (Mis: Ekstra pedas)..."
                          value={cartItem.notes}
                          onChange={(e) => handleUpdateNotes(menu.id, e.target.value)}
                          className="w-full bg-slate-50 border p-2 rounded-lg text-[9px] text-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Action Sheet (Vibe Rencana Wisata Gambar 2) */}
            {cartItemsCount > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-150 p-4 rounded-t-[32px] shadow-2xl z-40">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Keranjang Petualangan</span>
                    <span className="text-sm font-black text-slate-800">{cartItemsCount} Item terpilih</span>
                  </div>
                  <span className="text-lg font-black text-indigo-600">{formatRp(cartTotal)}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-indigo-600/20"
                >
                  Selesaikan Rencana Makan <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* SCREEN 5: RECEIPT TICKET (Gaya Boarding Pass Gambar 2) */}
        {currentScreen === 'ticket_view' && (
          <div className="flex-1 flex flex-col bg-slate-900 justify-between p-6 pt-16 text-white">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Misi Makan Siang Sukses!</span>
              <h3 className="text-xl font-black">Karcis Pembayaran</h3>
            </div>

            {/* Tiket Boarding Pass Premium (Gambar 2 Vibe) */}
            <div className="bg-white text-slate-800 rounded-[32px] overflow-hidden shadow-2xl my-auto">
              {/* Header Tiket */}
              <div className="bg-indigo-600 text-white p-5 flex justify-between items-center relative">
                <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-slate-900 rounded-full"></div>
                <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-slate-900 rounded-full"></div>
                
                <div>
                  <span className="text-[8px] font-bold text-indigo-200 uppercase tracking-wider">KARYAWAN</span>
                  <h4 className="font-black text-sm">{currentUser?.name}</h4>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-bold text-indigo-200 uppercase tracking-wider">OB PENANGGUNG JAWAB</span>
                  <h4 className="font-black text-sm">Pak Joko</h4>
                </div>
              </div>

              {/* Rincian Rute Pengantaran Simbolik */}
              <div className="p-5 border-b border-dashed border-slate-200 relative">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">DARI</span>
                    <span className="font-black text-slate-800">{selectedResto.name}</span>
                  </div>
                  <div className="flex-1 px-4 flex flex-col items-center">
                    <Navigation size={14} className="text-indigo-600 rotate-90 animate-pulse" />
                    <div className="w-full border-t border-slate-300 border-dashed my-1"></div>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">KE</span>
                    <span className="font-black text-slate-800">Meja Kerja Anda</span>
                  </div>
                </div>
              </div>

              {/* Rincian Item */}
              <div className="p-5 space-y-3">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">MENU YANG DIPESAN</p>
                <div className="space-y-2 max-h-24 overflow-y-auto">
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">{item.qty}x {item.name}</span>
                      <span className="text-slate-800 font-bold">{formatRp(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>

                {/* Harga Akhir */}
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">TOTAL TAGIHAN</span>
                  <span className="text-base font-black text-indigo-600">{formatRp(cartTotal)}</span>
                </div>

                {/* Informasi Copy Rekening */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-left mt-2">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Transfer ke Rekening OB</p>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-indigo-700">{session.bankAccount}</span>
                    <button 
                      onClick={() => navigator.clipboard.writeText(session.bankAccount)}
                      className="p-1 hover:bg-slate-200 rounded text-slate-500"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setCart([]);
                setCurrentScreen('user_dashboard');
              }}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-4 rounded-2xl text-xs shadow-lg transition"
            >
              Kembali ke Beranda Petualangan
            </button>
          </div>
        )}

        {/* SCREEN 6: ADMIN DASHBOARD */}
        {currentScreen === 'admin_dashboard' && (
          <div className="flex-1 flex flex-col bg-[#F7F8FC] pt-12">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
              <h1 className="font-black text-sm tracking-tight flex items-center gap-1"><Store size={16}/> OB Panel Kontrol</h1>
              <button onClick={() => setCurrentScreen('user_dashboard')} className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white">User Mode</button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white p-5 rounded-3xl shadow-lg flex justify-between items-center relative overflow-hidden">
                <div>
                  <p className="text-slate-300 text-[9px] font-bold uppercase tracking-wider mb-1">Total Pemasukan Misi Makan</p>
                  <h2 className="text-2xl font-black text-amber-400">Rp 44.000</h2>
                  <p className="text-[9px] text-slate-300 mt-1">Total Pesanan Terdaftar: <span className="font-bold text-white">2 Karyawan</span></p>
                </div>
                <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/20 z-10 shadow-inner">
                  <Wallet size={24} />
                </div>
              </div>

              {/* Status Lapak Toggle */}
              <div className="bg-white p-5 rounded-3xl border border-slate-150 space-y-4 shadow-sm">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Konfigurasi Lapak Aktif</h3>
                <div className="flex justify-between items-center p-3 border rounded-2xl">
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">Status Lapak</span>
                    <span className="text-[10px] text-slate-400">Izinkan Karyawan Order</span>
                  </div>
                  <button 
                    onClick={() => setSession({...session, isOpen: !session.isOpen})}
                    className={`font-bold text-xs py-2 px-4 rounded-xl transition ${session.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                  >
                    {session.isOpen ? 'Terbuka' : 'Tertutup'}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Batas Waktu Order</label>
                  <input 
                    type="time" 
                    value={session.endTime} 
                    onChange={e => setSession({...session, endTime: e.target.value})}
                    className="w-full bg-slate-50 border p-3 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Rekap Order Masuk */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Daftar Order Aktif</h3>
                {orders.map(order => (
                  <div key={order.id} className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm text-xs">
                    <div className="flex justify-between items-center border-b pb-2 mb-2">
                      <span className="font-bold text-slate-800">{order.userName}</span>
                      <span className="font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{formatRp(order.total)}</span>
                    </div>
                    <ul className="space-y-1 text-[10px] text-slate-500 font-medium">
                      {order.items.map((item, i) => (
                        <li key={i}>{item.qty}x {item.name} {item.notes && <span className="text-amber-600 italic">("{item.notes}")</span>}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Nav Admin */}
            <button 
              onClick={handleLogout} 
              className="m-5 mt-auto bg-slate-900 text-white font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 transition"
            >
              <LogOut size={14}/> Keluar Panel Admin
            </button>
          </div>
        )}

      </div>
    </div>
  );
}