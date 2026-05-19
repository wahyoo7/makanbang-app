import React, { useState, useMemo, useEffect } from 'react';
import { 
  Utensils, Wallet, Users, Store, List, 
  Plus, Minus, Check, LogOut, 
  ChevronRight, Receipt, Clock,
  Sparkles, Star, MessageSquare, Copy,
  TrendingUp, MapPin, Navigation, Compass, Award,
  Flame, Bell, ShieldCheck, ArrowLeft, Trophy, History,
  Shield, Zap, User, Heart, Target, Sparkle
} from 'lucide-react';

// --- INTEGRASI FIREBASE FIREBASE ---
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, addDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

// ============================================================================
// ⚙️ KONFIGURASI FIREBASE CLOUD DATABASE
// ============================================================================
// Jika dideploy di platform kami, config ini otomatis terisi.
// Untuk deploy mandiri di Vercel, ganti objek di bawah ini dengan Config Firebase Anda!
const firebaseConfigPlaceholder = {
  apiKey: "",
  authDomain: "makanbang-prod.firebaseapp.com",
  projectId: "makanbang-prod",
  storageBucket: "makanbang-prod.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:12345:web:12345"
};

// Deteksi otomatis environment config dari platform kami
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : firebaseConfigPlaceholder;

const appId = typeof __app_id !== 'undefined' ? __app_id : 'makanbang-prod-app';

// Inisialisasi Firebase aman (Fallback ke Mode Offline jika config belum dipasang)
let app, auth, db;
let isFirebaseReady = false;

if (firebaseConfig && firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseReady = true;
  } catch (error) {
    console.warn("Koneksi Firebase gagal, beralih ke Mode Simulasi Offline.", error);
  }
}

// --- DATABASE CADANGAN / DEFAULT SEEDING ---
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
  {
    id: 1684395000001,
    userName: "Mbak Sarah (Finance)",
    total: 39000,
    date: 'Hari Ini',
    items: [
      { menuId: 1, name: 'Nasi Telur Dadar + Orek Tempe', price: 15000, qty: 1, notes: "" },
      { menuId: 4, name: 'Paket Geprek Lava Mozzarella', price: 25000, qty: 1, notes: "" }
    ],
    status: 'Selesai'
  },
  {
    id: 1684395200000,
    userName: "Mbak Rini (HRD)",
    total: 19000,
    date: 'Hari Ini',
    items: [
      { menuId: 1, name: 'Nasi Telur Dadar + Orek Tempe', price: 15000, qty: 1, notes: "Oreknya basah ya mas" },
      { menuId: 3, name: 'Es Teh Manis Jumbo Booster', price: 4000, qty: 1, notes: "" },
    ],
    status: 'Diproses CFO'
  },
  {
    id: 1684395500000,
    userName: "Mas Bimo (IT Support)",
    total: 89000,
    date: 'Hari Ini',
    items: [
      { menuId: 4, name: 'Paket Geprek Lava Mozzarella', price: 25000, qty: 3, notes: "Sambal level 5!" },
      { menuId: 5, name: 'Jamur Crispy Kriuk Nagih', price: 10000, qty: 1, notes: "" },
      { menuId: 3, name: 'Es Teh Manis Jumbo Booster', price: 4000, qty: 1, notes: "" }
    ],
    status: 'Menunggu Pembayaran'
  }
];

const formatRp = (num) => 'Rp ' + num.toLocaleString('id-ID');

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('onboarding');
  const [userTab, setUserTab] = useState('explore');
  const [leaderboardSubTab, setLeaderboardSubTab] = useState('rank');
  const [adminViewTab, setAdminViewTab] = useState('orang');
  
  // Real States
  const [currentUser, setCurrentUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
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

  // --- 🔐 PROSES AUTENTIKASI FIREBASE (RULE 3) ---
  useEffect(() => {
    if (!isFirebaseReady) return;

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setFirebaseUser(user);
    });

    return () => unsubscribe();
  }, []);

  // --- 📡 CLOUD DATABASE REALTIME SYNC (RULE 1 & RULE 2) ---
  useEffect(() => {
    if (!isFirebaseReady || !firebaseUser) return;

    // A. SYNC SESSION CONFIGURATION
    const sessionDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'session', 'current');
    const unsubSession = onSnapshot(sessionDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setSession(snapshot.data());
      } else {
        // Seed default session jika database baru dibuat
        setDoc(sessionDocRef, session);
      }
    }, (err) => console.error("Session Sync Error:", err));

    // B. SYNC ORDERS DATABASE
    const ordersColRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
    const unsubOrders = onSnapshot(ordersColRef, (snapshot) => {
      const list = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      if (list.length > 0) {
        setOrders(list);
      } else {
        // Seeding database kosong dengan data simulasi awal agar siap pakai
        initialOrders.forEach(async (order) => {
          await addDoc(ordersColRef, order);
        });
      }
    }, (err) => console.error("Orders Sync Error:", err));

    // C. SYNC RESTAURANTS
    const restosColRef = collection(db, 'artifacts', appId, 'public', 'data', 'restaurants');
    const unsubRestos = onSnapshot(restosColRef, (snapshot) => {
      const list = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      if (list.length > 0) {
        setRestaurants(list);
      } else {
        initialRestaurants.forEach(async (r) => {
          await addDoc(restosColRef, r);
        });
      }
    }, (err) => console.error("Restaurants Sync Error:", err));

    // D. SYNC MENUS
    const menusColRef = collection(db, 'artifacts', appId, 'public', 'data', 'menus');
    const unsubMenus = onSnapshot(menusColRef, (snapshot) => {
      const list = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      if (list.length > 0) {
        setMenus(list);
      } else {
        initialMenus.forEach(async (m) => {
          await addDoc(menusColRef, m);
        });
      }
    }, (err) => console.error("Menus Sync Error:", err));

    return () => {
      unsubSession();
      unsubOrders();
      unsubRestos();
      unsubMenus();
    };
  }, [firebaseUser]);

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
      setUserTab('explore');
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

  const handleCheckout = async () => {
    const newOrder = {
      userName: currentUser.name,
      items: cart,
      total: cartTotal,
      date: 'Hari Ini',
      status: 'Menunggu Pembayaran'
    };

    if (isFirebaseReady && firebaseUser) {
      const ordersColRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
      await addDoc(ordersColRef, newOrder);
    } else {
      // Fallback Mode Offline
      setOrders([...orders, { id: Date.now(), ...newOrder }]);
    }
    
    setCart([]);
    setCurrentScreen('user_dashboard');
    setUserTab('my_orders');
  };

  // --- ENGINE KALKULASI GELAR OTOMATIS (SULTAN ENGINE) ---
  const dynamicBadges = useMemo(() => {
    const userStats = {};
    const todayOrders = orders.filter(o => o.date === 'Hari Ini');

    orders.forEach(o => {
      if (!userStats[o.userName]) {
        userStats[o.userName] = {
          name: o.userName,
          totalSpend: 0,
          totalQty: 0,
          maxSingleOrderQty: 0,
          maxSingleOrderSpend: 0,
          orderCount: 0,
          orders: []
        };
      }

      let orderQty = o.items ? o.items.reduce((sum, item) => sum + item.qty, 0) : 0;
      userStats[o.userName].totalSpend += o.total;
      userStats[o.userName].totalQty += orderQty;
      userStats[o.userName].orderCount += 1;
      userStats[o.userName].orders.push(o);

      if (orderQty > userStats[o.userName].maxSingleOrderQty) {
        userStats[o.userName].maxSingleOrderQty = orderQty;
      }
      if (o.total > userStats[o.userName].maxSingleOrderSpend) {
        userStats[o.userName].maxSingleOrderSpend = o.total;
      }
    });

    const userList = Object.values(userStats);

    const getTopUser = (list, filterFn, scoreFn) => {
      const filtered = list.filter(filterFn);
      if (filtered.length === 0) return { name: '-', score: 0 };
      let top = filtered[0];
      filtered.forEach(u => {
        if (scoreFn(u) > scoreFn(top)) top = u;
      });
      return { name: top.name, score: scoreFn(top) };
    };

    const mukbangMaster = getTopUser(userList, u => u.maxSingleOrderQty > 3, u => u.maxSingleOrderQty);
    const seleraElit = getTopUser(userList, u => true, u => u.totalSpend);
    const blackHoleBelly = getTopUser(userList, u => true, u => u.totalQty);
    const avengersTeam = getTopUser(userList, u => u.maxSingleOrderQty > 5, u => u.maxSingleOrderQty);
    const investorUtama = getTopUser(userList, u => true, u => u.totalSpend * 0.9);

    let ceoFlexing = { name: '-', score: 0 };
    if (todayOrders.length > 0) {
      todayOrders.forEach(o => {
        if (o.total > ceoFlexing.score) {
          ceoFlexing = { name: o.userName, score: o.total };
        }
      });
    }

    let lastSurvivor = { name: '-', time: '-' };
    if (todayOrders.length > 0) {
      const sortedToday = [...todayOrders].sort((a, b) => b.id - a.id);
      lastSurvivor = { name: sortedToday[0].userName };
    }

    let dietBesok = { name: '-', time: '-' };
    if (todayOrders.length > 0) {
      const sortedToday = [...todayOrders].sort((a, b) => a.id - b.id);
      dietBesok = { name: sortedToday[0].userName };
    }

    return {
      mukbangMaster,
      seleraElit,
      blackHoleBelly,
      avengersTeam,
      investorUtama,
      ceoFlexing,
      lastSurvivor,
      dietBesok
    };
  }, [orders]);

  // --- REKAP KOMPREHENSIF UNTUK CFO (REALTIME) ---
  const ordersByResto = useMemo(() => {
    const todayOrders = orders.filter(o => o.date === 'Hari Ini');
    const restoMap = {};

    todayOrders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const menuObj = menus.find(m => m.id === item.menuId);
          if (menuObj) {
            const rId = menuObj.restaurant_id;
            const restoObj = restaurants.find(r => r.id === rId);
            const restoName = restoObj ? restoObj.name : 'Restoran Lain';

            if (!restoMap[rId]) {
              restoMap[rId] = {
                restoName,
                totalCost: 0,
                itemsList: []
              };
            }
            restoMap[rId].totalCost += (item.price * item.qty);
            restoMap[rId].itemsList.push({
              userName: order.userName,
              itemName: item.name,
              qty: item.qty,
              price: item.price,
              notes: item.notes
            });
          }
        });
      }
    });
    return Object.values(restoMap);
  }, [orders, menus, restaurants]);

  const ordersByMenu = useMemo(() => {
    const todayOrders = orders.filter(o => o.date === 'Hari Ini');
    const menuMap = {};

    todayOrders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          if (!menuMap[item.menuId]) {
            menuMap[item.menuId] = {
              menuName: item.name,
              qty: 0,
              price: item.price,
              restoName: ''
            };
            const menuObj = menus.find(m => m.id === item.menuId);
            if (menuObj) {
              const restoObj = restaurants.find(r => r.id === menuObj.restaurant_id);
              menuMap[item.menuId].restoName = restoObj ? restoObj.name : '';
            }
          }
          menuMap[item.menuId].qty += item.qty;
        });
      }
    });
    return Object.values(menuMap);
  }, [orders, menus, restaurants]);

  // Aksi update status untuk admin CFO
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    if (isFirebaseReady && firebaseUser) {
      const orderDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId);
      await updateDoc(orderDocRef, { status: newStatus });
    } else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  const handleToggleLapak = async () => {
    const nextOpenState = !session.isOpen;
    const updatedSession = { ...session, isOpen: nextOpenState };
    setSession(updatedSession);
    
    if (isFirebaseReady && firebaseUser) {
      const sessionDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'session', 'current');
      await setDoc(sessionDocRef, updatedSession);
    }
  };

  const handleUpdateEndTime = async (time) => {
    const updatedSession = { ...session, endTime: time };
    setSession(updatedSession);
    if (isFirebaseReady && firebaseUser) {
      const sessionDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'session', 'current');
      await setDoc(sessionDocRef, updatedSession);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center font-sans antialiased p-4">
      
      {/* Device Mockup */}
      <div className="w-full max-w-[410px] bg-[#F7F8FC] h-[820px] flex flex-col relative shadow-[0_24px_60px_rgba(0,0,0,0.6)] rounded-[48px] border-[10px] border-slate-950 overflow-hidden">
        
        {/* Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-12 h-1.5 bg-slate-800 rounded-full"></div>
        </div>

        {/* SCREEN 1: ONBOARDING */}
        {currentScreen === 'onboarding' && (
          <div className="flex-1 flex flex-col justify-between p-8 pt-16 bg-gradient-to-b from-[#E2E6FF] via-[#EAEFFF] to-[#F5F8FF]">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-indigo-600 tracking-wider">09:40 WIB</span>
              <div className="flex gap-1 items-center">
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
              </div>
            </div>

            <div className="my-auto text-center space-y-6">
              <div className="relative inline-block mx-auto">
                <div className="absolute -top-6 -left-6 w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center text-slate-900 shadow-md font-black text-lg transform -rotate-12 animate-bounce">
                  Hi! 👋
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center text-white shadow-lg transform rotate-12">
                  <Flame size={28} className="animate-pulse" />
                </div>
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
                  Pesan makan siang kantor dengan asyik, raih gelar terhormat, dan kalahkan para Sultan Makan!
                </p>
              </div>
            </div>

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
                <span className="text-xs text-slate-400 font-semibold cursor-pointer hover:text-indigo-600" onClick={() => handleLogin('Admin CFO', '0000')}>Masuk CFO (Admin)</span>
                <span className="text-xs text-slate-400 font-semibold">MakanBang v3.5</span>
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
                <p className="text-xs text-slate-500 leading-relaxed">Masukkan identitas panggilan kantormu agar CFO tidak salah antar makanan.</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Panggilan Kantor</label>
                  <input 
                    type="text" 
                    placeholder="Misal: Mas Wahyu, Mbak Sarah" 
                    id="login-name"
                    defaultValue="Mas Wahyu"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white p-3.5 rounded-2xl text-xs focus:outline-none transition-all duration-200 text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nomor Handphone</label>
                  <input 
                    type="text" 
                    placeholder="Masukkan No. HP Anda..." 
                    id="login-phone"
                    defaultValue="0812345"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white p-3.5 rounded-2xl text-xs focus:outline-none transition-all duration-200 text-slate-800 font-bold"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                const name = document.getElementById('login-name')?.value || 'Mas Wahyu';
                const phone = document.getElementById('login-phone')?.value || '123';
                handleLogin(name, phone);
              }}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 hover:from-indigo-700 active:scale-[0.98] transition duration-200 text-xs"
            >
              Masuk ke Dashboard 🚀
            </button>
          </div>
        )}

        {/* SCREEN 3: USER DASHBOARD */}
        {currentScreen === 'user_dashboard' && (
          <div className="flex-1 flex flex-col bg-[#F7F8FC] pt-12">
            
            {/* Profil Header */}
            <div className="px-5 pb-4 flex justify-between items-center bg-white border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-indigo-500 flex items-center justify-center text-lg shadow-sm">
                  👨‍💻
                </div>
                <div>
                  <h4 className="font-black text-xs text-slate-800">{currentUser?.name}</h4>
                  <p className="text-[9px] text-indigo-600 font-semibold flex items-center gap-0.5">
                    <Award size={10}/> Level {orders.filter(o => o.userName === currentUser?.name).length >= 5 ? '3: Sultan Makan' : '1: Musafir Lapar'}
                  </p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center text-red-500 transition">
                <LogOut size={14} />
              </button>
            </div>

            {/* TAB CONTENT: EXPLORE */}
            {userTab === 'explore' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Level Progress Bar */}
                <div className="px-5 pt-4 shrink-0">
                  <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-4 rounded-3xl shadow-md relative overflow-hidden">
                    <div className="absolute right-2 bottom-2 text-5xl opacity-10">🏆</div>
                    <div className="flex justify-between items-center text-[10px] font-extrabold tracking-wider text-indigo-200">
                      <span>EXP KULINER</span>
                      <span>{Math.min(orders.filter(o => o.userName === currentUser?.name).length * 25, 100)}% menuju Dewa Kenyang</span>
                    </div>
                    <div className="w-full bg-indigo-900/50 h-3 rounded-full mt-2 overflow-hidden p-0.5 border border-indigo-500/20">
                      <div className="bg-gradient-to-r from-amber-400 to-amber-300 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(orders.filter(o => o.userName === currentUser?.name).length * 25, 100)}%` }}></div>
                    </div>
                    <p className="text-[9px] text-amber-300 font-medium mt-2">🔥 Info: Setiap pesanan meningkatkan EXP & peringkat Sultan-mu!</p>
                  </div>
                </div>

                {/* Kategori Makanan */}
                <div className="px-5 pt-5 shrink-0">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">Kategori Kuliner</h3>
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

                {/* List Restoran */}
                <div className="flex-1 px-5 pt-4 overflow-y-auto pb-24 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Misi Makan Siang Aktif</h3>
                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full flex items-center gap-1">
                      <Clock size={10} /> Sisa s/d {session.endTime}
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
                              <span className="text-[8px] font-bold text-amber-400 uppercase tracking-wider">REKOMENDASI CFO</span>
                              <h4 className="text-sm font-black text-white">{resto.name}</h4>
                            </div>
                          </div>
                        </div>
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
              </div>
            )}

            {/* TAB CONTENT: PESANAN SAYA */}
            {userTab === 'my_orders' && (
              <div className="flex-1 overflow-y-auto px-5 pt-4 pb-24 space-y-6">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3">Pesanan Aktif Hari Ini</h3>
                  
                  {orders.filter(o => o.userName === currentUser?.name && o.date === 'Hari Ini').length === 0 ? (
                    <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-slate-200">
                      <span className="text-4xl block mb-2">🍽️</span>
                      <p className="text-xs font-bold text-slate-700">Belum ada pesanan aktif hari ini.</p>
                      <button 
                        onClick={() => setUserTab('explore')}
                        className="mt-3 text-[10px] font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl border border-indigo-200 hover:bg-indigo-100 transition"
                      >
                        Pesan Sekarang
                      </button>
                    </div>
                  ) : (
                    orders.filter(o => o.userName === currentUser?.name && o.date === 'Hari Ini').map(order => (
                      <div key={order.id} className="bg-white text-slate-800 rounded-[28px] overflow-hidden shadow-md border border-slate-150">
                        <div className="bg-indigo-600 text-white p-4 flex justify-between items-center relative">
                          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#F7F8FC] rounded-full"></div>
                          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#F7F8FC] rounded-full"></div>
                          <div>
                            <span className="text-[8px] font-bold text-indigo-200 uppercase tracking-wider">KARYAWAN</span>
                            <h4 className="font-black text-xs">{order.userName}</h4>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] font-bold text-indigo-200 uppercase tracking-wider">STATUS ORDER</span>
                            <span className="bg-amber-400 text-slate-950 text-[8px] font-black px-2 py-0.5 rounded-full block mt-0.5">{order.status}</span>
                          </div>
                        </div>

                        <div className="p-4 space-y-2 border-b border-dashed border-slate-200">
                          {order.items && order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-600">{item.qty}x {item.name}</span>
                              <span className="text-slate-800 font-bold">{formatRp(item.price * item.qty)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="p-4 bg-slate-50 space-y-2.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-slate-400 font-bold uppercase">TOTAL TAGIHAN</span>
                            <span className="text-sm font-black text-indigo-600">{formatRp(order.total)}</span>
                          </div>
                          
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">Transfer ke Rekening CFO</p>
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-[10px] font-bold text-indigo-700">{session.bankAccount}</span>
                              <button 
                                onClick={() => navigator.clipboard.writeText(session.bankAccount)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-500"
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* History Section */}
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5"><History size={16}/> Riwayat Pesanan 30 Hari Terakhir</h3>
                  <div className="space-y-3">
                    {orders.filter(o => o.userName === currentUser?.name && o.date !== 'Hari Ini').length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-4">Belum ada riwayat pesanan.</p>
                    ) : (
                      orders.filter(o => o.userName === currentUser?.name && o.date !== 'Hari Ini').map(hist => (
                        <div key={hist.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                              <span className="font-bold text-xs text-slate-800">{hist.items?.[0]?.name || "Menu Gabungan"}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">Tanggal Transaksi: {hist.date}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-xs text-slate-800 block">{formatRp(hist.total)}</span>
                            <span className="text-[8px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded">Selesai</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: GAMIFIED LEADERBOARD */}
            {userTab === 'leaderboard' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header Banner */}
                <div className="px-5 pt-4 shrink-0">
                  <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 p-4 rounded-3xl shadow-md text-center relative overflow-hidden">
                    <div className="absolute left-3 top-3 text-4xl opacity-10">👑</div>
                    <Trophy size={32} className="mx-auto mb-1 text-slate-900 drop-shadow-md animate-bounce" />
                    <h3 className="font-black text-sm uppercase tracking-tight">Klan Sultan Makan Kantor</h3>
                    <p className="text-[9px] font-bold text-slate-900/80">Kasta makan teraktif & gelar terhormat di kantor!</p>
                  </div>
                </div>

                {/* Sub Tab: Leaderboard vs Gelar */}
                <div className="px-5 pt-4 shrink-0 flex gap-2">
                  <button 
                    onClick={() => setLeaderboardSubTab('rank')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${leaderboardSubTab === 'rank' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200'}`}
                  >
                    🏆 Peringkat Sultan
                  </button>
                  <button 
                    onClick={() => setLeaderboardSubTab('badges')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${leaderboardSubTab === 'badges' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200'}`}
                  >
                    🏅 Gelar & Pencapaian
                  </button>
                </div>

                {/* SUB TAB: RANKING LIST */}
                {leaderboardSubTab === 'rank' && (
                  <div className="flex-1 overflow-y-auto px-5 pt-4 pb-24 space-y-2.5">
                    {(() => {
                      const userTotals = {};
                      orders.forEach(o => {
                        userTotals[o.userName] = (userTotals[o.userName] || 0) + o.total;
                      });

                      const sortedSultans = Object.keys(userTotals).map(name => ({
                        name,
                        totalSpend: userTotals[name]
                      })).sort((a, b) => b.totalSpend - a.totalSpend);

                      return sortedSultans.map((sultan, index) => {
                        const isCurrentUser = sultan.name === currentUser?.name;
                        let rankBadge = `${index + 1}`;
                        let rankStyle = "bg-slate-100 text-slate-700";
                        let borderStyle = "border-slate-150";
                        let titleBadge = "Petualangan Rasa";
                        let titleStyle = "bg-slate-100 text-slate-600";

                        if (index === 0) {
                          rankBadge = "👑 1";
                          rankStyle = "bg-amber-100 text-amber-700 border-amber-300 font-black";
                          borderStyle = "border-amber-300 bg-amber-500/5";
                          titleBadge = "Raja Sultan Makan 👑";
                          titleStyle = "bg-amber-500 text-slate-950 font-black";
                        } else if (index === 1) {
                          rankBadge = "🥈 2";
                          rankStyle = "bg-indigo-100 text-indigo-700 font-bold";
                          titleBadge = "Menteri Kuliner";
                          titleStyle = "bg-indigo-500 text-white font-bold";
                        } else if (index === 2) {
                          rankBadge = "🥉 3";
                          rankStyle = "bg-orange-100 text-orange-700 font-bold";
                          titleBadge = "Wakil Menteri Kuliner";
                          titleStyle = "bg-orange-400 text-white font-bold";
                        }

                        return (
                          <div 
                            key={index} 
                            className={`bg-white p-4 rounded-2xl border flex justify-between items-center transition-all ${borderStyle} ${isCurrentUser ? 'ring-2 ring-indigo-500 shadow-md' : 'shadow-sm'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black border ${rankStyle}`}>
                                {rankBadge}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-xs text-slate-800">{sultan.name}</span>
                                  {isCurrentUser && <span className="text-[8px] bg-indigo-600 text-white px-1.5 rounded-md font-bold">Kamu</span>}
                                </div>
                                <span className={`text-[8px] px-2 py-0.5 rounded-full inline-block mt-1.5 font-extrabold ${titleStyle}`}>{titleBadge}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-[9px] text-slate-400 block uppercase font-bold">TOTAL BELANJA</span>
                              <span className="font-black text-xs text-slate-800">{formatRp(sultan.totalSpend)}</span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}

                {/* SUB TAB: GELAR & ACHIEVEMENTS */}
                {leaderboardSubTab === 'badges' && (
                  <div className="flex-1 overflow-y-auto px-5 pt-4 pb-24 space-y-3">
                    {[
                      {
                        title: "The Mukbang Master 👑",
                        desc: "Pernah memesan lebih dari 3 menu makanan dalam satu order.",
                        winner: dynamicBadges.mukbangMaster.name,
                        metric: dynamicBadges.mukbangMaster.score ? `${dynamicBadges.mukbangMaster.score} Porsi Sekaligus` : '-',
                        badgeIcon: "🔥"
                      },
                      {
                        title: "Selera Elit 🌾",
                        desc: "Gaya sultan sejati, total pesanan termahal dalam kurun sebulan terakhir.",
                        winner: dynamicBadges.seleraElit.name,
                        metric: formatRp(dynamicBadges.seleraElit.score),
                        badgeIcon: "💎"
                      },
                      {
                        title: "Black Hole Belly 🌌",
                        desc: "Perut tanpa dasar, paling banyak memesan dari segi jumlah porsi total.",
                        winner: dynamicBadges.blackHoleBelly.name,
                        metric: `${dynamicBadges.blackHoleBelly.score} Porsi Terbabat`,
                        badgeIcon: "🌀"
                      },
                      {
                        title: "The Avengers Team 🛡️",
                        desc: "Pesanan makanan lebih dari 5 porsi sampai dikira mau kasih makan satu tim pahlawan super.",
                        winner: dynamicBadges.avengersTeam.name,
                        metric: dynamicBadges.avengersTeam.score ? `${dynamicBadges.avengersTeam.score} Porsi Pesta` : '-',
                        badgeIcon: "🚀"
                      },
                      {
                        title: "Investor Utama Resto 💼",
                        desc: "Penyokong dana warung makan teraktif dengan total order mingguan tertinggi.",
                        winner: dynamicBadges.investorUtama.name,
                        metric: formatRp(dynamicBadges.investorUtama.score),
                        badgeIcon: "📈"
                      },
                      {
                        title: "CEO of Flexing Food 👑",
                        desc: "Paling jor-joran dan megah, pemegang nilai order termahal khusus hari ini.",
                        winner: dynamicBadges.ceoFlexing.name,
                        metric: formatRp(dynamicBadges.ceoFlexing.score),
                        badgeIcon: "✨"
                      },
                      {
                        title: "The Last Survivor ⏱️",
                        desc: "Ujung tanduk petualangan, pemesan paling mepet terakhir hari ini.",
                        winner: dynamicBadges.lastSurvivor.name,
                        metric: "Last Order Hari Ini",
                        badgeIcon: "⛺"
                      },
                      {
                        title: "Diet Mulai Besok 🥗",
                        desc: "Selalu gerak cepat mengamankan antrean, pemesan paling awal dalam minggu ini.",
                        winner: dynamicBadges.dietBesok.name,
                        metric: "Order Pertama Hari Ini",
                        badgeIcon: "🥗"
                      }
                    ].map((badge, index) => (
                      <div key={index} className={`p-4 rounded-2xl border flex items-start gap-3 bg-white shadow-sm`}>
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border flex items-center justify-center text-2xl shrink-0">
                          {badge.badgeIcon}
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="font-extrabold text-xs text-slate-800">{badge.title}</h4>
                          <p className="text-[10px] text-slate-400 leading-normal">{badge.desc}</p>
                          <div className="pt-2 flex justify-between items-center text-[10px]">
                            <span className="text-slate-500">Penyandang: <strong className="text-slate-800">{badge.winner}</strong></span>
                            <span className="font-black bg-slate-100 px-2 py-0.5 rounded text-slate-700">{badge.metric}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Floating Bottom Nav */}
            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 backdrop-blur-md rounded-[24px] p-2 flex justify-around items-center text-slate-400 z-30 shadow-lg">
              <button 
                onClick={() => setUserTab('explore')} 
                className={`flex flex-col items-center gap-0.5 py-1 px-3.5 rounded-xl transition duration-150 ${userTab === 'explore' ? 'text-amber-400' : 'hover:text-white'}`}
              >
                <Compass size={18} />
                <span className="text-[8px] font-bold uppercase">Explore</span>
              </button>
              <button 
                onClick={() => setUserTab('my_orders')} 
                className={`flex flex-col items-center gap-0.5 py-1 px-3.5 rounded-xl transition duration-150 ${userTab === 'my_orders' ? 'text-amber-400' : 'hover:text-white'}`}
              >
                <Receipt size={18} />
                <span className="text-[8px] font-bold uppercase">Pesanan Saya</span>
              </button>
              <button 
                onClick={() => setUserTab('leaderboard')} 
                className={`flex flex-col items-center gap-0.5 py-1 px-3.5 rounded-xl transition duration-150 ${userTab === 'leaderboard' ? 'text-amber-400' : 'hover:text-white'}`}
              >
                <Trophy size={18} />
                <span className="text-[8px] font-bold uppercase">Sultan Board</span>
              </button>
              <button 
                onClick={() => setCurrentScreen('admin_dashboard')} 
                className="flex flex-col items-center gap-0.5 hover:text-white transition"
              >
                <Store size={18} />
                <span className="text-[8px] font-bold uppercase">CFO Panel</span>
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 4: RESTORAN DETAIL */}
        {currentScreen === 'restaurant_detail' && (
          <div className="flex-1 flex flex-col bg-[#F7F8FC] pt-12">
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

            {/* Bottom Action Sheet */}
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

        {/* SCREEN 5: ADMIN DASHBOARD */}
        {currentScreen === 'admin_dashboard' && (
          <div className="flex-1 flex flex-col bg-[#F7F8FC] pt-12">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
              <h1 className="font-black text-sm tracking-tight flex items-center gap-1"><Store size={16}/> CFO Panel Kontrol</h1>
              <button onClick={() => {
                setCurrentScreen('user_dashboard');
                setUserTab('explore');
              }} className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white">User Mode</button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white p-5 rounded-3xl shadow-lg flex justify-between items-center relative overflow-hidden">
                <div>
                  <p className="text-slate-300 text-[9px] font-bold uppercase tracking-wider mb-1">Total Pemasukan Misi Makan</p>
                  <h2 className="text-2xl font-black text-amber-400">Rp 1.054.000</h2>
                  <p className="text-[9px] text-slate-300 mt-1">Total Pesanan Terdaftar: <span className="font-bold text-white">{orders.length} Transaksi</span></p>
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
                    onClick={handleToggleLapak}
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
                    onChange={e => handleUpdateEndTime(e.target.value)}
                    className="w-full bg-slate-50 border p-3 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Rekap Order Masuk */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Rekap Order Hari Ini</h3>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                    {orders.filter(o => o.date === 'Hari Ini').length} Pesanan
                  </span>
                </div>

                {/* Segmented Controller / Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button 
                    onClick={() => setAdminViewTab('orang')}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${adminViewTab === 'orang' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    👤 Per Orang
                  </button>
                  <button 
                    onClick={() => setAdminViewTab('resto')}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${adminViewTab === 'resto' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    🏢 Per Resto
                  </button>
                  <button 
                    onClick={() => setAdminViewTab('menu')}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${adminViewTab === 'menu' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    📋 Per Menu
                  </button>
                </div>

                {/* RENDERING BASED ON TABS */}
                {adminViewTab === 'orang' && (
                  <div className="space-y-3">
                    {orders.filter(o => o.date === 'Hari Ini').length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-4 bg-white rounded-2xl border border-slate-150">Belum ada pesanan masuk hari ini.</p>
                    ) : (
                      orders.filter(o => o.date === 'Hari Ini').map(order => (
                        <div key={order.id} className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm text-xs">
                          <div className="flex justify-between items-center border-b pb-2 mb-2">
                            <span className="font-bold text-slate-800">{order.userName}</span>
                            <span className="font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{formatRp(order.total)}</span>
                          </div>
                          <ul className="space-y-1 text-[10px] text-slate-500 font-medium">
                            {order.items && order.items.map((item, i) => (
                              <li key={i}>{item.qty}x {item.name} {item.notes && <span className="text-amber-600 italic">("{item.notes}")</span>}</li>
                            ))}
                          </ul>
                          <div className="mt-3 pt-2.5 border-t flex justify-between items-center">
                            <span className="text-[9px] text-slate-400 uppercase font-bold">Ubah Status ({order.status})</span>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => handleUpdateOrderStatus(order.id, 'Diproses CFO')}
                                className="bg-indigo-50 text-indigo-700 text-[8px] font-bold px-2 py-1 rounded hover:bg-indigo-100"
                              >
                                Proses
                              </button>
                              <button 
                                onClick={() => handleUpdateOrderStatus(order.id, 'Selesai')}
                                className="bg-emerald-50 text-emerald-700 text-[8px] font-bold px-2 py-1 rounded hover:bg-emerald-100"
                              >
                                Selesai
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {adminViewTab === 'resto' && (
                  <div className="space-y-3">
                    {ordersByResto.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-4 bg-white rounded-2xl border border-slate-150">Belum ada pesanan dari restoran mana pun hari ini.</p>
                    ) : (
                      ordersByResto.map((resto, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm text-xs space-y-2">
                          <div className="flex justify-between items-center border-b pb-2">
                            <span className="font-extrabold text-slate-800 flex items-center gap-1">🏢 {resto.restoName}</span>
                            <span className="text-[10px] font-black text-indigo-600">{formatRp(resto.totalCost)}</span>
                          </div>
                          <ul className="space-y-2 text-[10px] text-slate-600">
                            {resto.itemsList.map((item, i) => (
                              <li key={i} className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                                <div className="flex justify-between font-bold text-slate-700">
                                  <span>{item.qty}x {item.itemName}</span>
                                  <span className="text-indigo-500 font-medium">untuk {item.userName}</span>
                                </div>
                                {item.notes && <p className="text-amber-600 italic mt-1 font-semibold">💬 Catatan: "{item.notes}"</p>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {adminViewTab === 'menu' && (
                  <div className="space-y-3">
                    {ordersByMenu.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-4 bg-white rounded-2xl border border-slate-150">Belum ada menu yang terdaftar hari ini.</p>
                    ) : (
                      <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden divide-y divide-slate-100">
                        {ordersByMenu.map((menu, idx) => (
                          <div key={idx} className="p-3.5 flex justify-between items-center text-xs hover:bg-slate-50 transition-colors">
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-800">{menu.menuName}</span>
                              <p className="text-[9px] text-slate-400 font-medium">{menu.restoName}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">Total:</span>
                              <span className="font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg text-xs">
                                {menu.qty} Porsi
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

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