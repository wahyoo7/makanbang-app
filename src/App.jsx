import React, { useState, useMemo } from 'react';
import { 
  Utensils, Wallet, Users, Store, List, 
  ShoppingCart, Plus, Minus, Check, LogOut, 
  AlertCircle, ChevronRight, Receipt, Clock
} from 'lucide-react';

// --- INITIAL MOCK DATA (Simulasi Database) ---
const initialRestaurants = [
  { id: 1, name: 'Warteg Bahari Kharisma' },
  { id: 2, name: 'Ayam Geprek Bensu' },
  { id: 3, name: 'Soto Lamongan Cak Har' }
];

const initialMenus = [
  { id: 1, restaurant_id: 1, name: 'Nasi Telur Dadar + Orek', price: 15000 },
  { id: 2, restaurant_id: 1, name: 'Nasi Ayam Goreng', price: 18000 },
  { id: 3, restaurant_id: 1, name: 'Es Teh Manis', price: 4000 },
  { id: 4, restaurant_id: 2, name: 'Paket Geprek Leleh', price: 25000 },
  { id: 5, restaurant_id: 2, name: 'Jamur Crispy', price: 10000 },
  { id: 6, restaurant_id: 3, name: 'Soto Ayam Campur', price: 18000 },
  { id: 7, restaurant_id: 3, name: 'Soto Daging Pisah', price: 22000 },
];

const initialOrders = [
  {
    id: 1,
    userName: "Mbak Rini",
    total: 19000,
    items: [
      { menuId: 1, name: 'Nasi Telur Dadar + Orek', price: 15000, qty: 1, notes: "Oreknya basah ya mas" },
      { menuId: 3, name: 'Es Teh Manis', price: 4000, qty: 1, notes: "" },
    ]
  }
];

// Helper: Format Rupiah
const formatRp = (num) => 'Rp ' + num.toLocaleString('id-ID');

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function LunchApp() {
  // Global States
  const [currentUser, setCurrentUser] = useState(null); // null = belum login
  
  // "Database" States
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [menus, setMenus] = useState(initialMenus);
  const [orders, setOrders] = useState(initialOrders);
  
  const [session, setSession] = useState({
    isOpen: false,
    openRestoIds: [1, 2], // Default resto yang dipilih Admin
    endTime: '11:30',
    bankAccount: 'BCA 123456789 a.n Bapak OB',
    rejectMessage: 'Moon maaf, jam order udah lewat, silakan hubungi saya via wa... tapi please jangan order yang jauh2 ya 😭'
  });

  // Handle Login Logic
  const handleLogin = (name, phone) => {
    // Sesuai PRD: Role Admin/OB jika login khusus. 
    // Di sini kita buat trigger rahasia: Jika no HP '0000', maka dia OB.
    const role = phone === '0000' ? 'admin' : 'user';
    setCurrentUser({ name, phone, role });
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const addOrder = (orderData) => {
    setOrders([...orders, { id: Date.now(), ...orderData }]);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center font-sans text-gray-800">
      {/* Mobile Wrapper */}
      <div className="w-full max-w-md bg-white h-[100dvh] flex flex-col relative shadow-2xl overflow-hidden">
        
        {!currentUser ? (
          <LoginScreen onLogin={handleLogin} />
        ) : currentUser.role === 'admin' ? (
          <AdminDashboard 
            onLogout={handleLogout}
            restaurants={restaurants} setRestaurants={setRestaurants}
            menus={menus} setMenus={setMenus}
            session={session} setSession={setSession}
            orders={orders}
          />
        ) : (
          <UserDashboard 
            user={currentUser} onLogout={handleLogout}
            restaurants={restaurants} menus={menus}
            session={session} addOrder={addOrder}
          />
        )}

      </div>
    </div>
  );
}

// ==========================================
// LOGIN SCREEN
// ==========================================
function LoginScreen({ onLogin }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && phone.trim()) {
      onLogin(name, phone);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-amber-50 to-white">
      <div className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg mb-6 transform rotate-3">
        <Utensils size={40} />
      </div>
      <h1 className="text-3xl font-extrabold text-amber-600 mb-2">MakanBang!</h1>
      <p className="text-center text-gray-500 mb-8 text-sm">Pesan makan siang kantor tanpa ribet, tanpa pusing ngitung.</p>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Nama Panggilan</label>
          <input 
            type="text" required value={name} onChange={e => setName(e.target.value)}
            placeholder="Mis: Aa Raffi"
            className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-amber-500 focus:outline-none transition"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">No. HP (Sebagai Password)</label>
          <input 
            type="text" required value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="0812xxxxxx"
            className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-amber-500 focus:outline-none transition"
          />
        </div>
        <button type="submit" className="w-full bg-amber-500 text-white font-bold py-4 rounded-xl shadow-md hover:bg-amber-600 transition active:scale-95 mt-4">
          Masuk Sekarang
        </button>
      </form>

      <div className="mt-8 p-4 bg-blue-50 text-blue-800 rounded-xl text-xs w-full border border-blue-100 flex gap-3">
        <AlertCircle size={20} className="shrink-0" />
        <p><strong>Rahasia Testing:</strong> Masukkan No. HP <code>0000</code> untuk login sebagai <strong>OB (Admin)</strong>. Selain itu, Anda masuk sebagai <strong>Karyawan</strong>.</p>
      </div>
    </div>
  );
}

// ==========================================
// ADMIN DASHBOARD & VIEWS
// ==========================================
function AdminDashboard({ onLogout, restaurants, setRestaurants, menus, setMenus, session, setSession, orders }) {
  const [activeTab, setActiveTab] = useState('lapak'); // lapak | master | rekap

  return (
    <>
      <div className="bg-slate-800 text-white p-4 shadow-md flex justify-between items-center z-10 shrink-0">
        <h1 className="font-bold text-lg flex items-center gap-2"><Store size={20}/> Panel OB</h1>
        <button onClick={onLogout} className="text-slate-300 hover:text-white p-2 bg-slate-700 rounded-lg"><LogOut size={18}/></button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 pb-24">
        {activeTab === 'lapak' && <AdminLapak session={session} setSession={setSession} restaurants={restaurants} />}
        {activeTab === 'master' && <AdminMaster restaurants={restaurants} setRestaurants={setRestaurants} menus={menus} setMenus={setMenus} />}
        {activeTab === 'rekap' && <AdminRekap orders={orders} restaurants={restaurants} menus={menus} />}
      </div>

      {/* Admin Bottom Navigation */}
      <div className="bg-white border-t flex justify-around p-2 text-xs text-gray-500 absolute bottom-0 w-full z-20 pb-safe">
        <button onClick={() => setActiveTab('lapak')} className={`flex flex-col items-center p-2 w-full rounded-lg ${activeTab === 'lapak' ? 'text-amber-600 bg-amber-50 font-bold' : ''}`}>
          <Store size={24} className="mb-1" /> Lapak
        </button>
        <button onClick={() => setActiveTab('master')} className={`flex flex-col items-center p-2 w-full rounded-lg ${activeTab === 'master' ? 'text-amber-600 bg-amber-50 font-bold' : ''}`}>
          <List size={24} className="mb-1" /> Master Data
        </button>
        <button onClick={() => setActiveTab('rekap')} className={`flex flex-col items-center p-2 w-full rounded-lg ${activeTab === 'rekap' ? 'text-amber-600 bg-amber-50 font-bold' : ''}`}>
          <Users size={24} className="mb-1" /> Rekap
        </button>
      </div>
    </>
  );
}

function AdminLapak({ session, setSession, restaurants }) {
  const [formData, setFormData] = useState(session);

  const handleToggleResto = (id) => {
    setFormData(prev => ({
      ...prev,
      openRestoIds: prev.openRestoIds.includes(id) 
        ? prev.openRestoIds.filter(rId => rId !== id)
        : [...prev.openRestoIds, id]
    }));
  };

  const handleSave = () => {
    if (formData.openRestoIds.length === 0) return alert('Pilih minimal 1 restoran!');
    setSession({ ...formData, isOpen: true });
  };

  if (session.isOpen) {
    return (
      <div className="p-6 h-full flex flex-col justify-center text-center">
        <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border-4 border-white">
          <Check size={48} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Lapak Sedang Buka!</h2>
        <p className="text-gray-500 mb-8">Karyawan sekarang bisa melihat menu dan melakukan pemesanan.</p>
        <button 
          onClick={() => setSession({ ...session, isOpen: false })}
          className="bg-red-500 text-white w-full py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-red-600 active:scale-95 transition"
        >
          Tutup Lapak Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="font-bold text-xl text-gray-800 mb-1">Setup Lapak Hari Ini</h2>
        <p className="text-sm text-gray-500">Pilih restoran dan atur batas waktu pesanan.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">1. Pilih Restoran (Maks bebas)</label>
          <div className="space-y-2">
            {restaurants.map(resto => (
              <label key={resto.id} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
                <input 
                  type="checkbox" className="w-5 h-5 rounded text-amber-500 accent-amber-500"
                  checked={formData.openRestoIds.includes(resto.id)}
                  onChange={() => handleToggleResto(resto.id)}
                />
                <span className="font-medium text-gray-700">{resto.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">2. Batas Waktu Order</label>
          <input 
            type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})}
            className="w-full border p-3 rounded-xl bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">3. Info Rekening / E-Wallet</label>
          <input 
            type="text" value={formData.bankAccount} onChange={e => setFormData({...formData, bankAccount: e.target.value})}
            className="w-full border p-3 rounded-xl bg-gray-50" placeholder="Misal: BCA 1234 a.n Budi"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">4. Pesan Penolakan Otomatis</label>
          <textarea 
            value={formData.rejectMessage} onChange={e => setFormData({...formData, rejectMessage: e.target.value})}
            className="w-full border p-3 rounded-xl bg-gray-50 text-sm h-24"
          />
        </div>
      </div>

      <button onClick={handleSave} className="bg-amber-500 text-white w-full py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-amber-600 active:scale-95 transition">
        Buka Lapak Sekarang
      </button>
    </div>
  );
}

function AdminMaster({ restaurants, setRestaurants, menus, setMenus }) {
  const [newRestoName, setNewRestoName] = useState('');
  const [activeAddMenuRestoId, setActiveAddMenuRestoId] = useState(null);
  const [newMenu, setNewMenu] = useState({ name: '', price: '' });

  const handleAddResto = () => {
    if (newRestoName.trim()) {
      setRestaurants([...restaurants, { id: Date.now(), name: newRestoName }]);
      setNewRestoName('');
    }
  };

  const handleAddMenu = (restoId) => {
    if (newMenu.name && newMenu.price) {
      setMenus([...menus, { id: Date.now(), restaurant_id: restoId, name: newMenu.name, price: parseInt(newMenu.price) }]);
      setNewMenu({ name: '', price: '' });
      setActiveAddMenuRestoId(null);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
        <label className="block text-sm font-bold text-gray-700 mb-2">Tambah Restoran Baru</label>
        <div className="flex gap-2">
          <input 
            type="text" value={newRestoName} onChange={e => setNewRestoName(e.target.value)}
            placeholder="Nama Resto..." className="flex-1 border p-3 rounded-xl bg-gray-50"
          />
          <button onClick={handleAddResto} className="bg-slate-800 text-white px-5 rounded-xl font-bold"><Plus/></button>
        </div>
      </div>

      <div className="space-y-4">
        {restaurants.map(resto => {
          const restoMenus = menus.filter(m => m.restaurant_id === resto.id);
          return (
            <div key={resto.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-amber-600 border-b pb-2 mb-2">{resto.name}</h3>
              
              <div className="space-y-2 mb-4">
                {restoMenus.length === 0 ? <p className="text-xs text-gray-400 italic">Belum ada menu</p> : null}
                {restoMenus.map(menu => (
                  <div key={menu.id} className="flex justify-between items-center text-sm text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <span className="font-medium">{menu.name}</span>
                    <span className="font-bold text-slate-800">{formatRp(menu.price)}</span>
                  </div>
                ))}
              </div>

              {activeAddMenuRestoId === resto.id ? (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-2">
                  <input 
                    type="text" placeholder="Nama Menu..." value={newMenu.name} onChange={e => setNewMenu({...newMenu, name: e.target.value})}
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                  <input 
                    type="number" placeholder="Harga (Mis: 15000)" value={newMenu.price} onChange={e => setNewMenu({...newMenu, price: e.target.value})}
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => handleAddMenu(resto.id)} className="flex-1 bg-amber-500 text-white p-2 rounded-lg text-sm font-bold">Simpan</button>
                    <button onClick={() => setActiveAddMenuRestoId(null)} className="flex-1 bg-gray-200 text-gray-700 p-2 rounded-lg text-sm font-bold">Batal</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setActiveAddMenuRestoId(resto.id)} className="text-amber-500 text-sm font-bold flex items-center gap-1 hover:text-amber-600">
                  <Plus size={16}/> Tambah Menu
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminRekap({ orders, restaurants, menus }) {
  const [view, setView] = useState('orang'); // orang | resto | menu

  // Compute Data for Views
  const rekapResto = useMemo(() => {
    return restaurants.map(resto => {
      const menuIds = menus.filter(m => m.restaurant_id === resto.id).map(m => m.id);
      let totalQty = 0;
      let totalUang = 0;
      let items = [];
      
      orders.forEach(order => {
        order.items.forEach(item => {
          if (menuIds.includes(item.menuId)) {
            totalQty += item.qty;
            totalUang += item.qty * item.price;
            items.push({ ...item, userName: order.userName });
          }
        });
      });
      return { ...resto, totalQty, totalUang, items };
    }).filter(r => r.totalQty > 0);
  }, [orders, restaurants, menus]);

  const rekapMenu = useMemo(() => {
    return menus.map(menu => {
      let totalQty = 0;
      orders.forEach(order => {
        order.items.forEach(item => {
          if (item.menuId === menu.id) totalQty += item.qty;
        });
      });
      return { ...menu, totalQty };
    }).filter(m => m.totalQty > 0);
  }, [orders, menus]);

  const totalAllMoney = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="bg-slate-800 text-white p-4 rounded-2xl shadow-lg mb-4 flex justify-between items-center">
        <div>
          <p className="text-slate-400 text-xs mb-1">Total Pemasukan Makanan</p>
          <h2 className="text-2xl font-bold text-amber-400">{formatRp(totalAllMoney)}</h2>
        </div>
        <Wallet size={32} className="text-slate-600" />
      </div>

      <div className="flex bg-white rounded-xl shadow-sm border p-1 mb-4">
        {['orang', 'resto', 'menu'].map(v => (
          <button 
            key={v} onClick={() => setView(v)}
            className={`flex-1 py-2 text-sm font-bold capitalize rounded-lg transition ${view === v ? 'bg-amber-100 text-amber-700' : 'text-gray-500'}`}
          >
            Per {v}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-3">
        {view === 'orang' && orders.length === 0 && <EmptyState message="Belum ada pesanan masuk" />}
        {view === 'orang' && orders.map(order => (
          <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <h3 className="font-bold text-lg text-slate-800">{order.userName}</h3>
              <span className="font-bold text-amber-600">{formatRp(order.total)}</span>
            </div>
            <ul className="space-y-2">
              {order.items.map((item, i) => (
                <li key={i} className="text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">{item.qty}x {item.name}</span>
                  </div>
                  {item.notes && <p className="text-xs text-amber-600 bg-amber-50 p-1 rounded mt-1 italic">"{item.notes}"</p>}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {view === 'resto' && rekapResto.length === 0 && <EmptyState message="Belum ada pesanan masuk" />}
        {view === 'resto' && rekapResto.map(resto => (
          <div key={resto.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <h3 className="font-bold text-lg text-slate-800">{resto.name}</h3>
              <span className="text-sm font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{resto.totalQty} porsi</span>
            </div>
            <ul className="space-y-2">
              {resto.items.map((item, i) => (
                <li key={i} className="text-sm border-b border-dashed pb-1">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">{item.qty}x {item.name}</span>
                    <span className="text-gray-500 text-xs">({item.userName})</span>
                  </div>
                  {item.notes && <p className="text-xs text-amber-600 italic">Catatan: {item.notes}</p>}
                </li>
              ))}
            </ul>
            <div className="mt-3 text-right text-sm font-bold text-amber-600">
              Total tagihan ke resto: {formatRp(resto.totalUang)}
            </div>
          </div>
        ))}

        {view === 'menu' && rekapMenu.length === 0 && <EmptyState message="Belum ada pesanan masuk" />}
        {view === 'menu' && (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            {rekapMenu.map((menu, i) => (
              <div key={menu.id} className={`flex justify-between items-center p-4 ${i !== rekapMenu.length - 1 ? 'border-b' : ''}`}>
                <span className="font-medium text-gray-800">{menu.name}</span>
                <span className="font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">{menu.totalQty}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-10 text-gray-400">
      <Receipt size={48} className="mx-auto mb-3 opacity-20" />
      <p>{message}</p>
    </div>
  );
}


// ==========================================
// USER DASHBOARD & VIEWS
// ==========================================
function UserDashboard({ user, onLogout, restaurants, menus, session, addOrder }) {
  const [cart, setCart] = useState([]); // [{ menuId, name, price, qty, notes }]
  const [showCart, setShowCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Jika lapak tutup
  if (!session.isOpen) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 flex justify-between items-center shrink-0">
           <h1 className="font-bold text-lg text-slate-800">Halo, {user.name}!</h1>
           <button onClick={onLogout} className="text-red-500 text-sm font-bold p-2 bg-red-50 rounded-lg">Logout</button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-32 h-32 mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 w-full h-full">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Lapak Belum Buka / Udah Tutup</h2>
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
            <p className="text-amber-800 italic text-sm">"{session.rejectMessage}"</p>
          </div>
        </div>
      </div>
    );
  }

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
    addOrder({
      userName: user.name,
      items: cart,
      total: cartTotal
    });
    setCart([]);
    setShowCart(false);
    setShowSuccess(true);
  };

  const openRestaurants = restaurants.filter(r => session.openRestoIds.includes(r.id));

  return (
    <>
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex justify-between items-center z-10 shrink-0 sticky top-0">
        <div>
          <h1 className="font-bold text-lg text-slate-800">Halo, {user.name}! 👋</h1>
          <p className="text-xs text-amber-600 font-medium flex items-center gap-1"><Clock size={12}/> Order s/d {session.endTime}</p>
        </div>
        <button onClick={onLogout} className="text-slate-400 hover:text-red-500 p-2"><LogOut size={20}/></button>
      </div>

      {/* Main Content (Menu List) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 pb-28">
        {openRestaurants.map(resto => {
          const restoMenus = menus.filter(m => m.restaurant_id === resto.id);
          return (
            <div key={resto.id} className="space-y-3">
              <h2 className="font-extrabold text-xl text-slate-800 flex items-center gap-2">
                <Store size={20} className="text-amber-500"/> {resto.name}
              </h2>
              <div className="space-y-3">
                {restoMenus.map(menu => {
                  const cartItem = cart.find(c => c.menuId === menu.id);
                  const qty = cartItem ? cartItem.qty : 0;
                  
                  return (
                    <div key={menu.id} className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${qty > 0 ? 'border-amber-400 ring-1 ring-amber-100' : 'border-gray-100'}`}>
                      <div className="flex justify-between items-center">
                        <div className="pr-4">
                          <h3 className="font-bold text-slate-800 mb-1">{menu.name}</h3>
                          <p className="text-amber-600 font-bold text-sm">{formatRp(menu.price)}</p>
                        </div>
                        
                        {/* +/- Controls */}
                        {qty === 0 ? (
                          <button 
                            onClick={() => handleUpdateCart(menu, 1)}
                            className="bg-amber-50 text-amber-600 font-bold px-4 py-2 rounded-xl border border-amber-200 hover:bg-amber-100 transition"
                          >
                            Tambah
                          </button>
                        ) : (
                          <div className="flex items-center gap-3 bg-amber-50 rounded-xl p-1 border border-amber-200">
                            <button onClick={() => handleUpdateCart(menu, -1)} className="w-8 h-8 flex items-center justify-center bg-white text-amber-600 rounded-lg shadow-sm font-bold">-</button>
                            <span className="font-bold w-4 text-center text-amber-800">{qty}</span>
                            <button onClick={() => handleUpdateCart(menu, 1)} className="w-8 h-8 flex items-center justify-center bg-amber-500 text-white rounded-lg shadow-sm font-bold">+</button>
                          </div>
                        )}
                      </div>
                      
                      {/* Notes Input Field (Muncul jika item ada di keranjang) */}
                      {qty > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <input 
                            type="text"
                            placeholder="Catatan (Mis: Pedes mampus, gapake bawang)"
                            value={cartItem.notes}
                            onChange={(e) => handleUpdateNotes(menu.id, e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Floating Cart Button */}
      {cartItemsCount > 0 && !showCart && !showSuccess && (
        <div className="absolute bottom-6 left-0 right-0 px-4 z-20">
          <button 
            onClick={() => setShowCart(true)}
            className="w-full bg-slate-800 text-white p-4 rounded-2xl shadow-xl flex justify-between items-center hover:bg-slate-700 transition transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 w-8 h-8 rounded-full flex items-center justify-center font-bold">{cartItemsCount}</div>
              <span className="font-medium text-slate-200">Pesananmu</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{formatRp(cartTotal)}</span>
              <ChevronRight size={20} className="text-slate-400"/>
            </div>
          </button>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-white w-full rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-full duration-300">
            <div className="p-4 border-b flex justify-between items-center shrink-0">
              <h2 className="font-bold text-xl text-slate-800">Detail Pesanan</h2>
              <button onClick={() => setShowCart(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold hover:bg-gray-200">✕</button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {cart.map(item => (
                <div key={item.menuId} className="flex justify-between items-start border-b pb-3 border-dashed">
                  <div>
                    <h4 className="font-bold text-gray-800">{item.name}</h4>
                    <p className="text-gray-500 text-sm">{item.qty} x {formatRp(item.price)}</p>
                    {item.notes && <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block mt-1">"{item.notes}"</p>}
                  </div>
                  <span className="font-bold text-slate-800">{formatRp(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            <div className="p-6 bg-slate-50 rounded-t-3xl border-t shrink-0">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 font-medium">Total Harga</span>
                <span className="text-2xl font-extrabold text-slate-800">{formatRp(cartTotal)}</span>
              </div>
              <button 
                onClick={handleCheckout}
                className="w-full bg-amber-500 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-amber-600 transition flex items-center justify-center gap-2"
              >
                Pesan & Bayar <ChevronRight size={20}/>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success / Payment Modal */}
      {showSuccess && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col justify-center items-center p-6 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-24 h-24 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Check size={48} strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Pesanan Masuk!</h2>
          <p className="text-gray-500 mb-8">OB kita sedang mencatat pesananmu dengan sepenuh hati.</p>
          
          <div className="w-full bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-sm mb-8 text-left">
            <p className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Info Transfer</p>
            <p className="text-xs text-gray-400 mb-1">Silakan transfer total <strong className="text-slate-800">{formatRp(cartTotal)}</strong> ke:</p>
            <p className="font-mono text-lg font-bold text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200 my-2 select-all">
              {session.bankAccount}
            </p>
            <p className="text-xs text-gray-400 italic">Tunjukkin bukti transfer ke OB kalau udah ya!</p>
          </div>

          <button 
            onClick={() => setShowSuccess(false)}
            className="bg-slate-800 text-white w-full py-4 rounded-xl font-bold shadow-md"
          >
            Siap, Laksanakan!
          </button>
        </div>
      )}
    </>
  );
}