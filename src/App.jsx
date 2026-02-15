import { useEffect, useState } from 'react';
import axios from 'axios';
import Login from './Login'; // Pastikan file Login.jsx sudah ada di folder src!

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');

  // FUNGSI LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
  };

  // Konfigurasi Header untuk membawa "Gelang Token" ke Backend
  const authHeader = {
    headers: { 
      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    }
  };

  const refreshData = async () => {
    if (!token) return; 
    try {
      const roomData = await axios.get("http://localhost:5128/api/v1/rooms", authHeader);
      setRooms(roomData.data);
      
      const res = await axios.get("http://localhost:5128/api/v1/reservations", authHeader);
      setReservations(res.data);
    } catch (err) {
      console.error("Gagal sinkronisasi data", err);
    }
  };

  useEffect(() => { refreshData(); }, [token]);

  const handleAddNewBooking = async () => {
    const availableRooms = rooms.filter(r => r.isAvailable);
    if (availableRooms.length === 0) return alert("Tidak ada ruangan tersedia");
    
    const roomList = availableRooms.map(r => `${r.id}: ${r.name}`).join("\n");
    const roomId = prompt(`Pilih ID Ruangan:\n${roomList}`);
    
    if (roomId) {
      const borrower = prompt("Nama Peminjam:");
      const purpose = prompt("Tujuan Peminjaman:");
      
      if (borrower && purpose) {
        try {
          // Ganti bookRoom dengan axios langsung agar bisa bawa token
          await axios.post('http://localhost:5128/api/v1/reservations', {
            RoomId: parseInt(roomId),
            BorrowerName: borrower,
            Purpose: purpose,
            Status: "Menunggu Persetujuan",
            BorrowDate: new Date().toISOString()
          }, authHeader);
          
          alert("Berhasil diajukan!");
          refreshData();
        } catch (err) { alert("Gagal menambah data. Akses ditolak!") }
      }
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5128/api/v1/reservations/${id}`, `"${newStatus}"`, authHeader);
      refreshData();
    } catch (err) { alert("Gagal update status. Pastikan Anda adalah Admin!"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus data ini?")) {
      try {
        await axios.delete(`http://localhost:5128/api/v1/reservations/${id}`, authHeader);
        refreshData();
      } catch (err) { alert("Gagal menghapus. Akses ditolak!"); }
    }
  };

  const filteredData = reservations.filter(res => {
    const roomInfo = rooms.find(r => r.id === res.roomId);
    const roomName = roomInfo ? roomInfo.name.toLowerCase() : "";
    
    const matchSearch = 
      res.borrowerName.toLowerCase().includes(search.toLowerCase()) || 
      roomName.includes(search.toLowerCase());
      
    const matchStatus = statusFilter === 'Semua Status' || res.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // JIKA BELUM LOGIN, TAMPILKAN HALAMAN LOGIN
  if (!token) {
    return <Login onLoginSuccess={(newToken, newRole) => {
      setToken(newToken);
      setRole(newRole);
    }} />;
  }
  
  // JIKA SUDAH LOGIN, TAMPILKAN DASHBOARD
  return (
    <div style={{ backgroundColor: '#E8D8C4', minHeight: '100vh', width: '100%', margin: 0, padding: 0, fontFamily: "'Segoe UI', sans-serif" }}>
      
      {/* NAVBAR */}
      <nav style={{ backgroundColor: '#6D2932', color: 'white', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>PENS Rooms Informations</h2>
        
        {/* INFO USER & TOMBOL LOGOUT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '14px' }}>Halo, <strong>{role}</strong></span>
          <button onClick={handleLogout} style={btnDanger}>Logout</button>
        </div>
      </nav>

      {/* KONTEN UTAMA */}
      <div style={{ padding: '30px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h1 style={{ color: '#333', margin: 0 }}>Peminjaman Ruangan Kampus PENS</h1>
          <button onClick={handleAddNewBooking} style={btnSuccess}>+ Tambah Peminjaman</button>
        </div>
        
        {/* FILTER & PENCARIAN */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="Cari nama peminjam/ruangan..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '12px 15px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #E8D8C4', width: '200px', cursor: 'pointer' }}
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Ditolak">Ditolak</option>
          </select>
        </div>

        {/* TABEL DATA */}
        <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#561C24', color: 'white' }}>
              <tr>
                <th style={thStyle}>No</th>
                <th style={thStyle}>Peminjam</th>
                <th style={thStyle}>Ruangan</th>
                <th style={thStyle}>Waktu</th>
                <th style={thStyle}>Keperluan</th>
                <th style={thStyle}>Status</th>
                {/* Header Aksi hanya muncul untuk Admin */}
                {role === 'Admin' && <th style={thStyle}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((res, index) => {
                const roomInfo = rooms.find(r => r.id === res.roomId);
                
                return (
                  <tr key={res.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={tdStyle}>{index + 1}</td>
                    <td style={{ ...tdStyle, fontWeight: 'bold', color: '#561C24' }}>{res.borrowerName}</td>
                    <td style={tdStyle}>{roomInfo ? roomInfo.name : `ID Ruangan: ${res.roomId}`}</td>
                    <td style={tdStyle}>{new Date(res.borrowDate).toLocaleDateString()}</td>
                    <td style={tdStyle}>{res.purpose}</td>
                    <td style={tdStyle}>
                      <span style={{ 
                        padding: '5px 12px', borderRadius: '15px', fontSize: '11px', fontWeight: 'bold',
                        backgroundColor: res.status === 'Disetujui' ? '#d4edda' : res.status === 'Ditolak' ? '#f8d7da' : '#fff3cd',
                        color: res.status === 'Disetujui' ? '#155724' : res.status === 'Ditolak' ? '#721c24' : '#856404'
                      }}>
                        {res.status.toUpperCase()}
                      </span>
                    </td>
                    
                    {/* Tombol Aksi hanya muncul untuk Admin */}
                    {role === 'Admin' && (
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button onClick={() => updateStatus(res.id, 'Disetujui')} style={btnAction}>Setuju</button>
                          <button onClick={() => updateStatus(res.id, 'Ditolak')} style={btnWarning}>Tolak</button>
                          <button onClick={() => handleDelete(res.id)} style={btnDanger}>Hapus</button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Data tidak ditemukan.</div>
          )}
        </div>
      </div>
    </div>
  )
}

const thStyle = { padding: '15px', textAlign: 'left', fontSize: '14px' };
const tdStyle = { padding: '15px', fontSize: '14px', color: '#444' };
const btnSuccess = { backgroundColor: '#561C24', color: '#E8D8C4', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const btnAction = { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };
const btnWarning = { backgroundColor: '#ffc107', color: 'black', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };
const btnDanger = { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };

export default App;