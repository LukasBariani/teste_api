import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Helmet } from 'react-helmet-async'; 
import "./login.css";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/login', { email, password });
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            navigate('/game'); // Redireciona apenas após login bem-sucedido
        } catch (error) {
            console.error('Erro no login:', error);
            
            // Mensagens de erro mais específicas
            if (error.response) {
                setError(error.response.data.error || 'Erro ao fazer login');
            } else {
                setError('Não foi possível conectar ao servidor');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
        <Helmet>
                <title>Login</title>
        </Helmet>
            <form onSubmit={handleLogin}>
                <h2>Login</h2>
                
                {error && <div className="error-message">{error}</div>}
                
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                
                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                
                <button type="submit" disabled={loading} id='entrar'>
                    {loading ? 'Carregando...' : 'Entrar'}
                </button>
            </form>
            <p>
                Não tem uma conta? 
                <button onClick={() => navigate('/cadastro')}>
                    Cadastre-se
                </button>
            </p>
        </div>
    );
}

export default Login;