import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Utensils, Wallet, Store, List, 
  Plus, Minus, Check, LogOut, 
  ChevronRight, Receipt, Clock,
  Sparkles, Star, MessageSquare, Copy,
  MapPin, Navigation, Compass, Award,
  Flame, Bell, History, Trophy, ArrowLeft,
  Image as ImageIcon, Trash2, Upload, Edit, X,
  Shield, CheckCircle, CreditCard, Coins, UserCheck, Users,
  Lock, Unlock, Delete
} from 'lucide-react';

// --- INTEGRASI CORE CLOUD DATABASE ---
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

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
  { id: "mock1", userName: "Mbak Sarah (Finance)", total: 39000, date: 'Hari Ini', items: [{ menuId: "menu1", name: 'Nasi Telur Dadar + Orek Tempe', price: 15000, qty: 1, notes: "" }, { menuId: "menu4", name: 'Paket Geprek Lava Mozzarella', price: 25000, qty: 1, notes: "" }], status: 'Selesai', timestamp: Date.now(), paymentMethod: 'cash', cashAmount: 50000, cfoReceivedAmount: 50000, cfoAdminNotes: "Lunas pas" }
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
  const [currentScreen, setCurrentScreen] = useState('onboarding'); // onboarding | login | pin_entry | user_dashboard | admin_dashboard | restaurant_detail
  const [userTab, setUserTab] = useState('explore');
  const [leaderboardSubTab, setLeaderboardSubTab] = useState('rank');
  
  const [cfoMainTab, setCfoMainTab] = useState('rekap'); 
  const [adminViewTab, setAdminViewTab] = useState('orang');
  
  const [currentUser, setCurrentUser] = useState(null);
  const [usersList, setUsersList] = useState([]); // Master akun karyawan terdaftar
  
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

  // States checkout baru
  const [paymentMethod, setPaymentMethod] = useState('transfer'); 
  const [cashAmountInput, setCashAmountInput] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // States Registrasi Baru (DIREDUKSI: Divisi dihapus!)
  const [isRegistering, setIsRegistering] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', phone: '' });

  // States PIN CFO
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // States Rekonsiliasi CFO
  const [reconcileAmounts, setReconcileAmounts] = useState({});
  const [reconcileNotes, setReconcileNotes] = useState({});
  
  const [session, setSession] = useState({
    isOpen: true,
    openRestoIds: ["resto1", "resto2", "resto3"],
    endTime: '11:45',
    bankAccount: 'BCA 872-019-2831 a.n Joko Susilo (CFO)',
    rejectMessage: 'Waduh petualangan kuliner hari ini sudah ditutup! 😭 Hubungi CFO jika darurat!',
    allowTransfer: true 
  });

  // --- 📡 SINKRONISASI DATABASE REALTIME INSTAN ---
  useEffect(() => {
    const sessionRef = doc(db, 'artifacts', appId, 'public', 'data', 'session', 'current');
    const ordersRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
    const restosRef = collection(db, 'artifacts', appId, 'public', 'data', 'restaurants');
    const menusRef = collection(db, 'artifacts', appId, 'public', 'data', 'menus');
    const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'users');

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

    const unsubUsers = onSnapshot(usersRef, (snap) => {
      const list = []; snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setUsersList(list);
    });

    return () => { unsubSession(); unsubOrders(); unsubRestos(); unsubMenus(); unsubUsers(); };
  }, []);

  // Set default payment method based on CFO configuration
  useEffect(() => {
    if (!session.allowTransfer) {
      setPaymentMethod('cash');
    }
  }, [session]);


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
  
  const handleLogin = async (phoneOrId) => {
    if (!phoneOrId) return alert("Masukkan Nomor Handphone!");
    
    // Alihkan ke halaman input PIN jika mendeteksi bypass admin
    if (phoneOrId === '0000') {
      setPinInput('');
      setPinError(false);
      setCurrentScreen('pin_entry');
      return;
    }

    // Cari di daftar karyawan terdaftar
    const matchedUser = usersList.find(u => u.phone === phoneOrId || u.name.toLowerCase() === phoneOrId.toLowerCase());
    
    if (matchedUser) {
      setCurrentUser({ ...matchedUser, role: 'user' });
      setCurrentScreen('user_dashboard');
    } else {
      // Tawarkan Registrasi Resmi (DIREDUKSI: Tanpa Divisi)
      setRegForm({ name: '', phone: phoneOrId });
      setIsRegistering(true);
    }
  };

  // Verifikasi PIN CFO Admin
  const handleVerifyCFOPin = (num) => {
    setPinError(false);
    if (pinInput.length >= 4) return;
    
    const nextPin = pinInput + num;
    setPinInput(nextPin);

    if (nextPin.length === 4) {
      // PIN CFO default "0000"
      if (nextPin === '0000') {
        setCurrentUser({ name: 'Chief Food Officer (CFO)', phone: '0000', role: 'admin' });
        setCurrentScreen('admin_dashboard');
        setPinInput('');
      } else {
        setTimeout(() => {
          setPinError(true);
          setPinInput('');
        }, 200);
      }
    }
  };

  const handleRegisterEmployee = async () => {
    if (!regForm.name || !regForm.phone) return alert("Harap isi nama lengkap Anda!");
    
    try {
      const newUserDoc = {
        name: regForm.name,
        phone: regForm.phone,
        timestamp: Date.now()
      };
      const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'users'), newUserDoc);
      setCurrentUser({ id: docRef.id, ...newUserDoc, role: 'user' });
      setIsRegistering(false);
      setCurrentScreen('user_dashboard');
    } catch (e) {
      console.error(e);
      alert("Registrasi Gagal, coba lagi.");
    }
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
    const cashHanded = Number(cashAmountInput);
    if (paymentMethod === 'cash') {
      if (!cashAmountInput || isNaN(cashHanded) || cashHanded < cartTotal) {
        return alert(`Nominal uang cash fisik wajib diisi & minimal ${formatRp(cartTotal)}!`);
      }
    }

    const newOrder = {
      userName: currentUser?.name || 'User',
      items: cart,
      total: cartTotal,
      date: 'Hari Ini',
      status: 'Menunggu Pembayaran',
      paymentMethod: paymentMethod,
      cashAmount: paymentMethod === 'cash' ? cashHanded : 0,
      notes: orderNotes,
      timestamp: Date.now(),
      cfoReceivedAmount: 0,
      cfoAdminNotes: ""
    };

    try { 
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), newOrder); 
    } catch (error) { 
      console.error(error); 
    }
    
    setCart([]); 
    setCashAmountInput('');
    setOrderNotes('');
    setCurrentScreen('user_dashboard'); 
    setUserTab('my_orders');
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId), { status: newStatus });
  };

  const handleReconcileOrder = async (orderId) => {
    const recAmt = Number(reconcileAmounts[orderId]) || 0;
    const recNote = reconcileNotes[orderId] || "";
    
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId), {
        cfoReceivedAmount: recAmt,
        cfoAdminNotes: recNote
      });
      alert("Rekonsiliasi Keuangan Disimpan! 🎉");
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan rekonsiliasi.");
    }
  };

  const handleToggleLapak = async () => {
    const updated = { ...session, isOpen: !session.isOpen };
    setSession(updated);
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'session', 'current'), updated);
  };

  const handleToggleAllowTransfer = async () => {
    const updated = { ...session, allowTransfer: !session.allowTransfer };
    setSession(updated);
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'session', 'current'), updated);
  };

  const handleSaveBankAccount = async (newAcc) => {
    const updated = { ...session, bankAccount: newAcc };
    setSession(updated);
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'session', 'current'), updated);
    alert("Informasi Rekening Berhasil Diperbarui!");
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

  // Kalkulasi total tagihan hutang per karyawan bulan ini
  const userDebts = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      if (!o) return;
      const uName = o.userName;
      const totalCost = Number(o.total) || 0;
      const received = Number(o.cfoReceivedAmount) || 0;
      const debt = Math.max(0, totalCost - received);
      
      map[uName] = (map[uName] || 0) + debt;
    });
    return map;
  }, [orders]);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-violet-100 via-purple-50 to-amber-50 flex flex-col justify-center items-center font-sans p-0 sm:p-4 text-slate-800 antialiased">
      
      {/* Container Full Adaptif Tanpa Frame Bezel Palsu */}
      <div className="w-full sm:max-w-md h-[100dvh] sm:h-[85vh] sm:min-h-[780px] sm:max-h-[920px] bg-white flex flex-col relative sm:shadow-[0_24px_70px_rgba(109,40,217,0.15)] sm:rounded-[40px] sm:border-8 sm:border-violet-600 overflow-hidden transition-all duration-300">
        
        {/* SCREEN 1: ONBOARDING (KidZo Theme) */}
        {currentScreen === 'onboarding' && (
          <div className="flex-1 flex flex-col justify-between p-8 pt-12 bg-gradient-to-b from-violet-100 via-white to-purple-50">
            <div className="flex justify-between items-center shrink-0">
              <span className="text-sm font-black text-violet-600 bg-white px-3.5 py-1.5 rounded-full shadow-sm border border-violet-100">⭐ Nimak</span>
              <span className="text-[10px] text-violet-600 font-extrabold bg-violet-100 px-3 py-1 rounded-full uppercase tracking-wider">v1.6 PROD</span>
            </div>

            <div className="text-center space-y-6 my-auto">
              <div className="relative inline-block">
                <div className="w-44 h-44 rounded-[44px] bg-gradient-to-tr from-violet-400 to-indigo-300 flex items-center justify-center shadow-[0_12px_30px_rgba(109,40,217,0.25)] mx-auto animate-pulse">
                  <span className="text-8xl">🍱</span>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-amber-400 text-slate-900 text-xs font-black px-4 py-2 rounded-2xl shadow-lg border-2 border-white transform rotate-12">
                  YUMMY! 😋
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                  Makan Siang <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                    Satu Komando
                  </span>
                </h1>
                <p className="text-xs text-slate-500 max-w-[280px] mx-auto leading-relaxed font-medium">
                  Gabung misi kuliner harian kantor dengan asyik, raih rekor sultan, & bayar gampang tanpa drama!
                </p>
              </div>
            </div>
            
            <div className="space-y-4 shrink-0">
              <button 
                onClick={handleStartAdventure} 
                className="w-full bg-violet-600 hover:bg-violet-700 active:scale-[0.98] transition duration-200 text-white font-black py-4.5 rounded-3xl shadow-[0_8px_25px_rgba(109,40,217,0.35)] flex justify-between items-center px-8 text-sm"
              >
                <span>Mulai Petualangan Makan</span>
                <ChevronRight size={20} className="stroke-[3]" />
              </button>
              
              <div className="flex justify-between items-center px-2">
                <span 
                  onClick={() => {
                    setPinInput('');
                    setPinError(false);
                    setCurrentScreen('pin_entry');
                  }} 
                  className="text-xs font-bold text-violet-600 hover:text-violet-800 cursor-pointer underline underline-offset-4 flex items-center gap-1.5"
                >
                  <Lock size={12}/> CFO Portal (Admin)
                </span>
                <span className="text-[10px] text-slate-400 font-extrabold">BY CHIEF FOOD OFFICER</span>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: LOGIN & REGISTRASI TERPADU */}
        {currentScreen === 'login' && (
          <div className="flex-1 flex flex-col justify-between p-8 pt-12 bg-gradient-to-b from-amber-50 via-white to-violet-50">
            <button onClick={() => { setIsRegistering(false); setCurrentScreen('onboarding'); }} className="w-10 h-10 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 active:scale-95 transition self-start">
              <ArrowLeft size={18} className="text-slate-700 stroke-[3]" />
            </button>

            {!isRegistering ? (
              <div className="my-auto space-y-6">
                <div>
                  <span className="text-xs font-black text-amber-700 bg-amber-100 px-3.5 py-1.5 rounded-full uppercase tracking-wider">Level 1: Lapar</span>
                  <h2 className="text-3xl font-black text-slate-900 mt-3 leading-tight">Siapa Nama <br/>Karaktermu?</h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">Masukkan Nomor HP atau ID Karyawan terdaftar untuk sinkronisasi tagihan.</p>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-violet-100 shadow-[0_10px_30px_rgba(109,40,217,0.06)] space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Kunci Akses Unik</label>
                    <input 
                      type="text" 
                      placeholder="Masukkan No. HP Anda..." 
                      id="loginInput" 
                      className="w-full bg-slate-50 border-2 border-slate-100 focus:border-violet-500 focus:bg-white p-4 rounded-2xl text-xs font-black focus:outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => handleLogin(document.getElementById('loginInput')?.value)} 
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black py-4 rounded-2xl text-xs shadow-lg shadow-violet-500/20 active:scale-95 transition"
                >
                  Masuk ke Dashboard 🚀
                </button>
              </div>
            ) : (
              // --- FORM REGISTRASI RESMI KARYAWAN (DIREDUKSI: Divisi dihapus!) ---
              <div className="my-auto space-y-6">
                <div>
                  <span className="text-xs font-black text-violet-700 bg-violet-100 px-3.5 py-1.5 rounded-full uppercase tracking-wider">Karyawan Baru</span>
                  <h2 className="text-2xl font-black text-slate-900 mt-3 leading-tight">Daftarkan Akun Nimak Resmi</h2>
                  <p className="text-xs text-slate-500 font-medium">Data Anda diperlukan agar CFO bisa merekap tagihan belanja makan siang dengan benar.</p>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-violet-100 shadow-md space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Nama Lengkap (Sesuai ID)</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Mas Wahyu Desainer" 
                      value={regForm.name} 
                      onChange={e => setRegForm({...regForm, name: e.target.value})} 
                      className="w-full bg-slate-50 border-2 border-slate-100 focus:border-violet-500 focus:bg-white p-3.5 rounded-xl text-xs font-bold focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Nomor Handphone / ID</label>
                    <input 
                      type="text" 
                      disabled 
                      value={regForm.phone} 
                      className="w-full bg-slate-100 border-2 border-slate-100 p-3.5 rounded-xl text-xs font-bold text-slate-500"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleRegisterEmployee} 
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition"
                >
                  Selesaikan Registrasi & Masuk 🎓
                </button>
              </div>
            )}
          </div>
        )}

        {/* SCREEN CFO PIN_ENTRY: LAYAR PIN INTEGRAL INTERAKTIF (PERLINDUNGAN PORTAL) */}
        {currentScreen === 'pin_entry' && (
          <div className="flex-1 flex flex-col justify-between p-8 pt-12 bg-gradient-to-b from-violet-100 via-white to-purple-50">
            <button onClick={() => setCurrentScreen('onboarding')} className="w-10 h-10 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 active:scale-95 transition self-start">
              <ArrowLeft size={18} className="text-slate-700 stroke-[3]" />
            </button>

            <div className="my-auto flex flex-col items-center space-y-6">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-2">
                  <Lock size={20} className="stroke-[2.5]" />
                </div>
                <h2 className="text-xl font-black text-slate-900">Verifikasi Otoritas CFO</h2>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Masukkan 4-digit PIN Keamanan Anda</p>
                <p className="text-[10px] text-slate-400 italic">Default PIN: 0000</p>
              </div>

              {/* PIN Bulatan Visual */}
              <div className={`flex justify-center gap-4.5 py-4 ${pinError ? 'animate-bounce' : ''}`}>
                {[0, 1, 2, 3].map((idx) => (
                  <div 
                    key={idx} 
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${pinError ? 'border-red-500 bg-red-100' : pinInput.length > idx ? 'border-violet-600 bg-violet-600 scale-110 shadow-sm shadow-violet-500/50' : 'border-slate-300 bg-transparent'}`}
                  ></div>
                ))}
              </div>

              {pinError && (
                <p className="text-xs text-red-500 font-black tracking-wide animate-pulse">⚠️ PIN Salah! Coba lagi.</p>
              )}

              {/* Numpad CFO */}
              <div className="grid grid-cols-3 gap-3.5 w-full max-w-[280px]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button 
                    key={num}
                    onClick={() => handleVerifyCFOPin(num.toString())}
                    className="h-14 bg-white border-2 border-slate-100 hover:border-violet-500 hover:bg-violet-50 rounded-2xl text-lg font-black text-slate-800 transition active:scale-95 shadow-sm"
                  >
                    {num}
                  </button>
                ))}
                <button 
                  onClick={() => setPinInput('')}
                  className="h-14 text-xs font-black text-red-500 hover:text-red-700 transition active:scale-95"
                >
                  CLEAR
                </button>
                <button 
                  onClick={() => handleVerifyCFOPin('0')}
                  className="h-14 bg-white border-2 border-slate-100 hover:border-violet-500 hover:bg-violet-50 rounded-2xl text-lg font-black text-slate-800 transition active:scale-95 shadow-sm"
                >
                  0
                </button>
                <button 
                  onClick={() => setPinInput(pinInput.substring(0, pinInput.length - 1))}
                  className="h-14 text-slate-500 hover:text-slate-800 flex items-center justify-center transition active:scale-95"
                >
                  <Delete size={20} />
                </button>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Protected by Nimak Security Gate
            </div>
          </div>
        )}

        {/* SCREEN 3: USER DASHBOARD (Responsive, No restricted scroll) */}
        {currentScreen === 'user_dashboard' && (
          <div className="flex-1 flex flex-col min-h-0 h-full bg-[#F7F8FC]">
            
            {/* Header Profil */}
            <div className="px-5 py-4 flex justify-between items-center bg-white border-b border-slate-100 shrink-0 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-400 flex items-center justify-center text-base border-2 border-white shadow-md text-white font-black">
                  {currentUser?.name?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-black text-xs text-slate-800 leading-tight">{currentUser?.name}</h4>
                  <p className="text-[8px] text-violet-600 font-bold">Nimak Adventurer</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-8 h-8 bg-red-50 text-red-500 hover:bg-red-100 rounded-full flex items-center justify-center transition active:scale-95"><LogOut size={14}/></button>
            </div>

            {/* TAB CONTENT: EXPLORE (Misi Aktif) */}
            {userTab === 'explore' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5 pb-28 min-h-0">
                <div className="bg-gradient-to-r from-violet-600 to-indigo-800 text-white p-5 rounded-[28px] shadow-[0_8px_20px_rgba(109,40,217,0.2)] relative overflow-hidden">
                  <Flame className="absolute -right-2 -bottom-2 text-indigo-500 opacity-20" size={80} />
                  <span className="text-[10px] font-black block tracking-widest text-violet-200">MISI AKTIF HARI INI</span>
                  <p className="text-xs text-amber-300 font-extrabold mt-1.5 flex items-center gap-1.5"><Clock size={14}/> Sesi Pemesanan s/d {session?.endTime || '11:45'} WIB</p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Daftar Restoran Tersedia</h3>
                  {openRestaurants.length === 0 && (
                    <div className="bg-white border-2 border-dashed border-slate-200 p-8 rounded-[32px] text-center text-slate-400 mt-4 shadow-sm">
                      <Store className="mx-auto mb-3 opacity-50 text-violet-500" size={36} />
                      <p className="text-xs font-black text-slate-700">Lapak Sedang Tutup</p>
                      <p className="text-[10px] text-slate-400 mt-1">Silakan hubungi CFO untuk membuka sesi makan siang hari ini.</p>
                    </div>
                  )}
                  {openRestaurants.map(r => (
                    <div key={r.id} className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-[0_8px_16px_rgba(0,0,0,0.02)] relative group hover:shadow-md transition duration-200">
                      {r.tag && <span className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-black text-[9px] py-1.5 px-3.5 rounded-bl-2xl z-10">{r.tag}</span>}
                      <img src={r.image || 'https://via.placeholder.com/400'} className="w-full h-32 object-cover brightness-95" alt={r.name}/>
                      <div className="p-5 flex justify-between items-center">
                        <div className="space-y-1">
                          <h4 className="font-black text-sm text-slate-800">{r.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1"><MapPin size={10}/> {r.distance} • {r.category}</p>
                        </div>
                        <button onClick={() => viewRestoDetail(r)} className="bg-violet-600 hover:bg-violet-700 text-white font-black px-4 py-2.5 rounded-2xl text-[10px] shadow-md shadow-violet-500/10 transition active:scale-95">Pilih Menu</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: TIKET SAYA */}
            {userTab === 'my_orders' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-28 min-h-0">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Karcis Pesanan Aktif Anda</h3>
                {orders.filter(o => o && o.userName === currentUser?.name && o.date === 'Hari Ini').length === 0 && (
                   <div className="bg-white border-2 border-dashed border-slate-150 p-8 rounded-[32px] text-center text-slate-400 mt-4">
                     <Receipt className="mx-auto mb-3 opacity-40 text-violet-500" size={32} />
                     <p className="text-xs font-bold text-slate-700">Belum ada pesanan aktif.</p>
                     <button onClick={() => setUserTab('explore')} className="mt-4 bg-violet-100 hover:bg-violet-200 text-violet-700 font-black text-[10px] px-4 py-2.5 rounded-xl transition">Pesan Makan Siang Sekarang</button>
                   </div>
                )}
                {orders.filter(o => o && o.userName === currentUser?.name && o.date === 'Hari Ini').map(order => (
                  <div key={order.id} className="bg-white rounded-[32px] p-5 border border-slate-100 shadow-md space-y-4">
                    <div className="flex justify-between items-center border-b pb-3 border-slate-100">
                      <div>
                        <span className="font-black text-xs text-slate-800">{order.userName}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[8px] bg-slate-100 text-slate-500 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">{order.paymentMethod === 'transfer' ? '💳 Transfer' : '💵 Tunai'}</span>
                          {order.notes && <span className="text-[9px] text-amber-600 font-semibold italic">💬 "{order.notes}"</span>}
                        </div>
                      </div>
                      <span className="bg-amber-100 text-amber-700 border border-amber-200 text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">{order.status}</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-600 font-bold">
                      {order.items && order.items.map((i, idx) => <div key={idx} className="flex justify-between"><span>{i?.qty}x {i?.name}</span><span className="text-slate-800">{formatRp((i?.price || 0) * (i?.qty || 0))}</span></div>)}
                    </div>
                    <div className="border-t pt-3 border-slate-100 flex justify-between font-black text-violet-600 text-sm">
                      <span>TOTAL BILL</span>
                      <span>{formatRp(order.total)}</span>
                    </div>

                    {/* Catatan Kembalian jika Tunai */}
                    {order.paymentMethod === 'cash' && (
                      <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-xl text-[10px] font-semibold text-amber-800 flex justify-between">
                        <span>Uang Fisik Diberikan Karyawan:</span>
                        <span>{formatRp(order.cashAmount)}</span>
                      </div>
                    )}

                    <div className="bg-violet-50/50 p-3 rounded-2xl text-[9px] font-bold text-center border border-violet-100 text-violet-700 flex justify-between items-center">
                      <span className="font-mono">Bank CFO: {session?.bankAccount}</span>
                      <button onClick={() => { navigator.clipboard.writeText(session?.bankAccount); alert("Nomor rekening CFO disalin!"); }} className="p-1 hover:bg-violet-100 rounded-lg"><Copy size={11}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: SULTAN LEADERBOARD */}
            {userTab === 'leaderboard' && (
              <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
                <div className="px-5 pt-3 flex gap-2 shrink-0">
                  <button onClick={() => setLeaderboardSubTab('rank')} className={`flex-1 py-2 text-[10px] font-black rounded-xl border transition ${leaderboardSubTab === 'rank' ? 'bg-violet-600 text-white border-violet-600 shadow-sm' : 'bg-white text-slate-500'}`}>🏆 Peringkat</button>
                  <button onClick={() => setLeaderboardSubTab('badges')} className={`flex-1 py-2 text-[10px] font-black rounded-xl border transition ${leaderboardSubTab === 'badges' ? 'bg-violet-600 text-white border-violet-600 shadow-sm' : 'bg-white text-slate-500'}`}>🏅 Gelar Kantor</button>
                </div>
                
                {leaderboardSubTab === 'rank' && (
                  <div className="flex-1 overflow-y-auto p-5 space-y-2 pb-28 min-h-0">
                    {Object.entries(orders.reduce((acc, o) => {
                      if (!o) return acc;
                      const name = o.userName || 'User';
                      const total = Number(o.total) || 0;
                      return { ...acc, [name]: (acc[name] || 0) + total };
                    }, {})).sort((a,b)=>b[1]-a[1]).map(([name, total], i) => (
                      <div key={i} className="bg-white p-3.5 rounded-2xl border flex justify-between items-center text-xs shadow-sm hover:border-violet-200 transition">
                        <span className="font-black text-violet-600">#{i+1} <span className="text-slate-800 ml-1">{name}</span></span>
                        <span className="font-black text-slate-800">{formatRp(total)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {leaderboardSubTab === 'badges' && (
                  <div className="flex-1 overflow-y-auto p-5 space-y-2.5 pb-28 min-h-0">
                    {[
                      { t: "The Mukbang Master 👑", d: "Memesan > 3 menu dalam 1 order", w: dynamicBadges.mukbangMaster?.name || '-' },
                      { t: "Selera Elit 🌾", d: "Total pesanan termahal sebulan", w: dynamicBadges.seleraElit?.name || '-' },
                      { t: "Black Hole Belly 🌌", d: "Porsi terbanyak terkonsumsi", w: dynamicBadges.blackHoleBelly?.name || '-' },
                      { t: "The Avengers Team 🛡️", d: "Pesan porsi jumbo buat satu tim", w: dynamicBadges.avengersTeam?.name || '-' },
                      { t: "CEO of Flexing Food 💎", d: "Pemesan termahal hari ini", w: dynamicBadges.ceoFlexing?.userName || '-' },
                      { t: "The Last Survivor ⏱️", d: "Pemesan terakhir paling mepet", w: dynamicBadges.lastSurvivor?.userName || '-' },
                      { t: "Diet Mulai Besok 🥗", d: "Pemesan paling awal hari ini", w: dynamicBadges.dietBesok?.userName || '-' }
                    ].map((b, i) => (
                      <div key={i} className="bg-white p-4 rounded-3xl border text-[11px] space-y-1 shadow-sm hover:border-violet-200 transition">
                        <h4 className="font-black text-slate-800">{b.t}</h4>
                        <p className="text-[10px] text-slate-400 font-medium leading-normal">{b.d}</p>
                        <p className="text-[10px] text-violet-600 font-black pt-1">Penyandang: <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg">{b.w}</span></p>
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
                  <div key={menu.id} className={`bg-white p-4 rounded-3xl border flex justify-between items-center text-xs shadow-sm transition ${qty > 0 ? 'border-violet-400 ring-2 ring-violet-500/10' : 'hover:border-slate-300'}`}>
                    <div className="max-w-[65%]">
                      <div className="flex items-center gap-1.5 mb-1"><h4 className="font-bold text-slate-800 leading-tight">{menu.name}</h4>{menu.tag && <span className="text-[7px] bg-violet-100 text-violet-700 px-1.5 rounded font-bold whitespace-nowrap">{menu.tag}</span>}</div>
                      <p className="text-[9px] text-slate-400 line-clamp-2 leading-relaxed">{menu.desc}</p>
                      <p className="text-violet-600 font-black mt-1.5">{formatRp(menu.price)}</p>
                    </div>
                    {qty === 0 ? <button onClick={() => handleUpdateCart(menu, 1)} className="bg-violet-50 hover:bg-violet-100 text-violet-600 font-bold px-3 py-1.5 rounded-xl shrink-0 transition">Pilih</button> :
                    <div className="flex items-center gap-2 bg-slate-50 border p-1 rounded-xl shrink-0"><button onClick={() => handleUpdateCart(menu, -1)} className="font-bold px-2 py-1 text-slate-600 hover:bg-white rounded">-</button><span className="font-bold w-3 text-center">{qty}</span><button onClick={() => handleUpdateCart(menu, 1)} className="font-bold px-2 py-1 text-slate-600 hover:bg-white rounded">+</button></div>}
                  </div>
                );
              })}
            </div>
            
            {cartItemsCount > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col gap-4 z-40">
                {/* --- SEKSI METODE BAYAR & INPUT CASH --- */}
                <div className="px-5 pt-4 space-y-3">
                  <div className="flex gap-2">
                    {/* Pilih Transfer (Hanya jika diizinkan CFO) */}
                    {session.allowTransfer && (
                      <button 
                        onClick={() => setPaymentMethod('transfer')}
                        className={`flex-1 py-3 px-4 rounded-2xl border-2 text-xs font-black flex items-center justify-center gap-2 transition ${paymentMethod === 'transfer' ? 'border-violet-600 bg-violet-50 text-violet-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                      >
                        <CreditCard size={14}/> Transfer Bank
                      </button>
                    )}
                    <button 
                      onClick={() => setPaymentMethod('cash')}
                      className={`flex-1 py-3 px-4 rounded-2xl border-2 text-xs font-black flex items-center justify-center gap-2 transition ${paymentMethod === 'cash' ? 'border-violet-600 bg-violet-50 text-violet-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
                    >
                      <Coins size={14}/> Uang Tunai (Cash)
                    </button>
                  </div>

                  {/* Input Jumlah Uang Fisik jika memilih Cash */}
                  {paymentMethod === 'cash' && (
                    <div className="space-y-1 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-amber-700 uppercase">Fisik Cash yang diberikan</label>
                        <span className="text-[9px] text-slate-400 font-bold">Harus &ge; {formatRp(cartTotal)}</span>
                      </div>
                      <input 
                        type="number" 
                        placeholder="Contoh: 20000 atau 50000"
                        value={cashAmountInput}
                        onChange={e => setCashAmountInput(e.target.value)}
                        className="w-full bg-white border-2 border-amber-200 p-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-400 transition"
                      />
                      {Number(cashAmountInput) >= cartTotal && (
                        <p className="text-[10px] font-bold text-emerald-600 mt-1 flex justify-between">
                          <span>Kembalian CFO ke Anda:</span>
                          <span>{formatRp(Number(cashAmountInput) - cartTotal)}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Input Catatan Pesanan */}
                  <input 
                    type="text" 
                    placeholder="Tulis catatan order (Mis: Kuah koya pisah, no sendok)..." 
                    value={orderNotes}
                    onChange={e => setOrderNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold focus:outline-none focus:border-violet-500 transition"
                  />
                </div>

                <div className="flex justify-between items-center p-5 border-t bg-slate-50/50">
                  <div><span className="text-[9px] text-slate-400 block font-bold">TOTAL BILL</span><span className="text-base font-black text-violet-600">{formatRp(cartTotal)}</span></div>
                  <button onClick={handleCheckout} className="bg-violet-600 hover:bg-violet-700 text-white font-black py-3.5 px-6 rounded-2xl text-xs shadow-lg shadow-violet-500/30 active:scale-95 transition flex items-center gap-2">Pesan & Kirim <Check size={14}/></button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SCREEN 5: CFO ADMIN PANEL (SANGAT COMPLIANT DENGAN PRD) */}
        {currentScreen === 'admin_dashboard' && (
          <div className="flex-1 flex flex-col min-h-0 h-full bg-[#F7F8FC]">
            
            {/* Header Menu CFO */}
            <div className="bg-slate-900 text-white p-4 flex flex-col gap-3 shrink-0 shadow-md z-10">
              <div className="flex justify-between items-center">
                <h1 className="font-black text-xs flex items-center gap-1 text-indigo-300"><Shield size={14}/> CFO Panel Master</h1>
                <button onClick={() => { setCurrentScreen('user_dashboard'); setUserTab('explore'); }} className="text-[9px] font-bold bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-200 transition">Ke User Mode</button>
              </div>
              
              {/* TOP TABS: Rekap Order, Buku Kas, Kelola Master */}
              <div className="flex bg-slate-800 p-1 rounded-xl">
                <button onClick={() => setCfoMainTab('rekap')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${cfoMainTab === 'rekap' ? 'bg-violet-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>📊 Rekap Order</button>
                <button onClick={() => setCfoMainTab('users')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${cfoMainTab === 'users' ? 'bg-violet-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>👥 Buku Tagihan</button>
                <button onClick={() => setCfoMainTab('kelola')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${cfoMainTab === 'kelola' ? 'bg-violet-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>🛠️ Master Data</button>
              </div>
            </div>
            
            {/* Scrollable Container Panel Admin */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28 min-h-0">
              
              {/* --- 1. VIEW REKAP ORDER --- */}
              {cfoMainTab === 'rekap' && (
                <>
                  <div className="flex flex-col gap-3 p-4 bg-white border border-indigo-50 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-center">
                      <div><span className="font-bold text-xs text-slate-800 block">Sesi Order Global</span><span className="text-[9px] text-slate-400">Terima pesanan karyawan?</span></div>
                      <div onClick={handleToggleLapak} className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition duration-300 ${session?.isOpen ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${session?.isOpen ? 'translate-x-6' : ''}`}></div>
                      </div>
                    </div>

                    <div className="border-t pt-3 flex justify-between items-center">
                      <div><span className="font-bold text-xs text-slate-800 block">Buka Gerbang Transfer</span><span className="text-[9px] text-slate-400">Jika mati, hanya Cash Only</span></div>
                      <div onClick={handleToggleAllowTransfer} className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition duration-300 ${session?.allowTransfer ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${session?.allowTransfer ? 'translate-x-6' : ''}`}></div>
                      </div>
                    </div>

                    {session?.allowTransfer && (
                      <div className="border-t pt-3 space-y-1.5">
                        <label className="block text-[9px] font-black text-slate-400 uppercase">Rekening Transfer CFO</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Contoh: BCA 123456 a/n Joko" 
                            id="bankAccInput"
                            defaultValue={session?.bankAccount}
                            className="flex-1 bg-slate-50 border p-2 rounded-xl text-xs font-bold outline-none"
                          />
                          <button onClick={() => handleSaveBankAccount(document.getElementById('bankAccInput')?.value)} className="bg-violet-600 text-white font-bold px-3 py-2 rounded-xl text-[10px] whitespace-nowrap">Update</button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex bg-slate-200 p-1 rounded-xl border">
                    <button onClick={() => setAdminViewTab('orang')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition ${adminViewTab === 'orang' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>👤 Per Orang</button>
                    <button onClick={() => setAdminViewTab('resto')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition ${adminViewTab === 'resto' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>🏢 Per Resto</button>
                    <button onClick={() => setAdminViewTab('menu')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition ${adminViewTab === 'menu' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>📋 Per Menu</button>
                  </div>

                  {/* View 1: Per Orang (Lengkap dengan Rekonsiliasi Cash & Notes Admin) */}
                  {adminViewTab === 'orang' && orders.filter(o => o && o.date === 'Hari Ini').map(o => (
                    <div key={o.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                      <div className="flex justify-between font-bold border-b border-slate-100 pb-2">
                        <div>
                          <span className="text-slate-900">{o.userName}</span>
                        </div>
                        <span className="text-violet-600 font-black">{formatRp(o.total)}</span>
                      </div>
                      
                      <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{o.items ? o.items.map(i => `${i?.qty || 0}x ${i?.name || 'Menu'}`).join(', ') : '-'}</p>
                      
                      {o.notes && (
                        <p className="text-[9px] text-amber-600 bg-amber-50 p-2 rounded-xl font-bold">💬 Karyawan Note: "{o.notes}"</p>
                      )}

                      {/* --- FORM REKONSILIASI KEUANGAN --- */}
                      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Konfirmasi Pembayaran ({o.paymentMethod === 'transfer' ? '💳 Transfer' : '💵 Tunai'})</p>
                        
                        {o.paymentMethod === 'cash' && (
                          <p className="text-[9px] text-slate-500 font-bold">Karyawan membawa cash: <strong className="text-slate-800">{formatRp(o.cashAmount)}</strong> (Kembalian: {formatRp((o.cashAmount || 0) - o.total)})</p>
                        )}

                        <div className="flex gap-2">
                          <div className="flex-1">
                            <span className="text-[8px] font-bold text-slate-400">Total Diterima CFO</span>
                            <input 
                              type="number" 
                              placeholder="Fisik Diterima..."
                              defaultValue={o.cfoReceivedAmount || ''}
                              onChange={e => setReconcileAmounts({...reconcileAmounts, [o.id]: e.target.value})}
                              className="w-full bg-white border p-1.5 rounded-lg text-[10px] font-bold outline-none focus:border-violet-500"
                            />
                          </div>
                          <div className="flex-1">
                            <span className="text-[8px] font-bold text-slate-400">Catatan Admin</span>
                            <input 
                              type="text" 
                              placeholder="Mis: Lunas / Kurang"
                              defaultValue={o.cfoAdminNotes || ''}
                              onChange={e => setReconcileNotes({...reconcileNotes, [o.id]: e.target.value})}
                              className="w-full bg-white border p-1.5 rounded-lg text-[10px] outline-none focus:border-violet-500"
                            />
                          </div>
                        </div>

                        <button 
                          onClick={() => handleReconcileOrder(o.id)}
                          className="w-full bg-slate-900 text-white text-[9px] font-black py-1.5 rounded-xl hover:bg-slate-800 transition"
                        >
                          Simpan & Cocokkan Uang Diterima
                        </button>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                        <button onClick={() => handleUpdateOrderStatus(o.id, 'Diproses CFO')} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[9px] px-3 py-1.5 rounded-lg transition">Mulai Proses</button>
                        <button onClick={() => handleUpdateOrderStatus(o.id, 'Selesai')} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[9px] px-3 py-1.5 rounded-lg transition">Selesaikan</button>
                      </div>
                    </div>
                  ))}

                  {/* View 2: Per Resto */}
                  {adminViewTab === 'resto' && ordersByResto.map((r, i) => (
                    <div key={i} className="bg-white p-3.5 rounded-2xl border text-xs shadow-sm space-y-2">
                      <div className="flex justify-between font-black border-b border-slate-100 pb-1.5 text-slate-800"><span>🏢 {r.restoName}</span><span className="text-indigo-600">{formatRp(r.totalCost)}</span></div>
                      {r.itemsList && r.itemsList.map((it, idx) => <p key={idx} className="text-[10px] text-slate-600 font-medium">• {it.qty}x {it.itemName} <span className="text-indigo-500 font-bold">({it.userName})</span></p>)}
                    </div>
                  ))}

                  {/* View 3: Per Menu */}
                  {adminViewTab === 'menu' && (
                    <div className="bg-white rounded-2xl border shadow-sm divide-y divide-slate-100 text-xs">
                      {ordersByMenu.map((m, i) => <div key={i} className="p-3.5 flex justify-between items-center font-bold text-slate-700"><span>{m.menuName}</span><span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-[10px]">{m.qty} Porsi</span></div>)}
                    </div>
                  )}
                </>
              )}

              {/* --- 2. TAB: DAFTAR KARYAWAN & TAGIHAN (PRD Compliant) --- */}
              {cfoMainTab === 'users' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-3xl border shadow-sm space-y-1.5">
                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5"><Users size={16} className="text-violet-500"/> Buku Kas Tagihan Karyawan</h3>
                    <p className="text-[10px] text-slate-400">Total akumulasi sisa tagihan terutang makan siang yang wajib ditagih CFO.</p>
                  </div>

                  <div className="space-y-3">
                    {usersList.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-10 bg-white border rounded-2xl">Belum ada karyawan terdaftar.</p>
                    ) : (
                      usersList.map(u => {
                        const debt = userDebts[u.name] || 0;
                        return (
                          <div key={u.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
                            <div>
                              <h4 className="font-black text-xs text-slate-800">{u.name}</h4>
                              <p className="text-[9px] text-slate-400 font-bold">{u.phone}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[8px] text-slate-400 font-black block uppercase">SISA TAGIHAN</span>
                              <span className={`font-black text-xs ${debt > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                {debt > 0 ? formatRp(debt) : 'Lunas ✨'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* --- 3. TAB: KELOLA MASTER DATA --- */}
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
                        <input type="file" accept="image/*" ref={fileInputRef} className="hidden" />
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