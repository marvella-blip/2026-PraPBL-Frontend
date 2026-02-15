import { useState } from 'react';
import axios from 'axios';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5128/api/v1/auth/login', {
        username: username,
        password: password
      });

      const { token, role } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      alert(`Login sukses! Selamat datang, ${role}`);
      onLoginSuccess(token, role); 
      
    } catch (err) {
      alert("Username atau Password salah!");
    }
  };

  return (

    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      width: '100vw', 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      backgroundColor: '#E8D8C4',
      fontFamily: "'Segoe UI', sans-serif" 
    }}>
      
      <div style={{ 
        padding: '40px', 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)', 
        width: '320px',
        borderTop: '5px solid #6D2932' 
      }}>
        
        <h2 style={{ textAlign: 'center', color: '#561C24', marginBottom: '25px', marginTop: 0 }}>
          PinjamRuang 🏢
        </h2>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#666', fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>Username</label>
            <input 
              type="text" 
              placeholder="contoh: admin / mauren" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              required
            />
          </div>
          
          <div>
            <label style={{ fontSize: '12px', color: '#666', fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>Password</label>
            <input 
              type="password" 
              placeholder="Masukkan password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              required
            />
          </div>

          <button type="submit" style={{ 
            padding: '12px', 
            backgroundColor: '#6D2932', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer', 
            fontWeight: 'bold',
            marginTop: '10px',
            fontSize: '14px'
          }}>
            Masuk ke Dashboard
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#888' }}>
          Gunakan <strong>admin / password123</strong> untuk Admin.<br/>
          Gunakan <strong>mauren / user123</strong> untuk Mahasiswa.
        </div>

      </div>
    </div>
  );
}

export default Login;