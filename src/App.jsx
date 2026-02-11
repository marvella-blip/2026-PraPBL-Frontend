import { useEffect, useState } from 'react'
import axios from 'axios'
import { getRooms, bookRoom } from './api/roomService'

function App() {
  const [rooms, setRooms] = useState([])
  const [reservations, setReservations] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Semua Status') // State Filter Status (PPT 3)

  const refreshData = async () => {
    try {
      const roomData = await getRooms()
      setRooms(roomData)
      const res = await axios.get("http://localhost:5128/api/v1/reservations")
      setReservations(res.data)
    } catch (err) {
      console.error("Gagal sinkronisasi data", err)
    }
  }

  useEffect(() => { refreshData() }, [])

  // Fungsi Tambah Peminjaman (PPT 1)
  const handleAddNewBooking = async () => {
    const availableRooms = rooms.filter(r => r.isAvailable)
    if (availableRooms.length === 0) return alert("Tidak ada ruangan tersedia")
    const roomList = availableRooms.map(r => `${r.id}: ${r.name}`).join("\n")
    const roomId = prompt(`Pilih ID Ruangan:\n${roomList}`)
    if (roomId) {
      const borrower = prompt("Nama Peminjam:")
      const purpose = prompt("Tujuan Peminjaman:")
      if (borrower && purpose) {
        try {
          await bookRoom({
            RoomId: parseInt(roomId),
            BorrowerName: borrower,
            Purpose: purpose,
            Status: "Menunggu Persetujuan",
            BorrowDate: new Date().toISOString()
          })
          alert("Berhasil diajukan!")
          refreshData()
        } catch (err) { alert("Gagal menambah data") }
      }
    }
  }

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5128/api/v1/reservations/${id}`, `"${newStatus}"`, {
        headers: { 'Content-Type': 'application/json' }
      })
      refreshData()
    } catch (err) { alert("Gagal update status") }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Hapus data ini?")) {
      try {
        await axios.delete(`http://localhost:5128/api/v1/reservations/${id}`)
        refreshData()
      } catch (err) { alert("Gagal menghapus") }
    }
  }

const filteredData = reservations.filter(res => {
  const roomInfo = rooms.find(r => r.id === res.roomId);
  const roomName = roomInfo ? roomInfo.name.toLowerCase() : "";
  
  const matchSearch = 
    res.borrowerName.toLowerCase().includes(search.toLowerCase()) || 
    roomName.includes(search.toLowerCase()); // Penelusuran Nama Ruangan (PPT 3)
    
  const matchStatus = statusFilter === 'Semua Status' || res.status === statusFilter;
  return matchSearch && matchStatus;
});
  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', width: '123%', margin: 0, padding: 0, fontFamily: "'Segoe UI', sans-serif" }}>
      
      {/* NAVBAR */}
      <nav style={{ backgroundColor: '#0056b3', color: 'white', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>PENS Rooms Informations</h2>
        <button onClick={handleAddNewBooking} style={btnSuccess}>+ Tambah Peminjaman</button>
      </nav>

      {/* KONTEN UTAMA */}
      <div style={{ padding: '0px 40px' }}>
        <h1 style={{ color: '#333', marginBottom: '25px' }}>Peminjaman Ruangan Kampus PENS</h1>
        
        <div style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="Cari nama peminjam..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '12px 15px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          
          {/* DROP-DOWN FILTER STATUS */}
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', width: '200px', cursor: 'pointer' }}
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
            <thead style={{ backgroundColor: '#2d3436', color: 'white' }}>
              <tr>
                <th style={thStyle}>No</th>
                <th style={thStyle}>Peminjam</th>
                <th style={thStyle}>Ruangan</th>
                <th style={thStyle}>Waktu</th>
                <th style={thStyle}>Keperluan</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Aksi</th>
              </tr>
            </thead>
            <tbody>
  {filteredData.map((res, index) => {
    // Cari data ruangan yang ID-nya cocok dengan res.roomId (PPT Poin 1)
    const roomInfo = rooms.find(r => r.id === res.roomId);
    
    return (
      <tr key={res.id} style={{ borderBottom: '1px solid #eee' }}>
        <td style={tdStyle}>{index + 1}</td>
        <td style={{ ...tdStyle, fontWeight: 'bold', color: '#0056b3' }}>{res.borrowerName}</td>
        
        {/* SEKARANG MENAMPILKAN NAMA RUANGAN (Sesuai Permintaanmu) */}
        <td style={tdStyle}>
          {roomInfo ? roomInfo.name : `ID Ruangan: ${res.roomId}`}
        </td>
        
        <td style={tdStyle}>{new Date(res.borrowDate).toLocaleDateString()}</td>
        <td style={tdStyle}>{res.purpose}</td>
        
        {/* ... sisa kolom status dan aksi tetap sama ... */}
        <td style={tdStyle}>
          <span style={{ 
            padding: '5px 12px', borderRadius: '15px', fontSize: '11px', fontWeight: 'bold',
            backgroundColor: res.status === 'Disetujui' ? '#d4edda' : res.status === 'Ditolak' ? '#f8d7da' : '#fff3cd',
            color: res.status === 'Disetujui' ? '#155724' : res.status === 'Ditolak' ? '#721c24' : '#856404'
          }}>
            {res.status.toUpperCase()}
          </span>
        </td>
        <td style={tdStyle}>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button onClick={() => updateStatus(res.id, 'Disetujui')} style={btnAction}>Setuju</button>
            <button onClick={() => updateStatus(res.id, 'Ditolak')} style={btnWarning}>Tolak</button>
            <button onClick={() => handleDelete(res.id)} style={btnDanger}>Hapus</button>
          </div>
        </td>
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

// STYLING SAMA SEPERTI SEBELUMNYA
const thStyle = { padding: '15px', textAlign: 'left', fontSize: '14px' };
const tdStyle = { padding: '15px', fontSize: '14px', color: '#444' };
const btnSuccess = { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const btnAction = { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };
const btnWarning = { backgroundColor: '#ffc107', color: 'black', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };
const btnDanger = { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };

export default App