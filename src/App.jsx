import React, { useState, useMemo, useEffect } from 'react';
import { 
  Utensils, Wallet, Store, List, 
  Plus, Minus, Check, LogOut, 
  ChevronRight, Receipt, Clock,
  Sparkles, Star, MessageSquare, Copy,
  MapPin, Navigation, Compass, Award,
  Flame, Bell, History, Trophy, ArrowLeft
} from 'lucide-react';

// --- INTEGRASI CORE CLOUD DATABASE ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, onSnapshot, addDoc, updateDoc } from 'firebase/firestore';

// ============================================================================
// ⚙️ FIREBASE CONFIGURATION (KREDENSIAL ASLI DARI PROYEK NIMAK ANDA)
// ============================================================================
const firebaseConfig = {
  apiKey: "AIzaSyA4WWxScF_k7CeXYJWXPBQCU_z4E50oCA4",
  authDomain: "nimak-bfe56.firebaseapp.com",
  projectId: "nimak-bfe56",
  storageBucket: "nimak-bfe56.firebasestorage.app",
  messagingSenderId: "958561448423",
  appId: "1:958561448423:web:afae6cb869ba9d2d408d42"
};

const isFirebaseReady = true; // Langsung aktif menggunakan kredensial asli Anda
const appId = typeof __app_id !== 'undefined' ? __app_id : 'nimak-bfe56-app';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- SEED DATA CADANGAN (OTOMATIS DIGUNAKAN JIKA DATABASE KOSONG) ---
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
    tag: 'Pilihan CFO ⭐',
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
  { id: 101, userName: "Mbak Sarah (Finance)", total: 39000, date: 'Hari Ini', items: [{ menuId: 1, name: 'Nasi Telur Dadar + Orek Tempe', price: 15000, qty: 1, notes: "" }, { menuId: 4, name: 'Paket Geprek Lava Mozzarella', price: 25000, qty: 1, notes: "" }], status: 'Selesai' },
  { id: 102, userName: "Mbak Rini (HRD)", total: 19000, date: 'Hari Ini', items: [{ menuId: 1, name: 'Nasi Telur Dadar + Orek Tempe', price: 15000, qty: 1, notes: "Oreknya basah" }, { menuId: 3, name: 'Es Teh Manis Jumbo Booster', price: 4000, qty: 1, notes: "" }], status: 'Diproses CFO' },
  { id: 103, userName: "Mas Bimo (IT Support)", total: 89000, date: 'Hari Ini', items: [{ menuId: 4, name: 'Paket Geprek Lava Mozzarella', price: 25000, qty: 3, notes: "Sambal level 5!" }, { menuId: 5, name: 'Jamur Crispy Kriuk Nagih', price: 10000, qty: 1, notes: "" }, { menuId: 3, name: 'Es Teh Manis Jumbo Booster', price: 4000, qty: 1, notes: "" }], status: 'Menunggu Pembayaran' },
  { id: 1, userName: "Mas Wahyu (Desainer)", total: 450000, date: '10 Mei 2026', items: [{ menuId: 7, name: 'Soto Sapi Premium Party Box', price: 22000, qty: 20, notes: "" }], status: 'Selesai' }
];

const formatRp = (num) => 'Rp ' + num.toLocaleString('id-ID');

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('onboarding');
  const [userTab, setUserTab] = useState('explore');
  const [leaderboardSubTab, setLeaderboardSubTab] = useState('rank');
  const [adminViewTab, setAdminViewTab] = useState('orang');
  
  const [currentUser, setCurrentUser] = useState(null);
  const [user, setUser] = useState(null); // Firebase User Auth State
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [menus, setMenus] = useState(initialMenus);
  const [orders, setOrders] = useState(initialOrders);
  const [selectedResto, setSelectedResto] = useState(initialRestaurants[0]);
  const [cart, setCart] = useState([]);
  
  const [session, setSession] = useState({
    isOpen: true,
    openRestoIds: [1, 2, 3],
    endTime: '11:45',
    bankAccount: 'BCA 872-019-2831 a.n Joko Susilo (CFO)',
    rejectMessage: 'Waduh petualangan kuliner hari ini sudah ditutup! 😭 Hubungi CFO jika darurat!'
  });

  // --- 🔐 TAHAP 1: MASUK TANPA IDENTITAS (RULE 3) ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.warn("Auth Firebase gagal, beralih ke Mode Offline:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- 📡 TAHAP 2: REALTIME DATABASE SYNC (RULE 1 & 2 & 3) ---
  useEffect(() => {
    if (!user) return; // Mencegah pemanggilan query sebelum auth selesai

    // Strict Path sesuai RULE 1 untuk menghindari permission error
    const sessionDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'session', 'current');
    const ordersColRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');

    const unsubSession = onSnapshot(sessionDocRef, (snap) => {
      if (snap.exists()) {
        setSession(snap.data());
      } else {
        setDoc(sessionDocRef, session);
      }
    }, (err) => console.error("Session Sync Error:", err));

    const unsubOrders = onSnapshot(ordersColRef, (snap) => {
      const list = []; 
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      if (list.length > 0) setOrders(list);
    }, (err) => console.error("Orders Sync Error:", err));

    return () => { 
      unsubSession(); 
      unsubOrders(); 
    };
  }, [user]);

  const handleLogin = (name, phone) => {
    const role = phone === '0000' ? 'admin' : 'user';
    setCurrentUser({ name, phone, role });
    setCurrentScreen(role === 'admin' ? 'admin_dashboard' : 'user_dashboard');
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

  const handleCheckout = async () => {
    const newOrder = {
      userName: currentUser.name,
      items: cart,
      total: cartTotal,
      date: 'Hari Ini',
      status: 'Menunggu Pembayaran'
    };

    if (user) {
      const ordersColRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
      await addDoc(ordersColRef, newOrder);
    } else {
      setOrders([...orders, { id: Date.now(), ...newOrder }]);
    }
    setCart([]);
    setCurrentScreen('user_dashboard');
    setUserTab('my_orders');
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    if (user) {
      const orderDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId);
      await updateDoc(orderDocRef, { status: newStatus });
    } else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  const handleToggleLapak = async () => {
    const updated = { ...session, isOpen: !session.isOpen };
    setSession(updated);
    if (user) {
      const sessionDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'session', 'current');
      await setDoc(sessionDocRef, updated);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const openRestaurants = restaurants.filter(r => session.openRestoIds.includes(r.id));
  const filteredMenus = menus.filter(m => m.restaurant_id === selectedResto.id);

  // Sultan System Engine
  const dynamicBadges = useMemo(() => {
    const userStats = {};
    const todayOrders = orders.filter(o => o.date === 'Hari Ini');
    orders.forEach(o => {
      if (!userStats[o.userName]) userStats[o.userName] = { name: o.userName, totalSpend: 0, totalQty: 0, maxSingleQty: 0 };
      let oQty = o.items ? o.items.reduce((s, i) => s + i.qty, 0) : 0;
      userStats[o.userName].totalSpend += o.total;
      userStats[o.userName].totalQty += oQty;
      if (oQty > userStats[o.userName].maxSingleQty) userStats[o.userName].maxSingleQty = oQty;
    });
    const uList = Object.values(userStats);
    const getTop = (list, scoreFn) => list.length ? list.reduce((a, b) => scoreFn(a) > scoreFn(b) ? a : b) : { name: '-', totalSpend: 0, totalQty: 0, maxSingleQty: 0 };

    return {
      mukbangMaster: getTop(uList.filter(u => u.maxSingleQty > 3), u => u.maxSingleQty),
      seleraElit: getTop(uList, u => u.totalSpend),
      blackHoleBelly: getTop(uList, u => u.totalQty),
      avengersTeam: getTop(uList.filter(u => u.maxSingleQty > 5), u => u.maxSingleQty),
      investorUtama: getTop(uList, u => u.totalSpend),
      ceoFlexing: todayOrders.length ? todayOrders.reduce((a, b) => a.total > b.total ? a : b) : { userName: '-' },
      lastSurvivor: todayOrders.length ? todayOrders[todayOrders.length - 1] : { userName: '-' },
      dietBesok: todayOrders.length ? todayOrders[0] : { userName: '-' }
    };
  }, [orders]);

  const ordersByResto = useMemo(() => {
    const map = {};
    orders.filter(o => o.date === 'Hari Ini').forEach(o => {
      if (o.items) o.items.forEach(i => {
        const mObj = menus.find(m => m.id === i.menuId);
        if (mObj) {
          if (!map[mObj.restaurant_id]) map[mObj.restaurant_id] = { restoName: restaurants.find(r => r.id === mObj.restaurant_id).name, totalCost: 0, itemsList: [] };
          map[mObj.restaurant_id].totalCost += (i.price * i.qty);
          map[mObj.restaurant_id].itemsList.push({ userName: o.userName, itemName: i.name, qty: i.qty, notes: i.notes });
        }
      });
    });
    return Object.values(map);
  }, [orders, menus, restaurants]);

  const ordersByMenu = useMemo(() => {
    const map = {};
    orders.filter(o => o.date === 'Hari Ini').forEach(o => {
      if (o.items) o.items.forEach(i => {
        if (!map[i.menuId]) map[i.menuId] = { menuName: i.name, qty: 0 };
        map[i.menuId].qty += i.qty;
      });
    });
    return Object.values(map);
  }, [orders]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-[410px] bg-[#F7F8FC] h-[820px] flex flex-col relative shadow-2xl rounded-[48px] border-[10px] border-slate-950 overflow-hidden">
        
        {/* SCREEN 1: ONBOARDING */}
        {currentScreen === 'onboarding' && (
          <div className="flex-1 flex flex-col justify-between p-8 pt-16 bg-gradient-to-b from-[#E2E6FF] via-[#EAEFFF] to-[#F5F8FF]">
            <span className="text-xs font-black text-indigo-600">09:40 WIB</span>
            <div className="text-center space-y-6">
              <div className="w-48 h-48 rounded-[40px] bg-indigo-100 flex items-center justify-center shadow-inner mx-auto"><span className="text-8xl">🍱</span></div>
              <h1 className="text-3xl font-black text-slate-800 leading-none">Welcome to <br/><span className="text-indigo-600 bg-indigo-100 px-3 py-1 rounded-2xl inline-block mt-1">Nimak</span></h1>
              <p className="text-xs text-slate-500 max-w-[240px] mx-auto">Sistem Petualangan Makan Siang Kantor Seru, Cepat, & Kompetitif.</p>
            </div>
            <button onClick={handleStartAdventure} className="w-full bg-indigo-600 text-white font-extrabold py-4 rounded-2xl shadow-lg flex justify-between px-6 text-sm">
              <span>Mulai Petualangan</span><ChevronRight size={18}/>
            </button>
          </div>
        )}

        {/* SCREEN 2: LOGIN */}
        {currentScreen === 'login' && (
          <div className="flex-1 flex flex-col justify-between p-8 pt-16 bg-gradient-to-b from-[#FFF5E6] via-white to-[#F7F8FC]">
            <button onClick={() => setCurrentScreen('onboarding')} className="w-8 h-8 bg-white border rounded-full flex items-center justify-center"><ArrowLeft size={14}/></button>
            <div className="my-auto space-y-4">
              <h2 className="text-xl font-black text-slate-800">Daftarkan Karaktermu!</h2>
              <div className="bg-white p-5 rounded-3xl border shadow-sm space-y-3">
                <input type="text" placeholder="Nama Panggilan Kantor..." id="ln" defaultValue="Mas Wahyu" className="w-full bg-slate-50 border p-3 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500"/>
                <input type="text" placeholder="Nomor Handphone..." id="lp" defaultValue="0812345" className="w-full bg-slate-50 border p-3 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500"/>
              </div>
            </div>
            <button onClick={() => handleLogin(document.getElementById('ln').value || 'User', document.getElementById('lp').value || '1')} className="w-full bg-indigo-600 text-white font-extrabold py-4 rounded-2xl text-xs">Masuk Dashboard 🚀</button>
          </div>
        )}

        {/* SCREEN 3: USER DASHBOARD */}
        {currentScreen === 'user_dashboard' && (
          <div className="flex-1 flex flex-col bg-[#F7F8FC] pt-12">
            <div className="px-5 pb-3 flex justify-between items-center bg-white border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm">👨‍💻</div>
                <div><h4 className="font-black text-xs text-slate-800">{currentUser?.name}</h4><p className="text-[8px] text-indigo-600 font-bold">Nimak Adventurer</p></div>
              </div>
              <button onClick={handleLogout} className="w-7 h-7 bg-red-50 text-red-500 rounded-full flex items-center justify-center"><LogOut size={12}/></button>
            </div>

            {userTab === 'explore' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-24">
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-4 rounded-3xl shadow-sm">
                  <span className="text-[9px] font-bold block">MISI AKTIF HARI INI</span>
                  <p className="text-[10px] text-amber-300 font-semibold mt-1">🔥 Batas konfirmasi pesanan s/d {session.endTime} WIB</p>
                </div>
                <div className="space-y-3">
                  {openRestaurants.map(r => (
                    <div key={r.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200/60 shadow-sm">
                      <img src={r.image} className="w-full h-24 object-cover"/>
                      <div className="p-4 flex justify-between items-center">
                        <div><h4 className="font-black text-xs text-slate-800">{r.name}</h4><p className="text-[9px] text-slate-400">{r.distance} • {r.time}</p></div>
                        <button onClick={() => viewRestoDetail(r)} className="bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-xl text-[10px]">Pilih Menu</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {userTab === 'my_orders' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-24">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Karcis Pesanan Aktif</h3>
                {orders.filter(o => o.userName === currentUser?.name && o.date === 'Hari Ini').map(order => (
                  <div key={order.id} className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
                    <div className="flex justify-between border-b pb-2"><span className="font-black text-xs">{order.userName}</span><span className="bg-amber-400 text-[8px] font-black px-2 py-0.5 rounded-full">{order.status}</span></div>
                    <div className="space-y-1 text-xs text-slate-600 font-semibold">
                      {order.items && order.items.map((i, idx) => <div key={idx} className="flex justify-between"><span>{i.qty}x {i.name}</span><span>{formatRp(i.price * i.qty)}</span></div>)}
                    </div>
                    <div className="border-t pt-2 flex justify-between font-black text-indigo-600 text-xs"><span>TOTAL</span><span>{formatRp(order.total)}</span></div>
                    <div className="bg-slate-50 p-2 rounded-xl text-[9px] font-mono text-center border font-semibold text-slate-700">Transfer CFO: {session.bankAccount}</div>
                  </div>
                ))}
              </div>
            )}

            {userTab === 'leaderboard' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-5 pt-3 flex gap-2 shrink-0">
                  <button onClick={() => setLeaderboardSubTab('rank')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border ${leaderboardSubTab === 'rank' ? 'bg-indigo-600 text-white' : 'bg-white'}`}>Peringkat</button>
                  <button onClick={() => setLeaderboardSubTab('badges')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border ${leaderboardSubTab === 'badges' ? 'bg-indigo-600 text-white' : 'bg-white'}`}>Gelar Kantor 🏅</button>
                </div>
                
                {leaderboardSubTab === 'rank' && (
                  <div className="flex-1 overflow-y-auto p-5 space-y-2 pb-24">
                    {Object.entries(orders.reduce((acc, o) => ({ ...acc, [o.userName]: (acc[o.userName] || 0) + o.total }), {})).sort((a,b)=>b[1]-a[1]).map(([name, total], i) => (
                      <div key={i} className="bg-white p-3 rounded-xl border flex justify-between items-center text-xs shadow-sm">
                        <span className="font-black text-indigo-600">#{i+1} {name}</span><span className="font-bold text-slate-800">{formatRp(total)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {leaderboardSubTab === 'badges' && (
                  <div className="flex-1 overflow-y-auto p-5 space-y-2 pb-24">
                    {[
                      { t: "The Mukbang Master 👑", d: "Memesan > 3 menu dalam 1 order", w: dynamicBadges.mukbangMaster?.name || '-' },
                      { t: "Selera Elit 🌾", d: "Total pesanan termahal sebulan", w: dynamicBadges.seleraElit?.name || '-' },
                      { t: "Black Hole Belly 🌌", d: "Porsi terbanyak terkonsumsi", w: dynamicBadges.blackHoleBelly?.name || '-' },
                      { t: "The Avengers Team 🛡️", d: "Pesan porsi jumbo buat satu tim", w: dynamicBadges.avengersTeam?.name || '-' },
                      { t: "CEO of Flexing Food 💎", d: "Pemesan termahal hari ini", w: dynamicBadges.ceoFlexing?.userName || '-' },
                      { t: "The Last Survivor ⏱️", d: "Pemesan terakhir paling mepet", w: dynamicBadges.lastSurvivor?.userName || '-' },
                      { t: "Diet Mulai Besok 🥗", d: "Pemesan paling awal hari ini", w: dynamicBadges.dietBesok?.userName || '-' }
                    ].map((b, i) => (
                      <div key={i} className="bg-white p-3 rounded-2xl border text-[11px] space-y-0.5">
                        <h4 className="font-black text-slate-800">{b.t}</h4><p className="text-[9px] text-slate-400">{b.d}</p>
                        <p className="text-[9px] text-indigo-600 font-bold pt-1">Penyandang: {b.w}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Nav User */}
            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 rounded-[24px] p-2 flex justify-around text-slate-400 z-30 shadow-lg">
              <button onClick={() => setUserTab('explore')} className={`flex flex-col items-center text-[8px] font-bold ${userTab === 'explore' ? 'text-amber-400' : ''}`}><Compass size={16}/>EXPLORE</button>
              <button onClick={() => setUserTab('my_orders')} className={`flex flex-col items-center text-[8px] font-bold ${userTab === 'my_orders' ? 'text-amber-400' : ''}`}><Receipt size={16}/>TIKET SAYA</button>
              <button onClick={() => setUserTab('leaderboard')} className={`flex flex-col items-center text-[8px] font-bold ${userTab === 'leaderboard' ? 'text-amber-400' : ''}`}><Trophy size={16}/>SULTAN</button>
              <button onClick={() => setCurrentScreen('admin_dashboard')} className="flex flex-col items-center text-[8px] font-bold"><Store size={16}/>CFO PANEL</button>
            </div>
          </div>
        )}

        {/* SCREEN 4: RESTORAN DETAIL */}
        {currentScreen === 'restaurant_detail' && (
          <div className="flex-1 flex flex-col bg-[#F7F8FC] pt-12">
            <div className="p-4 bg-white border-b flex items-center gap-3 shrink-0">
              <button onClick={() => setCurrentScreen('user_dashboard')} className="p-1"><ArrowLeft size={18}/></button>
              <h3 className="font-black text-sm text-slate-800">{selectedResto.name}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
              {filteredMenus.map(menu => {
                const cItem = cart.find(c => c.menuId === menu.id);
                const qty = cItem ? cItem.qty : 0;
                return (
                  <div key={menu.id} className="bg-white p-4 rounded-2xl border flex justify-between items-center text-xs shadow-sm">
                    <div className="max-w-[70%]"><h4 className="font-bold text-slate-800">{menu.name}</h4><p className="text-[10px] text-slate-400 line-clamp-1">{menu.desc}</p><p className="text-indigo-600 font-bold mt-1">{formatRp(menu.price)}</p></div>
                    {qty === 0 ? <button onClick={() => handleUpdateCart(menu, 1)} className="bg-indigo-50 text-indigo-600 font-bold px-3 py-1 rounded-xl">Pilih</button> :
                    <div className="flex items-center gap-2 bg-slate-50 border p-1 rounded-xl"><button onClick={() => handleUpdateCart(menu, -1)} className="font-bold px-1.5">-</button><span className="font-bold">{qty}</span><button onClick={() => handleUpdateCart(menu, 1)} className="font-bold px-1.5">+</button></div>}
                  </div>
                );
              })}
            </div>
            {cartItemsCount > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 rounded-t-[32px] shadow-2xl flex justify-between items-center z-40">
                <div><span className="text-[9px] text-slate-400 block font-bold">TOTAL</span><span className="text-sm font-black text-indigo-600">{formatRp(cartTotal)}</span></div>
                <button onClick={handleCheckout} className="bg-indigo-600 text-white font-extrabold py-3 px-6 rounded-2xl text-xs">Konfirmasi Rencana Makan 🚀</button>
              </div>
            )}
          </div>
        )}

        {/* SCREEN 5: CFO ADMIN PANEL */}
        {currentScreen === 'admin_dashboard' && (
          <div className="flex-1 flex flex-col bg-[#F7F8FC] pt-12">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
              <h1 className="font-black text-xs flex items-center gap-1">💼 CFO Panel Kontrol (Nimak)</h1>
              <button onClick={() => {
                setCurrentScreen('user_dashboard');
                setUserTab('explore');
              }} className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-300">User Mode</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
              <div className="flex justify-between items-center p-3 bg-white border rounded-2xl shadow-sm">
                <div><span className="font-bold text-xs text-slate-800 block">Sesi Order Gerbang</span><span className="text-[9px] text-slate-400">Buka/tutup lapak online</span></div>
                <button onClick={handleToggleLapak} className={`text-[10px] font-black px-3 py-1.5 rounded-xl ${session.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{session.isOpen ? 'BUKA' : 'TUTUP'}</button>
              </div>

              {/* Segmented Controller 3 View */}
              <div className="flex bg-slate-200 p-1 rounded-xl border">
                <button onClick={() => setAdminViewTab('orang')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${adminViewTab === 'orang' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>👤 Per Orang</button>
                <button onClick={() => setAdminViewTab('resto')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${adminViewTab === 'resto' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>🏢 Per Resto</button>
                <button onClick={() => setAdminViewTab('menu')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${adminViewTab === 'menu' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>📋 Per Menu</button>
              </div>

              {/* View 1: Per Orang */}
              {adminViewTab === 'orang' && orders.filter(o => o.date === 'Hari Ini').map(o => (
                <div key={o.id} className="bg-white p-3 rounded-2xl border text-xs shadow-sm space-y-2">
                  <div className="flex justify-between font-bold border-b pb-1"><span>{o.userName}</span><span className="text-indigo-600">{formatRp(o.total)}</span></div>
                  <p className="text-[10px] text-slate-500 font-semibold">{o.items ? o.items.map(i => `${i.qty}x ${i.name}`).join(', ') : '-'}</p>
                  <div className="flex justify-end gap-1.5 pt-1"><button onClick={() => handleUpdateOrderStatus(o.id, 'Diproses CFO')} className="bg-indigo-50 text-indigo-700 text-[9px] px-2 py-0.5 rounded">Proses</button><button onClick={() => handleUpdateOrderStatus(o.id, 'Selesai')} className="bg-emerald-50 text-emerald-700 text-[9px] px-2 py-0.5 rounded">Selesai</button></div>
                </div>
              ))}

              {/* View 2: Per Resto */}
              {adminViewTab === 'resto' && ordersByResto.map((r, i) => (
                <div key={i} className="bg-white p-3 rounded-2xl border text-xs shadow-sm space-y-1.5">
                  <div className="flex justify-between font-black border-b pb-1 text-slate-800"><span>🏢 {r.restoName}</span><span>{formatRp(r.totalCost)}</span></div>
                  {r.itemsList.map((it, idx) => <p key={idx} className="text-[10px] text-slate-500 font-semibold">• {it.qty}x {it.itemName} <span className="text-indigo-600 font-bold">({it.userName})</span></p>)}
                </div>
              ))}

              {/* View 3: Per Menu */}
              {adminViewTab === 'menu' && (
                <div className="bg-white rounded-2xl border shadow-sm divide-y text-xs">
                  {ordersByMenu.map((m, i) => <div key={i} className="p-3 flex justify-between font-bold"><span>{m.menuName}</span><span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg">{m.qty} Porsi</span></div>)}
                </div>
              )}
            </div>
            <button onClick={handleLogout} className="m-4 bg-slate-900 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1 shrink-0"><LogOut size={12}/>Keluar Admin</button>
          </div>
        )}

      </div>
    </div>
  );
}