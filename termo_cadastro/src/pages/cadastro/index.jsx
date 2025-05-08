import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./signup.css";
import Lixeira from "../../assets/lixi.png";
import api from '../../services/api';

function Cadastro() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const inputName = useRef();
  const inputAge = useRef();
  const inputEmail = useRef();
  const inputPassword = useRef();

  async function createUsers() {
    try {
      setLoading(true);
      setError(null);
      
      const userData = {
        name: inputName.current.value,
        age: Number(inputAge.current.value),
        email: inputEmail.current.value,
        password: inputPassword.current.value,
        score: 0
      };
  
      const response = await api.post('/users', userData);
      console.log('Resposta do servidor:', response.data);
  
      inputName.current.value = '';
      inputAge.current.value = '';
      inputEmail.current.value = '';
      inputPassword.current.value = '';
  
      navigate('/login'); // redireciona após cadastro, se for o fluxo desejado
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      setError(error.response?.data?.error || "Erro ao cadastrar usuário");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="container">
      <form onSubmit={(e) => { e.preventDefault(); createUsers(); }}>
        <h1>Cadastro de Usuários</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <input placeholder="Nome" type="text" ref={inputName} required />
        <input placeholder="Idade" type="number" ref={inputAge} required min="1" />
        <input placeholder="Email" type="email" ref={inputEmail} required />
        <input placeholder="Senha" type="password" ref={inputPassword} required minLength="6" />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Processando...' : 'Cadastrar'}
        </button>
      </form>
      <p>
                Já tem uma conta?        
                <button onClick={() => navigate('/login')}>
                    Login
                </button>
            </p>
    </div>
  );
}

export default Cadastro;