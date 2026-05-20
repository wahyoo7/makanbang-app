import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Utensils, Wallet, Store, List, 
  Plus, Minus, Check, LogOut, 
  ChevronRight, Receipt, Clock,
  Sparkles, Star, MessageSquare, Copy,
  MapPin, Navigation, Compass, Award,
  Flame, Bell, History, Trophy, ArrowLeft,
  Image as ImageIcon, Trash2, Upload, Edit, X,
  Shield
} from 'lucide-react';

// --- INTEGRASI CORE CLOUD DATABASE ---
import { initializeApp } from 'firebase/app';
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

// Inisialisasi Firestore Secara Langsung (Anti-Gagal)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'nimak-bfe56-app';

// --- SEED DATA CADANGAN ---
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
  { id: "mock1", userName: "Mbak Sarah (Finance)", total: 39000, date: 'Hari Ini', items: [{ menuId: "menu1", name: 'Nasi Telur Dadar + Orek Tempe', price: 15000, qty: 1, notes: "" }, { menuId: "menu4", name: 'Paket Geprek Lava Mozzarella', price: 25000, qty: 1, notes: "" }], status: 'Selesai', timestamp: Date.now() }
];

const formatRp = (num) => {
  if (num === null || num === undefined || isNaN(num)) return 'Rp 0';
  return 'Rp ' + num.toLocaleString('id-ID');
};

const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.6));
      }
    }
  });
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('onboarding');
  const [userTab, setUserTab] = useState('explore');
  const [leaderboardSubTab, setLeaderboardSubTab] = useState('rank');
  
  const [cfoMainTab, setCfoMainTab] = useState('rekap'); 
  const [adminViewTab, setAdminViewTab] = useState('orang');
  
  const [currentUser, setCurrentUser] = useState(null);
  
  const [restaurants, setRestaurants] = useState([]);
  const [menus, setMenus] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedResto, setSelectedResto] = useState(null);
  const [cart, setCart] = useState([]);
  
  // CFO Kelola Data States
  const [isCompressing, setIsCompressing] = useState(false);
  const [newResto, setNewResto] = useState({ name: '', category: '', tag: '', distance: 'Kantor', time: '15 mnt', image: '' });
  const [activeAddMenuRestoId, setActiveAddMenuRestoId] = useState(null);
  const [newMenu, setNewMenu] = useState({ name: '', price: '', desc: '', tag: '' });
  
  // States untuk Edit
  const [editingResto, setEditingResto] = useState(null);
  const [editingMenu, setEditingMenu] = useState(null);

  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  
  const [session, setSession] = useState({
    isOpen: true,
    openRestoIds: ["resto1", "resto2", "resto3"],
    endTime: '11:45',
    bankAccount: 'BCA 872-019-2831 a.n Joko Susilo (CFO)',
    rejectMessage: 'Waduh petualangan kuliner hari ini sudah ditutup! 😭 Hubungi CFO jika darurat!'
  });

  // --- 📡 SINKRONISASI DATABASE REALTIME INSTAN (Direct Connection) ---
  useEffect(() => {
    const sessionRef = doc(db, 'artifacts', appId, 'public', 'data', 'session', 'current');
    const ordersRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
    const restosRef = collection(db, 'artifacts', appId, 'public', 'data', 'restaurants');
    const menusRef = collection(db, 'artifacts', appId, 'public', 'data', 'menus');

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
      setRestaurants(list.length > 0 ? list : initialRestaurants);
      if (list.length === 0) {
        initialRestaurants.forEach(r => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'restaurants', r.id), r));
      }
    });

    const unsubMenus = onSnapshot(menusRef, (snap) => {
      const list = []; snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setMenus(list.length > 0 ? list : initialMenus);
      if (list.length === 0) {
        initialMenus.forEach(m => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'menus', m.id), m));
      }
    });

    return () => { unsubSession(); unsubOrders(); unsubRestos(); unsubMenus(); };
  }, []);

  // ==========================================
  // FUNGSI CFO KELOLA DATA MASTER
  // ==========================================
  const handleToggleRestoActiveToday = async (restoId) => {
    let currentActive = session.openRestoIds || [];
    let newActive = currentActive.includes(restoId) ? currentActive.filter(id => id !== restoId) : [...currentActive, restoId];
    const updated = { ...session, openRestoIds: newActive };
    setSession(updated);
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'session', 'current'), updated);
  };

  const handleImageChange = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsCompressing(true);
    const compressedBase64 = await compressImage(file);
    if(isEdit) setEditingResto(prev => ({...prev, image: compressedBase64}));
    else setNewResto(prev => ({ ...prev, image: compressedBase64 }));
    setIsCompressing(false);
  };

  const handleAddResto = async () => {
    if (!newResto.name || !newResto.category) return alert("Nama dan Kategori wajib diisi!");
    const finalResto = { ...newResto, rating: 5.0, reviews: 0, image: newResto.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80' };
    
    try {
      const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'restaurants'), finalResto);
      const updatedSession = { ...session, openRestoIds: [...(session.openRestoIds || []), docRef.id] };
      setSession(updatedSession);
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'session', 'current'), updatedSession);
    } catch (error) {
      console.error(error);
    }
    setNewResto({ name: '', category: '', tag: '', distance: 'Kantor', time: '15 mnt', image: '' });
  };

  const submitEditResto = async () => {
    if (!editingResto.name || !editingResto.category) return alert("Nama dan Kategori wajib diisi!");
    const ref = doc(db, 'artifacts', appId, 'public', 'data', 'restaurants', editingResto.id);
    await updateDoc(ref, { name: editingResto.name, category: editingResto.category, tag: editingResto.tag, image: editingResto.image });
    setEditingResto(null);
  };

  const handleDeleteResto = async (id) => {
    if(window.confirm("Yakin ingin menghapus resto ini? Data tidak bisa kembali.")) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'restaurants', id));
    }
  };

  const handleAddMenu = async (restoId) => {
    if (!newMenu.name || !newMenu.price) return alert("Nama dan Harga wajib diisi!");
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'menus'), {
      restaurant_id: restoId, name: newMenu.name, price: Number(newMenu.price), desc: newMenu.desc, tag: newMenu.tag, popular: false
    });
    setNewMenu({ name: '', price: '', desc: '', tag: '' });
    setActiveAddMenuRestoId(null);
  };

  const submitEditMenu = async () => {
    if (!editingMenu.name || !editingMenu.price) return alert("Nama dan Harga wajib diisi!");
    const ref = doc(db, 'artifacts', appId, 'public', 'data', 'menus', editingMenu.id);
    await updateDoc(ref, { name: editingMenu.name, price: Number(editingMenu.price), desc: editingMenu.desc, tag: editingMenu.tag });
    setEditingMenu(null);
  };

  const handleDeleteMenu = async (id) => {
    if(window.confirm("Hapus menu ini?")) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'menus', id));
    }
  };

  // --- GENERAL USER FLOW ---
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
      userName: currentUser?.name || 'User', items: cart, total: cartTotal, date: 'Hari Ini', status: 'Menunggu Pembayaran', timestamp: Date.now()
    };
    try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), newOrder); } 
    catch (error) { console.error(error); }
    setCart([]); setCurrentScreen('user_dashboard'); setUserTab('my_orders');
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId), { status: newStatus });
  };

  const handleToggleLapak = async () => {
    const updated = { ...session, isOpen: !session.isOpen };
    setSession(updated);
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'session', 'current'), updated);
  };

  const cartTotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.qty || 0)), 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  const openRestaurants = restaurants.filter(r => (session?.openRestoIds || []).includes(r.id)); 
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
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Container Adaptif: Fullscreen di HP Karyawan, Card Elegan di Desktop */}
      <div className="w-full sm:max-w-md h-[100dvh] sm:h-[85vh] sm:min-h-[780px] sm:max-h-[900px] bg-[#F7F8FC] flex flex-col relative sm:shadow-2xl sm:rounded-[36px] sm:border sm:border-slate-200/80 overflow-hidden transition-all duration-300">
        
        {/* SCREEN 1: ONBOARDING */}
        {currentScreen === 'onboarding' && (
          <div className="flex-1 flex flex-col justify-between p-8 pt-12 bg-gradient-to-b from-[#E2E6FF] via-[#EAEFFF] to-[#F5F8FF]">
            <span className="text-xs font-black text-indigo-600">09:40 WIB</span>
            <div className="text-center space-y-6 my-auto">
              <div className="w-40 h-40 rounded-[36px] bg-indigo-100 flex items-center justify-center shadow-inner mx-auto">
                <span className="text-7xl transform hover:scale-110 transition duration-300">🍱</span>
              </div>
              <h1 className="text-3xl font-black text-slate-800 leading-none">
                Welcome to <br/>
                <span className="text-indigo-600 bg-indigo-100 px-3 py-1 rounded-2xl inline-block mt-1">Nimak</span>
              </h1>
              <p className="text-xs text-slate-500 max-w-[240px] mx-auto">Sistem Petualangan Makan Siang Kantor Seru, Cepat, & Kompetitif.</p>
            </div>
            
            <div className="space-y-3">
              <button onClick={handleStartAdventure} className="w-full bg-indigo-600 text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-indigo-500/30 flex justify-between px-6 text-sm hover:bg-indigo-700 active:scale-95 transition">
                <span>Mulai Petualangan</span><ChevronRight size={18}/>
              </button>
              <div className="flex justify-between items-center px-2 mt-4">
                <span className="text-xs text-slate-400 font-semibold cursor-pointer hover:text-indigo-600" onClick={() => handleLogin('Admin CFO', '0000')}>Masuk CFO (Admin)</span>
                <span className="text-[10px] text-slate-400 font-bold bg-slate-200 px-2 py-0.5 rounded-full">Nimak v3.8</span>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: LOGIN */}
        {currentScreen === 'login' && (
          <div className="flex-1 flex flex-col justify-between p-8 pt-12 bg-gradient-to-b from-[#FFF5E6] via-white to-[#F7F8FC]">
            <button onClick={() => setCurrentScreen('onboarding')} className="w-8 h-8 bg-white border rounded-full flex items-center justify-center shadow-sm"><ArrowLeft size={14}/></button>
            <div className="my-auto space-y-4">
              <h2 className="text-xl font-black text-slate-800">Daftarkan Karaktermu!</h2>
              <div className="bg-white p-5 rounded-3xl border shadow-sm space-y-3">
                <input type="text" placeholder="Nama Panggilan Kantor..." id="ln" defaultValue="Mas Wahyu" className="w-full bg-slate-50 border p-3 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"/>
                <input type="text" placeholder="Nomor Handphone..." id="lp" defaultValue="0812345" className="w-full bg-slate-50 border p-3 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"/>
              </div>
            </div>
            <button onClick={() => handleLogin(document.getElementById('ln').value || 'User', document.getElementById('lp').value || '1')} className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition text-white font-extrabold py-4 rounded-2xl text-xs shadow-lg shadow-indigo-500/20">Masuk Dashboard 🚀</button>
          </div>
        )}

        {/* SCREEN 3: USER DASHBOARD */}
        {currentScreen === 'user_dashboard' && (
          <div className="flex-1 flex flex-col min-h-0 h-full bg-[#F7F8FC]">
            
            {/* Header Profil */}
            <div className="px-5 py-4 flex justify-between items-center bg-white border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm border border-indigo-200">👨‍💻</div>
                <div>
                  <h4 className="font-black text-xs text-slate-800">{currentUser?.name}</h4>
                  <p className="text-[8px] text-indigo-600 font-bold">Nimak Adventurer</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-7 h-7 bg-red-50 text-red-500 hover:bg-red-100 rounded-full flex items-center justify-center transition"><LogOut size={12}/></button>
            </div>

            {/* TAB CONTENT: EXPLORE (Misi Aktif) */}
            {userTab === 'explore' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-28 min-h-0">
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-4 rounded-3xl shadow-sm relative overflow-hidden">
                  <Flame className="absolute -right-2 -bottom-2 text-indigo-500 opacity-20" size={60} />
                  <span className="text-[9px] font-bold block">MISI AKTIF HARI INI</span>
                  <p className="text-[10px] text-amber-300 font-semibold mt-1">🔥 Batas konfirmasi pesanan s/d {session?.endTime || '11:45'} WIB</p>
                </div>
                
                <div className="space-y-3">
                  {openRestaurants.length === 0 && (
                    <div className="bg-white border-2 border-dashed border-slate-200 p-6 rounded-3xl text-center text-slate-400 mt-4">
                      <Store className="mx-auto mb-2 opacity-50" size={24} />
                      <p className="text-xs font-bold text-slate-600">Lapak Sedang Tutup</p>
                      <p className="text-[10px]">Silakan tunggu CFO membuka sesi order.</p>
                    </div>
                  )}
                  {openRestaurants.map(r => (
                    <div key={r.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200/60 shadow-sm relative group hover:shadow-md transition">
                      {r.tag && <span className="absolute top-0 right-0 bg-amber-400 text-slate-900 font-black text-[8px] py-1 px-2 rounded-bl-xl z-10">{r.tag}</span>}
                      <img src={r.image || 'https://via.placeholder.com/400'} className="w-full h-24 object-cover" alt={r.name}/>
                      <div className="p-4 flex justify-between items-center">
                        <div><h4 className="font-black text-xs text-slate-800">{r.name}</h4><p className="text-[9px] text-slate-400">{r.category}</p></div>
                        <button onClick={() => viewRestoDetail(r)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl text-[10px] transition">Pilih Menu</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {userTab === 'my_orders' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-28 min-h-0">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Karcis Pesanan Aktif</h3>
                {orders.filter(o => o && o.userName === currentUser?.name && o.date === 'Hari Ini').length === 0 && (
                   <div className="bg-white border-2 border-dashed border-slate-200 p-6 rounded-3xl text-center text-slate-400 mt-4">
                     <Receipt className="mx-auto mb-2 opacity-50" size={24} />
                     <p className="text-[10px]">Belum ada pesanan aktif hari ini.</p>
                   </div>
                )}
                {orders.filter(o => o && o.userName === currentUser?.name && o.date === 'Hari Ini').map(order => (
                  <div key={order.id} className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
                    <div className="flex justify-between border-b pb-2 border-slate-100"><span className="font-black text-xs text-slate-800">{order.userName}</span><span className="bg-amber-100 text-amber-700 border border-amber-200 text-[8px] font-black px-2 py-0.5 rounded-full">{order.status}</span></div>
                    <div className="space-y-1 text-xs text-slate-600 font-semibold">
                      {order.items && order.items.map((i, idx) => <div key={idx} className="flex justify-between"><span>{i?.qty}x {i?.name}</span><span className="text-slate-800">{formatRp((i?.price || 0) * (i?.qty || 0))}</span></div>)}
                    </div>
                    <div className="border-t pt-2 border-slate-100 flex justify-between font-black text-indigo-600 text-xs"><span>TOTAL</span><span>{formatRp(order.total)}</span></div>
                    <div className="bg-slate-50 p-2 rounded-xl text-[9px] font-mono text-center border border-slate-200 font-semibold text-slate-700 flex justify-center items-center gap-2">Transfer CFO: {session?.bankAccount} <button onClick={() => navigator.clipboard.writeText(session?.bankAccount)}><Copy size={10}/></button></div>
                  </div>
                ))}
              </div>
            )}

            {userTab === 'leaderboard' && (
              <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
                <div className="px-5 pt-3 flex gap-2 shrink-0">
                  <button onClick={() => setLeaderboardSubTab('rank')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition ${leaderboardSubTab === 'rank' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500'}`}>Peringkat</button>
                  <button onClick={() => setLeaderboardSubTab('badges')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition ${leaderboardSubTab === 'badges' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500'}`}>Gelar Kantor 🏅</button>
                </div>
                
                {leaderboardSubTab === 'rank' && (
                  <div className="flex-1 overflow-y-auto p-5 space-y-2 pb-28 min-h-0">
                    {Object.entries(orders.reduce((acc, o) => {
                      if (!o) return acc;
                      const name = o.userName || 'User';
                      const total = Number(o.total) || 0;
                      return { ...acc, [name]: (acc[name] || 0) + total };
                    }, {})).sort((a,b)=>b[1]-a[1]).map(([name, total], i) => (
                      <div key={i} className="bg-white p-3 rounded-xl border flex justify-between items-center text-xs shadow-sm hover:border-indigo-200 transition">
                        <span className="font-black text-indigo-600">#{i+1} <span className="text-slate-800 ml-1">{name}</span></span><span className="font-bold text-slate-800">{formatRp(total)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {leaderboardSubTab === 'badges' && (
                  <div className="flex-1 overflow-y-auto p-5 space-y-2 pb-28 min-h-0">
                    {[
                      { t: "The Mukbang Master 👑", d: "Memesan > 3 menu dalam 1 order", w: dynamicBadges.mukbangMaster?.name || '-' },
                      { t: "Selera Elit 🌾", d: "Total pesanan termahal sebulan", w: dynamicBadges.seleraElit?.name || '-' },
                      { t: "Black Hole Belly 🌌", d: "Porsi terbanyak terkonsumsi", w: dynamicBadges.blackHoleBelly?.name || '-' },
                      { t: "The Avengers Team 🛡️", d: "Pesan porsi jumbo buat satu tim", w: dynamicBadges.avengersTeam?.name || '-' },
                      { t: "CEO of Flexing Food 💎", d: "Pemesan termahal hari ini", w: dynamicBadges.ceoFlexing?.userName || '-' },
                      { t: "The Last Survivor ⏱️", d: "Pemesan terakhir paling mepet", w: dynamicBadges.lastSurvivor?.userName || '-' },
                      { t: "Diet Mulai Besok 🥗", d: "Pemesan paling awal hari ini", w: dynamicBadges.dietBesok?.userName || '-' }
                    ].map((b, i) => (
                      <div key={i} className="bg-white p-3 rounded-2xl border text-[11px] space-y-0.5 shadow-sm hover:border-indigo-200 transition">
                        <h4 className="font-black text-slate-800">{b.t}</h4><p className="text-[9px] text-slate-400">{b.d}</p>
                        <p className="text-[9px] text-indigo-600 font-bold pt-1">Penyandang: <span className="text-slate-800 bg-slate-100 px-1.5 rounded">{b.w}</span></p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Nav User */}
            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-md rounded-[24px] p-2 flex justify-around text-slate-400 z-30 shadow-2xl border border-slate-700/80">
              <button onClick={() => setUserTab('explore')} className={`flex flex-col items-center text-[8px] font-bold transition ${userTab === 'explore' ? 'text-amber-400 scale-110' : 'hover:text-white'}`}><Compass size={16}/>EXPLORE</button>
              <button onClick={() => setUserTab('my_orders')} className={`flex flex-col items-center text-[8px] font-bold transition ${userTab === 'my_orders' ? 'text-amber-400 scale-110' : 'hover:text-white'}`}><Receipt size={16}/>TIKET SAYA</button>
              <button onClick={() => setUserTab('leaderboard')} className={`flex flex-col items-center text-[8px] font-bold transition ${userTab === 'leaderboard' ? 'text-amber-400 scale-110' : 'hover:text-white'}`}><Trophy size={16}/>SULTAN</button>
              {currentUser?.role === 'admin' && (
                <button onClick={() => setCurrentScreen('admin_dashboard')} className="flex flex-col items-center text-[8px] font-bold hover:text-white transition"><Store size={16}/>CFO PANEL</button>
              )}
            </div>
          </div>
        )}

        {/* SCREEN 4: RESTORAN DETAIL */}
        {currentScreen === 'restaurant_detail' && (
          <div className="flex-1 flex flex-col min-h-0 h-full bg-[#F7F8FC]">
            <div className="p-4 bg-white border-b flex items-center gap-3 shrink-0 shadow-sm z-10">
              <button onClick={() => setCurrentScreen('user_dashboard')} className="p-1 hover:bg-slate-100 rounded-lg transition"><ArrowLeft size={18}/></button>
              <h3 className="font-black text-sm text-slate-800 line-clamp-1">{selectedResto?.name}</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-28 min-h-0">
              {filteredMenus.length === 0 && <div className="text-center text-xs text-slate-400 py-10 bg-white border border-dashed rounded-2xl"><Utensils className="mx-auto mb-2 opacity-50"/>Belum ada menu di resto ini.</div>}
              {filteredMenus.map(menu => {
                const cItem = cart.find(c => c.menuId === menu.id);
                const qty = cItem ? cItem.qty : 0;
                return (
                  <div key={menu.id} className={`bg-white p-4 rounded-2xl border flex justify-between items-center text-xs shadow-sm transition ${qty > 0 ? 'border-indigo-400 ring-2 ring-indigo-500/10' : 'hover:border-slate-300'}`}>
                    <div className="max-w-[65%]">
                      <div className="flex items-center gap-1.5 mb-1"><h4 className="font-bold text-slate-800 leading-tight">{menu.name}</h4>{menu.tag && <span className="text-[7px] bg-indigo-100 text-indigo-700 px-1.5 rounded font-bold whitespace-nowrap">{menu.tag}</span>}</div>
                      <p className="text-[9px] text-slate-400 line-clamp-2 leading-relaxed">{menu.desc}</p>
                      <p className="text-indigo-600 font-black mt-1.5">{formatRp(menu.price)}</p>
                    </div>
                    {qty === 0 ? <button onClick={() => handleUpdateCart(menu, 1)} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold px-3 py-1.5 rounded-xl shrink-0 transition">Pilih</button> :
                    <div className="flex items-center gap-2 bg-slate-50 border p-1 rounded-xl shrink-0"><button onClick={() => handleUpdateCart(menu, -1)} className="font-bold px-2 py-1 text-slate-600 hover:bg-white rounded">-</button><span className="font-bold w-3 text-center">{qty}</span><button onClick={() => handleUpdateCart(menu, 1)} className="font-bold px-2 py-1 text-slate-600 hover:bg-white rounded">+</button></div>}
                  </div>
                );
              })}
            </div>
            
            {cartItemsCount > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex justify-between items-center z-40">
                <div><span className="text-[9px] text-slate-400 block font-bold">TOTAL BAYAR</span><span className="text-base font-black text-indigo-600">{formatRp(cartTotal)}</span></div>
                <button onClick={handleCheckout} className="bg-indigo-600 text-white font-extrabold py-3 px-6 rounded-2xl text-xs shadow-lg shadow-indigo-500/30 active:scale-95 transition flex items-center gap-2">Konfirmasi <Check size={14}/></button>
              </div>
            )}
          </div>
        )}

        {/* SCREEN 5: CFO ADMIN PANEL (FULL SINKRONISASI & SCROLL BEBAS) */}
        {currentScreen === 'admin_dashboard' && (
          <div className="flex-1 flex flex-col min-h-0 h-full bg-[#F7F8FC]">
            
            {/* Header Menu CFO */}
            <div className="bg-slate-900 text-white p-4 flex flex-col gap-3 shrink-0 shadow-md z-10">
              <div className="flex justify-between items-center">
                <h1 className="font-black text-xs flex items-center gap-1 text-indigo-300"><Shield size={14}/> CFO Panel Master</h1>
                <button onClick={() => { setCurrentScreen('user_dashboard'); setUserTab('explore'); }} className="text-[9px] font-bold bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-200 transition">User Mode</button>
              </div>
              
              <div className="flex bg-slate-800 p-1 rounded-xl">
                <button onClick={() => setCfoMainTab('rekap')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${cfoMainTab === 'rekap' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>📊 Rekap Order</button>
                <button onClick={() => setCfoMainTab('kelola')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${cfoMainTab === 'kelola' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>🛠️ Master Data</button>
              </div>
            </div>
            
            {/* Scrollable Container Panel Admin */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28 min-h-0">
              
              {/* --- 1. VIEW REKAP ORDER --- */}
              {cfoMainTab === 'rekap' && (
                <>
                  <div className="flex justify-between items-center p-3.5 bg-white border border-indigo-100 rounded-2xl shadow-sm">
                    <div><span className="font-bold text-xs text-slate-800 block">Sesi Order Global</span><span className="text-[9px] text-slate-400">Terima pesanan karyawan?</span></div>
                    <div onClick={handleToggleLapak} className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition duration-300 ${session?.isOpen ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${session?.isOpen ? 'translate-x-6' : ''}`}></div>
                    </div>
                  </div>

                  <div className="flex bg-slate-200 p-1 rounded-xl border">
                    <button onClick={() => setAdminViewTab('orang')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition ${adminViewTab === 'orang' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>👤 Per Orang</button>
                    <button onClick={() => setAdminViewTab('resto')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition ${adminViewTab === 'resto' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>🏢 Per Resto</button>
                    <button onClick={() => setAdminViewTab('menu')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition ${adminViewTab === 'menu' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>📋 Per Menu</button>
                  </div>

                  {adminViewTab === 'orang' && orders.filter(o => o && o.date === 'Hari Ini').map(o => (
                    <div key={o.id} className="bg-white p-3.5 rounded-2xl border text-xs shadow-sm space-y-2">
                      <div className="flex justify-between font-bold border-b border-slate-100 pb-1.5"><span>{o.userName}</span><span className="text-indigo-600">{formatRp(o.total)}</span></div>
                      <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">{o.items ? o.items.map(i => `${i?.qty || 0}x ${i?.name || 'Menu'}`).join(', ') : '-'}</p>
                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                        <button onClick={() => handleUpdateOrderStatus(o.id, 'Diproses CFO')} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[9px] px-3 py-1 rounded-lg transition">Proses</button>
                        <button onClick={() => handleUpdateOrderStatus(o.id, 'Selesai')} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[9px] px-3 py-1 rounded-lg transition">Selesai</button>
                      </div>
                    </div>
                  ))}

                  {adminViewTab === 'resto' && ordersByResto.map((r, i) => (
                    <div key={i} className="bg-white p-3.5 rounded-2xl border text-xs shadow-sm space-y-2">
                      <div className="flex justify-between font-black border-b border-slate-100 pb-1.5 text-slate-800"><span>🏢 {r.restoName}</span><span className="text-indigo-600">{formatRp(r.totalCost)}</span></div>
                      {r.itemsList && r.itemsList.map((it, idx) => <p key={idx} className="text-[10px] text-slate-600 font-medium">• {it.qty}x {it.itemName} <span className="text-indigo-500 font-bold">({it.userName})</span></p>)}
                    </div>
                  ))}

                  {adminViewTab === 'menu' && (
                    <div className="bg-white rounded-2xl border shadow-sm divide-y divide-slate-100 text-xs">
                      {ordersByMenu.map((m, i) => <div key={i} className="p-3.5 flex justify-between items-center font-bold text-slate-700"><span>{m.menuName}</span><span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-[10px]">{m.qty} Porsi</span></div>)}
                    </div>
                  )}
                </>
              )}

              {/* --- 2. VIEW KELOLA MASTER DATA --- */}
              {cfoMainTab === 'kelola' && (
                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-2xl border shadow-sm space-y-3">
                    <h3 className="text-xs font-black text-slate-800 border-b pb-2">➕ Tambah Restoran Master</h3>
                    <div className="space-y-2">
                      <input type="text" placeholder="Nama Restoran..." value={newResto.name} onChange={e => setNewResto({...newResto, name: e.target.value})} className="w-full bg-slate-50 border p-2.5 rounded-xl text-xs focus:border-indigo-500 outline-none transition" />
                      <div className="flex gap-2">
                        <input type="text" placeholder="Kategori (Mis: Fast Food)" value={newResto.category} onChange={e => setNewResto({...newResto, category: e.target.value})} className="flex-1 bg-slate-50 border p-2.5 rounded-xl text-xs focus:border-indigo-500 outline-none transition" />
                        <input type="text" placeholder="Tag (Opsional)" value={newResto.tag} onChange={e => setNewResto({...newResto, tag: e.target.value})} className="w-1/3 bg-slate-50 border p-2.5 rounded-xl text-[10px] focus:border-indigo-500 outline-none transition" />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => handleImageChange(e, false)} className="hidden" />
                        <button onClick={() => fileInputRef.current.click()} className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-300 border-dashed text-slate-600 font-semibold p-2.5 rounded-xl text-[10px] flex items-center justify-center gap-2 transition">
                          {isCompressing ? <span className="animate-pulse">⏳ Mengompresi...</span> : <><Upload size={14}/> {newResto.image ? 'Foto Siap!' : 'Upload Foto'}</>}
                        </button>
                        {newResto.image && <img src={newResto.image} className="w-9 h-9 rounded-lg object-cover border" alt="preview" />}
                      </div>
                      <button onClick={handleAddResto} disabled={isCompressing} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 rounded-xl text-xs mt-2 disabled:bg-slate-400 transition">Simpan Restoran</button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5"><List size={14}/> Database Restoran & Menu</h3>
                    {restaurants.map(resto => {
                      const isRestoOpenToday = (session?.openRestoIds || []).includes(resto.id);
                      const isEditingThisResto = editingResto?.id === resto.id;

                      return (
                      <div key={resto.id} className={`bg-white rounded-2xl border overflow-hidden transition-all ${isRestoOpenToday ? 'shadow-md border-indigo-200' : 'opacity-70 shadow-sm'}`}>
                        <div className="p-3 border-b bg-slate-50 flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            <img src={resto.image || 'https://via.placeholder.com/100'} className="w-12 h-12 rounded-xl object-cover border shadow-sm" />
                            <div className="flex-1">
                              <h4 className="font-black text-xs text-slate-800">{resto.name}</h4>
                              <p className="text-[9px] text-slate-500 font-medium">{resto.category}</p>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1.5">
                              <div onClick={() => handleToggleRestoActiveToday(resto.id)} className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition duration-300 ${isRestoOpenToday ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition duration-300 ${isRestoOpenToday ? 'translate-x-5' : ''}`}></div>
                              </div>
                              <div className="flex gap-1">
                                <button onClick={() => setEditingResto(resto)} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"><Edit size={12}/></button>
                                <button onClick={() => handleDeleteResto(resto.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"><Trash2 size={12}/></button>
                              </div>
                            </div>
                          </div>

                          {isEditingThisResto && (
                            <div className="mt-2 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 border-dashed space-y-2">
                              <input type="text" value={editingResto.name} onChange={e=>setEditingResto({...editingResto, name: e.target.value})} className="w-full text-xs p-2 rounded-lg border outline-none" placeholder="Nama Resto"/>
                              <div className="flex gap-2">
                                <input type="text" value={editingResto.category} onChange={e=>setEditingResto({...editingResto, category: e.target.value})} className="w-1/2 text-[10px] p-2 rounded-lg border outline-none" placeholder="Kategori"/>
                                <input type="text" value={editingResto.tag} onChange={e=>setEditingResto({...editingResto, tag: e.target.value})} className="w-1/2 text-[10px] p-2 rounded-lg border outline-none" placeholder="Tag"/>
                              </div>
                              <div className="flex items-center gap-2">
                                <input type="file" accept="image/*" ref={editFileInputRef} onChange={(e) => handleImageChange(e, true)} className="hidden" />
                                <button onClick={() => editFileInputRef.current.click()} className="text-[9px] font-bold bg-white border px-2 py-1.5 rounded-lg flex items-center gap-1"><Upload size={10}/> Ganti Foto</button>
                                <div className="flex-1 flex gap-1 justify-end">
                                  <button onClick={submitEditResto} className="bg-indigo-600 text-white text-[9px] font-bold px-3 py-1.5 rounded-lg">Simpan</button>
                                  <button onClick={()=>setEditingResto(null)} className="bg-slate-200 text-slate-700 text-[9px] font-bold px-3 py-1.5 rounded-lg">Batal</button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="p-3 space-y-2 bg-white">
                          {menus.filter(m => m.restaurant_id === resto.id).map(menu => {
                            const isEditingThisMenu = editingMenu?.id === menu.id;
                            return (
                            <div key={menu.id} className="border-b border-dashed border-slate-100 pb-2 mb-1">
                              {!isEditingThisMenu ? (
                                <div className="flex justify-between items-center text-[10px]">
                                  <div className="flex-1 pr-2">
                                    <span className="font-bold text-slate-700 block">{menu.name}</span>
                                    <span className="text-indigo-600 font-black">{formatRp(menu.price)}</span>
                                  </div>
                                  <div className="flex gap-1 shrink-0">
                                    <button onClick={() => setEditingMenu(menu)} className="text-indigo-400 hover:text-indigo-600 p-1 bg-slate-50 rounded"><Edit size={10}/></button>
                                    <button onClick={() => handleDeleteMenu(menu.id)} className="text-red-400 hover:text-red-600 p-1 bg-slate-50 rounded"><Trash2 size={10}/></button>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-slate-50 p-2 rounded-lg space-y-1.5 border border-indigo-100">
                                  <input type="text" value={editingMenu.name} onChange={e=>setEditingMenu({...editingMenu, name: e.target.value})} className="w-full text-[10px] p-1.5 rounded border outline-none" placeholder="Nama Menu"/>
                                  <div className="flex gap-1.5">
                                    <input type="number" value={editingMenu.price} onChange={e=>setEditingMenu({...editingMenu, price: e.target.value})} className="w-1/3 text-[10px] p-1.5 rounded border outline-none" placeholder="Harga"/>
                                    <input type="text" value={editingMenu.desc} onChange={e=>setEditingMenu({...editingMenu, desc: e.target.value})} className="w-2/3 text-[10px] p-1.5 rounded border outline-none" placeholder="Deskripsi"/>
                                  </div>
                                  <div className="flex gap-1 mt-1 justify-end">
                                    <button onClick={submitEditMenu} className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-1 rounded">Update</button>
                                    <button onClick={()=>setEditingMenu(null)} className="bg-slate-300 text-slate-700 text-[9px] font-bold px-2 py-1 rounded">Batal</button>
                                  </div>
                                </div>
                              )}
                            </div>
                            );
                          })}
                          
                          {activeAddMenuRestoId === resto.id ? (
                            <div className="bg-slate-50 p-2.5 rounded-xl space-y-2 mt-2 border border-slate-200">
                              <input type="text" placeholder="Nama Menu Baru..." value={newMenu.name} onChange={e => setNewMenu({...newMenu, name: e.target.value})} className="w-full p-2 text-[10px] rounded-lg outline-none border focus:border-indigo-400" />
                              <div className="flex gap-2">
                                <input type="number" placeholder="Harga (Mis: 15000)" value={newMenu.price} onChange={e => setNewMenu({...newMenu, price: e.target.value})} className="w-1/3 p-2 text-[10px] rounded-lg outline-none border focus:border-indigo-400" />
                                <input type="text" placeholder="Deskripsi pendek" value={newMenu.desc} onChange={e => setNewMenu({...newMenu, desc: e.target.value})} className="w-2/3 p-2 text-[10px] rounded-lg outline-none border focus:border-indigo-400" />
                              </div>
                              <div className="flex gap-2 pt-1">
                                <button onClick={() => handleAddMenu(resto.id)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-1.5 rounded-lg transition">Simpan Menu Baru</button>
                                <button onClick={() => setActiveAddMenuRestoId(null)} className="w-1/3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold py-1.5 rounded-lg transition">Batal</button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => setActiveAddMenuRestoId(resto.id)} className="w-full mt-2 py-2 text-[10px] font-bold text-indigo-600 border border-indigo-200 border-dashed rounded-xl hover:bg-indigo-50 transition">
                              <Plus size={12} className="inline mr-1"/> Tambah Menu Baru
                            </button>
                          )}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Navigasi Keluar CFO */}
            <div className="bg-white p-3 border-t shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-20 shrink-0">
              <button onClick={handleLogout} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"><LogOut size={14}/>Keluar Sesi CFO</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}