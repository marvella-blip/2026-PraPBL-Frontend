import { useEffect, useState } from 'react'
import { getRooms, createRoom, deleteRoom } from './api/roomService'

function App() {
  const [rooms, setRooms] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [capacity, setCapacity] = useState(0)

  const refreshData = async () => {
    const data = await getRooms()
    setRooms(data)
  }

  useEffect(() => {
    refreshData()
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    await createRoom({ name, description, capacity })
    setName(''); setDescription(''); setCapacity(0)
    refreshData()
  }

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h1>Sistem Peminjaman Ruang Kampus</h1>
      
      <form onSubmit={handleAdd} style={{ marginBottom: '20px' }}>
        <input placeholder="Nama Ruangan" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Lokasi/Deskripsi" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <input type="number" placeholder="Kapasitas" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
        <button type="submit">Tambah Ruang</button>
      </form>

      <table border="1" width="100%" style={{ textAlign: 'left' }}>
        <thead>
          <tr>
            <th>Nama Ruang</th>
            <th>Deskripsi</th>
            <th>Kapasitas</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.description}</td>
              <td>{r.capacity} Orang</td>
              <td>{r.isAvailable ? "Tersedia" : "Dipakai"}</td>
              <td>
                <button onClick={() => deleteRoom(r.id).then(refreshData)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default App