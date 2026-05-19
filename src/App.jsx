import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Utensils, Wallet, Store, List, 
  Plus, Minus, Check, LogOut, 
  ChevronRight, Receipt, Clock,
  Sparkles, Star, MessageSquare, Copy,
  MapPin, Navigation, Compass, Award,
  Flame, Bell, History, Trophy, ArrowLeft,
  Image as ImageIcon, Trash2, Upload
} from 'lucide-react';

// --- INTEGRASI CORE CLOUD DATABASE ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// ============================================================================
// ⚙️ FIREBASE CONFIGURATION (KREDENSIAL ASLI NIMAK)
// ============================================================================
const firebaseConfig = {
  apiKey: "AIzaSyA4WWxScF_k7CeXYJWXPBQCU_z4E50oCA4",
  authDomain: "nimak-bfe56.firebaseapp.com",
  projectId: "nimak-bfe56",
  storageBucket: "nimak-bfe56.firebasestorage.app",
  messagingSenderId: "958561448423",
  appId: "1:958561448423:web:afae6cb869ba9d2d408d42"
};

// Inisialisasi Firebase Murni
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- SEED DATA CADANGAN (Menggunakan String ID agar seragam dengan Firestore) ---
const initialRestaurants = [
  { id: "resto1", name: 'Warteg Bahari Kingdom', rating: 4.9, reviews: 320, category: 'Local Culinary • Cozy', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80', tag: 'Terpopuler 🔥', distance: '200m dari Kantor', time: '15-20 mnt' },
  { id: "resto2", name: 'Geprek Bensu Volcano', rating: 4.8, reviews: 154, category: 'Spicy Grill • Fast Food', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80', tag: 'Promo Juara 🏷️', distance: '800m dari Kantor', time: '20-25 mnt' },
  { id: "resto3", name: 'Soto Lamongan Cak Legendaris', rating: 4.9, reviews: 412, category: 'Warm Soup • Authentic', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80', tag: 'Pilihan CFO ⭐', distance: '1.2km dari Kantor', time: '25-30 mnt' }
];

const initialMenus = [
  { id: "menu1", restaurant_id: "resto1", name: 'Nasi Telur Dadar + Orek Tempe', price: 15000, desc: 'Perpaduan klasik nasi hangat, telur dadar krispi tebal, dan orek tempe manis basah.', popular: true, tag: 'Recomended' },
  { id: "menu2", restaurant_id: "resto1", name: 'Nasi Ayam Goreng Serundeng', price: 18000, desc: 'Ayam goreng empuk bumbu ungkep ditaburi serundeng kelapa gurih melimpah.', popular: true, tag: 'Must Try' },
  { id: "menu3", restaurant_id: "resto1", name: 'Es Teh Manis Jumbo Booster', price: 4000, desc: 'Es teh manis dingin ukuran gelas raksasa siap mengembalikan fokus kerjamu.', popular: false },
  { id: "menu4", restaurant_id: "resto2", name: 'Paket Geprek Lava Mozzarella', price: 25000, desc: 'Ayam geprek krispi diselimuti lelehan keju mozzarella molor dan sambal korek level petir.', popular: true, tag: 'Pedas Gila' },
  { id: "menu5", restaurant_id: "resto2", name: 'Jamur Crispy Kriuk Nagih', price: 10000, desc: 'Jamur tiram pilihan digoreng tepung bumbu rahasia super renyah.', popular: false },
  { id: "menu6", restaurant_id: "resto3", name: 'Soto Ayam Koya Istimewa', price: 18000, desc: 'Soto Lamongan kuah kuning kaya rempah dengan taburan koya gurih yang melimpah ruah.', popular: true, tag: 'Legendaris' },
  { id: "menu7", restaurant_id: "resto3", name: 'Soto Sapi Kuah Bening', price: 22000, desc: 'Potongan daging sapi empuk disiram kuah soto bening hangat menyegarkan.', popular: false },
];

const initialOrders = [
  { id: "mock1", userName: "Mbak Sarah (Finance)", total: 39000, date: 'Hari Ini', items: [{ menuId: "menu1", name: 'Nasi Telur Dadar + Orek Tempe', price: 15000, qty: 1, notes: "" }, { menuId: "menu4", name: 'Paket Geprek Lava Mozzarella', price: 25000, qty: 1, notes: "" }], status: 'Selesai' }
];

const formatRp = (num) => {
  if (num === null || num === undefined || isNaN(num)) return 'Rp 0';
  return 'Rp ' + num.toLocaleString('id-ID');
};

// --- FUNGSI KOMPRESI GAMBAR (Ubah Gambar Jadi Teks Kecil WebP) ---
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Perkecil maksimal lebar 400px (Sangat cukup untuk HP)
        const MAX_WIDTH = 400; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Kompres menjadi format WebP dengan kualitas 60% (Kecil banget, ~20KB)
        const compressedBase64 = canvas.toDataURL('image/webp', 0.6);
        resolve(compressedBase64);
      }
    }
  });
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('onboarding');
  const [userTab, setUserTab] = useState('explore');
  const [leaderboardSubTab, setLeaderboardSubTab] = useState('rank');
  
  // CFO Tabs: 'rekap' (lihat pesanan) atau 'kelola' (tambah resto/menu)
  const [cfoMainTab, setCfoMainTab] = useState('rekap'); 
  const [adminViewTab, setAdminViewTab] = useState('orang');
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userAuth, setUserAuth] = useState(null); 
  
  // Data Master State
  const [restaurants, setRestaurants] = useState([]);
  const [menus, setMenus] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedResto, setSelectedResto] = useState(null);
  const [cart, setCart] = useState([]);
  
  // Form States untuk CFO
  const [isCompressing, setIsCompressing] = useState(false);
  const [newResto, setNewResto] = useState({ name: '', category: '', tag: '', distance: 'Dekat', time: '15 mnt', image: '' });
  const [activeAddMenuRestoId, setActiveAddMenuRestoId] = useState(null);
  const [newMenu, setNewMenu] = useState({ name: '', price: '', desc: '', tag: '' });

  const fileInputRef = useRef(null);
  
  const [session, setSession] = useState({
    isOpen: true,
    openRestoIds: ["resto1", "resto2", "resto3"],
    endTime: '11:45',
    bankAccount: 'BCA 872-019-2831 a.n Joko Susilo (CFO)',
    rejectMessage: 'Waduh petualangan kuliner hari ini sudah ditutup! 😭 Hubungi CFO jika darurat!'
  });

  // --- LOGIN OTOMATIS FIREBASE ---
  useEffect(() => {
    signInAnonymously(auth).catch((error) => console.error("Gagal login anonim:", error));
    const unsubscribe = onAuthStateChanged(auth, (user) => { if (user) setUserAuth(user); });
    return () => unsubscribe();
  }, []);

  // --- SINKRONISASI DATABASE REALTIME (SESSION, ORDERS, RESTOS, MENUS) ---
  useEffect(() => {
    if (!userAuth) return; 

    const sessionRef = doc(db, 'session', 'current');
    const ordersRef = collection(db, 'orders');
    const restosRef = collection(db, 'restaurants');
    const menusRef = collection(db, 'menus');

    const unsubSession = onSnapshot(sessionRef, (snap) => {
      if (snap.exists()) setSession(snap.data());
      else setDoc(sessionRef, session).catch(e => console.log(e));
    });

    const unsubOrders = onSnapshot(ordersRef, (snap) => {
      const list = []; snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setOrders(list.length > 0 ? list : initialOrders);
    });

    const unsubRestos = onSnapshot(restosRef, (snap) => {
      const list = []; snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      if (list.length > 0) {
        setRestaurants(list);
      } else {
        // Seeding awal jika kosong
        initialRestaurants.forEach(r => setDoc(doc(db, 'restaurants', r.id), r));
      }
    });

    const unsubMenus = onSnapshot(menusRef, (snap) => {
      const list = []; snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      if (list.length > 0) {
        setMenus(list);
      } else {
        // Seeding awal jika kosong
        initialMenus.forEach(m => setDoc(doc(db, 'menus', m.id), m));
      }
    });

    return () => { unsubSession(); unsubOrders(); unsubRestos(); unsubMenus(); };
  }, [userAuth]);

  // --- FUNGSI CFO: KELOLA RESTO & MENU ---
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsCompressing(true);
    const compressedBase64 = await compressImage(file);
    setNewResto(prev => ({ ...prev, image: compressedBase64 }));
    setIsCompressing(false);
  };

  const handleAddResto = async () => {
    if (!newResto.name || !newResto.category) return alert("Nama dan Kategori wajib diisi!");
    const finalResto = {
      ...newResto,
      rating: 5.0, reviews: 0,
      image: newResto.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
    };
    await addDoc(collection(db, 'restaurants'), finalResto);
    setNewResto({ name: '', category: '', tag: '', distance: 'Dekat', time: '15 mnt', image: '' });
  };

  const handleDeleteResto = async (id) => {
    if(window.confirm("Yakin ingin menghapus resto ini?")) {
      await deleteDoc(doc(db, 'restaurants', id));
    }
  };

  const handleAddMenu = async (restoId) => {
    if (!newMenu.name || !newMenu.price) return alert("Nama dan Harga wajib diisi!");
    await addDoc(collection(db, 'menus'), {
      restaurant_id: restoId,
      name: newMenu.name,
      price: Number(newMenu.price),
      desc: newMenu.desc,
      tag: newMenu.tag,
      popular: false
    });
    setNewMenu({ name: '', price: '', desc: '', tag: '' });
    setActiveAddMenuRestoId(null);
  };

  const handleDeleteMenu = async (id) => {
    if(window.confirm("Hapus menu ini?")) {
      await deleteDoc(doc(db, 'menus', id));
    }
  };

  // --- FUNGSI USER GENERAL ---
  const handleStartAdventure = () => setCurrentScreen('login');
  const handleLogin = (name, phone) => {
    const role = phone === '0000' ? 'admin' : 'user';
    setCurrentUser({ name, phone, role });
    setCurrentScreen(role === 'admin' ? 'admin_dashboard' : 'user_dashboard');
  };
  const handleLogout = () => { setCurrentUser(null); setCart([]); setCurrentScreen('onboarding'); };
  const viewRestoDetail = (resto) => { setSelectedResto(resto); setCurrentScreen('restaurant_detail'); };

  const handleUpdateCart = (menu, delta) => {
    setCart(prev => {
      const existing = prev.find(item => item.menuId === menu.id);
      if (!existing) return delta > 0 ? [...prev, { menuId: menu.id, name: menu.name, price: menu.price, qty: 1, notes: '' }] : prev;
      const newQty = existing.qty + delta;
      if (newQty <= 0) return prev.filter(item => item.menuId !== menu.id);
      return prev.map(item => item.menuId === menu.id ? { ...item, qty: newQty } : item);
    });
  };

  const handleUpdateNotes = (menuId, notes) => setCart(prev => prev.map(item => item.menuId === menuId ? { ...item, notes } : item));

  const handleCheckout = async () => {
    const newOrder = {
      userName: currentUser?.name || 'User',
      items: cart,
      total: cartTotal,
      date: 'Hari Ini',
      status: 'Menunggu Pembayaran',
      timestamp: Date.now()
    };
    if (userAuth) {
      try { await addDoc(collection(db, 'orders'), newOrder); } 
      catch (error) { console.error("Gagal kirim pesanan:", error); }
    }
    setCart([]); setCurrentScreen('user_dashboard'); setUserTab('my_orders');
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    if (userAuth) await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
  };

  const handleToggleLapak = async () => {
    const updated = { ...session, isOpen: !session.isOpen };
    setSession(updated);
    if (userAuth) await setDoc(doc(db, 'session', 'current'), updated);
  };

  const cartTotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.qty || 0)), 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  
  // Tampilkan semua resto yang terdaftar (Bisa di-filter berdasarkan status buka/tutup nanti)
  const openRestaurants = restaurants; 
  const filteredMenus = menus.filter(m => m.restaurant_id === selectedResto?.id);

  // Sultan System Engine
  const dynamicBadges = useMemo(() => {
    const userStats = {};
    const todayOrders = orders.filter(o => o && o.date === 'Hari Ini');
    
    orders.forEach(o => {
      if (!o) return;
      const uName = o.userName || 'User';
      if (!userStats[uName]) userStats[uName] = { name: uName, totalSpend: 0, totalQty: 0, maxSingleQty: 0 };
      let oQty = 0;
      if (o.items && Array.isArray(o.items)) oQty = o.items.reduce((s, i) => s + (Number(i?.qty) || 0), 0);
      userStats[uName].totalSpend += (Number(o.total) || 0);
      userStats[uName].totalQty += oQty;
      if (oQty > userStats[uName].maxSingleQty) userStats[uName].maxSingleQty = oQty;
    });
    
    const uList = Object.values(userStats);
    const getTop = (list, scoreFn) => list.length ? list.reduce((a, b) => scoreFn(a) > scoreFn(b) ? a : b) : { name: '-', totalSpend: 0, totalQty: 0, maxSingleQty: 0 };

    return {
      mukbangMaster: getTop(uList.filter(u => u.maxSingleQty > 3), u => u.maxSingleQty),
      seleraElit: getTop(uList, u => u.totalSpend),
      blackHoleBelly: getTop(uList, u => u.totalQty),
      avengersTeam: getTop(uList.filter(u => u.maxSingleQty > 5), u => u.maxSingleQty),
      investorUtama: getTop(uList, u => u.totalSpend),
      ceoFlexing: todayOrders.length ? todayOrders.reduce((a, b) => (Number(a.total) || 0) > (Number(b.total) || 0) ? a : b) : { userName: '-' },
      lastSurvivor: todayOrders.length ? [...todayOrders].sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0))[0] : { userName: '-' },
      dietBesok: todayOrders.length ? [...todayOrders].sort((a,b) => (a.timestamp || 0) - (b.timestamp || 0))[0] : { userName: '-' }
    };
  }, [orders]);

  const ordersByResto = useMemo(() => {
    const map = {};
    orders.filter(o => o && o.date === 'Hari Ini').forEach(o => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach(i => {
          if (!i) return;
          const mObj = menus.find(m => m.id === i.menuId);
          if (mObj) {
            if (!map[mObj.restaurant_id]) {
              const rObj = restaurants.find(r => r.id === mObj.restaurant_id);
              map[mObj.restaurant_id] = { restoName: rObj ? rObj.name : 'Restoran Lain', totalCost: 0, itemsList: [] };
            }
            map[mObj.restaurant_id].totalCost += ((Number(i.price) || 0) * (Number(i.qty) || 0));
            map[mObj.restaurant_id].itemsList.push({ userName: o.userName || 'User', itemName: i.name || 'Menu', qty: Number(i.qty) || 0, notes: i.notes || '' });
          }
        });
      }
    });
    return Object.values(map);
  }, [orders, menus, restaurants]);

  const ordersByMenu = useMemo(() => {
    const map = {};
    orders.filter(o => o && o.date === 'Hari Ini').forEach(o => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach(i => {
          if (!i) return;
          if (!map[i.menuId]) map[i.menuId] = { menuName: i.name || 'Menu', qty: 0 };
          map[i.menuId].qty += (Number(i.qty) || 0);
        });
      }
    });
    return Object.values(map);
  }, [orders]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-[410px] bg-[#F7F8FC] h-[820px] flex flex-col relative shadow-2xl rounded-[48px] border-[10px] border-slate-950 overflow-hidden">
        
        {/* Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-12 h-1.5 bg-slate-800 rounded-full"></div>
        </div>

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
                  <p className="text-[10px] text-amber-300 font-semibold mt-1">🔥 Batas konfirmasi pesanan s/d {session?.endTime || '11:45'} WIB</p>
                </div>
                <div className="space-y-3">
                  {openRestaurants.length === 0 && <p className="text-xs text-center text-slate-400 py-5">Belum ada restoran terdaftar.</p>}
                  {openRestaurants.map(r => (
                    <div key={r.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200/60 shadow-sm relative group">
                      {r.tag && <span className="absolute top-0 right-0 bg-amber-400 text-slate-900 font-black text-[8px] py-1 px-2 rounded-bl-xl z-10">{r.tag}</span>}
                      <img src={r.image || 'https://via.placeholder.com/400'} className="w-full h-24 object-cover" alt={r.name}/>
                      <div className="p-4 flex justify-between items-center">
                        <div><h4 className="font-black text-xs text-slate-800">{r.name}</h4><p className="text-[9px] text-slate-400">{r.category}</p></div>
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
                {orders.filter(o => o && o.userName === currentUser?.name && o.date === 'Hari Ini').length === 0 && (
                   <p className="text-xs text-slate-500 italic text-center mt-10">Belum ada pesanan.</p>
                )}
                {orders.filter(o => o && o.userName === currentUser?.name && o.date === 'Hari Ini').map(order => (
                  <div key={order.id} className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
                    <div className="flex justify-between border-b pb-2"><span className="font-black text-xs">{order.userName}</span><span className="bg-amber-400 text-[8px] font-black px-2 py-0.5 rounded-full">{order.status}</span></div>
                    <div className="space-y-1 text-xs text-slate-600 font-semibold">
                      {order.items && order.items.map((i, idx) => <div key={idx} className="flex justify-between"><span>{i?.qty}x {i?.name}</span><span>{formatRp((i?.price || 0) * (i?.qty || 0))}</span></div>)}
                    </div>
                    <div className="border-t pt-2 flex justify-between font-black text-indigo-600 text-xs"><span>TOTAL</span><span>{formatRp(order.total)}</span></div>
                    <div className="bg-slate-50 p-2 rounded-xl text-[9px] font-mono text-center border font-semibold text-slate-700">Transfer CFO: {session?.bankAccount}</div>
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
                    {Object.entries(orders.reduce((acc, o) => {
                      if (!o) return acc;
                      const name = o.userName || 'User';
                      const total = Number(o.total) || 0;
                      return { ...acc, [name]: (acc[name] || 0) + total };
                    }, {})).sort((a,b)=>b[1]-a[1]).map(([name, total], i) => (
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
              <h3 className="font-black text-sm text-slate-800">{selectedResto?.name}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
              {filteredMenus.length === 0 && <p className="text-center text-xs text-slate-400 py-5">Belum ada menu di resto ini.</p>}
              {filteredMenus.map(menu => {
                const cItem = cart.find(c => c.menuId === menu.id);
                const qty = cItem ? cItem.qty : 0;
                return (
                  <div key={menu.id} className="bg-white p-4 rounded-2xl border flex justify-between items-center text-xs shadow-sm">
                    <div className="max-w-[65%]">
                      <div className="flex items-center gap-1.5 mb-1"><h4 className="font-bold text-slate-800">{menu.name}</h4>{menu.tag && <span className="text-[7px] bg-indigo-100 text-indigo-700 px-1 rounded font-bold">{menu.tag}</span>}</div>
                      <p className="text-[9px] text-slate-400 line-clamp-2">{menu.desc}</p>
                      <p className="text-indigo-600 font-bold mt-1.5">{formatRp(menu.price)}</p>
                    </div>
                    {qty === 0 ? <button onClick={() => handleUpdateCart(menu, 1)} className="bg-indigo-50 text-indigo-600 font-bold px-3 py-1.5 rounded-xl shrink-0">Pilih</button> :
                    <div className="flex items-center gap-2 bg-slate-50 border p-1 rounded-xl shrink-0"><button onClick={() => handleUpdateCart(menu, -1)} className="font-bold px-1.5 text-slate-600">-</button><span className="font-bold w-3 text-center">{qty}</span><button onClick={() => handleUpdateCart(menu, 1)} className="font-bold px-1.5 text-slate-600">+</button></div>}
                  </div>
                );
              })}
            </div>
            {cartItemsCount > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 rounded-t-[32px] shadow-2xl flex justify-between items-center z-40">
                <div><span className="text-[9px] text-slate-400 block font-bold">TOTAL</span><span className="text-sm font-black text-indigo-600">{formatRp(cartTotal)}</span></div>
                <button onClick={handleCheckout} className="bg-indigo-600 text-white font-extrabold py-3 px-6 rounded-2xl text-xs shadow-md shadow-indigo-500/30">Konfirmasi Pesanan 🚀</button>
              </div>
            )}
          </div>
        )}

        {/* SCREEN 5: CFO ADMIN PANEL (DITAMBAH FITUR KELOLA DATA) */}
        {currentScreen === 'admin_dashboard' && (
          <div className="flex-1 flex flex-col bg-[#F7F8FC] pt-12">
            <div className="bg-slate-900 text-white p-4 flex flex-col gap-3 shrink-0">
              <div className="flex justify-between items-center">
                <h1 className="font-black text-xs flex items-center gap-1">💼 CFO Panel (Nimak)</h1>
                <button onClick={() => { setCurrentScreen('user_dashboard'); setUserTab('explore'); }} className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-300">User Mode</button>
              </div>
              
              {/* TOP TABS: Rekap Order vs Kelola Data */}
              <div className="flex bg-slate-800 p-1 rounded-xl">
                <button onClick={() => setCfoMainTab('rekap')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${cfoMainTab === 'rekap' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>📊 Rekap Order</button>
                <button onClick={() => setCfoMainTab('kelola')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${cfoMainTab === 'kelola' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>🛠️ Kelola Data</button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
              
              {/* TAB REKAP ORDER */}
              {cfoMainTab === 'rekap' && (
                <>
                  <div className="flex justify-between items-center p-3 bg-white border rounded-2xl shadow-sm">
                    <div><span className="font-bold text-xs text-slate-800 block">Sesi Order Gerbang</span><span className="text-[9px] text-slate-400">Buka/tutup lapak online</span></div>
                    <button onClick={handleToggleLapak} className={`text-[10px] font-black px-3 py-1.5 rounded-xl ${session?.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{session?.isOpen ? 'BUKA' : 'TUTUP'}</button>
                  </div>

                  <div className="flex bg-slate-200 p-1 rounded-xl border">
                    <button onClick={() => setAdminViewTab('orang')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${adminViewTab === 'orang' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>👤 Per Orang</button>
                    <button onClick={() => setAdminViewTab('resto')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${adminViewTab === 'resto' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>🏢 Per Resto</button>
                    <button onClick={() => setAdminViewTab('menu')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${adminViewTab === 'menu' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>📋 Per Menu</button>
                  </div>

                  {adminViewTab === 'orang' && orders.filter(o => o && o.date === 'Hari Ini').map(o => (
                    <div key={o.id} className="bg-white p-3 rounded-2xl border text-xs shadow-sm space-y-2">
                      <div className="flex justify-between font-bold border-b pb-1"><span>{o.userName}</span><span className="text-indigo-600">{formatRp(o.total)}</span></div>
                      <p className="text-[10px] text-slate-500 font-semibold">{o.items ? o.items.map(i => `${i?.qty || 0}x ${i?.name || 'Menu'}`).join(', ') : '-'}</p>
                      <div className="flex justify-end gap-1.5 pt-1"><button onClick={() => handleUpdateOrderStatus(o.id, 'Diproses CFO')} className="bg-indigo-50 text-indigo-700 text-[9px] px-2 py-0.5 rounded">Proses</button><button onClick={() => handleUpdateOrderStatus(o.id, 'Selesai')} className="bg-emerald-50 text-emerald-700 text-[9px] px-2 py-0.5 rounded">Selesai</button></div>
                    </div>
                  ))}

                  {adminViewTab === 'resto' && ordersByResto.map((r, i) => (
                    <div key={i} className="bg-white p-3 rounded-2xl border text-xs shadow-sm space-y-1.5">
                      <div className="flex justify-between font-black border-b pb-1 text-slate-800"><span>🏢 {r.restoName}</span><span>{formatRp(r.totalCost)}</span></div>
                      {r.itemsList && r.itemsList.map((it, idx) => <p key={idx} className="text-[10px] text-slate-500 font-semibold">• {it.qty}x {it.itemName} <span className="text-indigo-600 font-bold">({it.userName})</span></p>)}
                    </div>
                  ))}

                  {adminViewTab === 'menu' && (
                    <div className="bg-white rounded-2xl border shadow-sm divide-y text-xs">
                      {ordersByMenu.map((m, i) => <div key={i} className="p-3 flex justify-between font-bold"><span>{m.menuName}</span><span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg">{m.qty} Porsi</span></div>)}
                    </div>
                  )}
                </>
              )}

              {/* TAB KELOLA DATA (MASTER RESTO & MENU) */}
              {cfoMainTab === 'kelola' && (
                <div className="space-y-5">
                  {/* Form Tambah Resto Baru */}
                  <div className="bg-white p-4 rounded-2xl border shadow-sm space-y-3">
                    <h3 className="text-xs font-black text-slate-800 border-b pb-2">➕ Tambah Restoran Baru</h3>
                    
                    <div className="space-y-2">
                      <input type="text" placeholder="Nama Restoran..." value={newResto.name} onChange={e => setNewResto({...newResto, name: e.target.value})} className="w-full bg-slate-50 border p-2 rounded-xl text-xs focus:border-indigo-500 outline-none" />
                      <div className="flex gap-2">
                        <input type="text" placeholder="Kategori (Mis: Fast Food)" value={newResto.category} onChange={e => setNewResto({...newResto, category: e.target.value})} className="flex-1 bg-slate-50 border p-2 rounded-xl text-xs focus:border-indigo-500 outline-none" />
                        <input type="text" placeholder="Label/Tag (Opsional)" value={newResto.tag} onChange={e => setNewResto({...newResto, tag: e.target.value})} className="w-1/3 bg-slate-50 border p-2 rounded-xl text-[10px] focus:border-indigo-500 outline-none" />
                      </div>
                      
                      {/* Upload & Compress Area */}
                      <div className="flex items-center gap-2 mt-2">
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                        <button onClick={() => fileInputRef.current.click()} className="flex-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 border-dashed text-slate-600 font-semibold p-2.5 rounded-xl text-[10px] flex items-center justify-center gap-2 transition">
                          {isCompressing ? <span className="animate-pulse">⏳ Mengompresi Foto...</span> : <><Upload size={14}/> {newResto.image ? 'Foto Berhasil Diupload!' : 'Upload Foto Resto'}</>}
                        </button>
                        {newResto.image && <img src={newResto.image} className="w-9 h-9 rounded-lg object-cover border" alt="preview" />}
                      </div>

                      <button onClick={handleAddResto} disabled={isCompressing} className="w-full bg-indigo-600 text-white font-bold p-2.5 rounded-xl text-xs mt-2 disabled:bg-slate-400">Simpan Restoran</button>
                    </div>
                  </div>

                  {/* List Restoran Terdaftar */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-800">📋 Daftar Resto & Menu</h3>
                    {restaurants.map(resto => (
                      <div key={resto.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 p-3 border-b bg-slate-50">
                          <img src={resto.image || 'https://via.placeholder.com/100'} className="w-12 h-12 rounded-lg object-cover border" />
                          <div className="flex-1">
                            <h4 className="font-black text-xs text-slate-800">{resto.name}</h4>
                            <p className="text-[9px] text-slate-400">{resto.category}</p>
                          </div>
                          <button onClick={() => handleDeleteResto(resto.id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Trash2 size={12}/></button>
                        </div>

                        {/* List Menu per Resto */}
                        <div className="p-3 space-y-2">
                          {menus.filter(m => m.restaurant_id === resto.id).map(menu => (
                            <div key={menu.id} className="flex justify-between items-center text-[10px] border-b border-dashed pb-1.5">
                              <div><span className="font-bold text-slate-700">{menu.name}</span><span className="text-indigo-600 ml-2 font-bold">{formatRp(menu.price)}</span></div>
                              <button onClick={() => handleDeleteMenu(menu.id)} className="text-red-400 hover:text-red-600"><Trash2 size={10}/></button>
                            </div>
                          ))}
                          
                          {/* Form Tambah Menu Inline */}
                          {activeAddMenuRestoId === resto.id ? (
                            <div className="bg-slate-100 p-2.5 rounded-xl space-y-2 mt-2 border">
                              <input type="text" placeholder="Nama Menu..." value={newMenu.name} onChange={e => setNewMenu({...newMenu, name: e.target.value})} className="w-full p-1.5 text-[10px] rounded outline-none" />
                              <div className="flex gap-2">
                                <input type="number" placeholder="Harga (Mis: 15000)" value={newMenu.price} onChange={e => setNewMenu({...newMenu, price: e.target.value})} className="flex-1 p-1.5 text-[10px] rounded outline-none" />
                                <input type="text" placeholder="Deskripsi pendek" value={newMenu.desc} onChange={e => setNewMenu({...newMenu, desc: e.target.value})} className="flex-1 p-1.5 text-[10px] rounded outline-none" />
                              </div>
                              <div className="flex gap-1">
                                <button onClick={() => handleAddMenu(resto.id)} className="flex-1 bg-emerald-500 text-white text-[9px] font-bold p-1.5 rounded">Simpan Menu</button>
                                <button onClick={() => setActiveAddMenuRestoId(null)} className="flex-1 bg-slate-300 text-slate-700 text-[9px] font-bold p-1.5 rounded">Batal</button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => setActiveAddMenuRestoId(resto.id)} className="w-full mt-1 py-1.5 text-[10px] font-bold text-indigo-600 border border-indigo-200 border-dashed rounded-lg hover:bg-indigo-50">
                              + Tambah Menu Baru
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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