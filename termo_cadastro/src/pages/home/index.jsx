import React, { useState } from 'react';
import api from '../../services/api'

function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', { email, password });
      alert('Login bem-sucedido!');
      localStorage.setItem('token', response.data.token);
      // Redirecionar ou fazer algo após o login
    } catch (error) {
      alert('Erro ao fazer login');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>HOME</h2>
      
    </form>
  );
}

export default Home;
