import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from "./pages/login";
import Cadastro from './pages/cadastro';
import Game from './pages/game'; // Importe o novo componente
import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <Routes>
      {/* Rota raiz - mostra diretamente o login sem redirecionamento */}
      <Route path="/" element={<Game />} />
      
      {/* Demais rotas */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/game" element={<Game />} /> {/* Nova rota para o jogo */}
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <HelmetProvider>
          <App />
      </HelmetProvider>
    </BrowserRouter>
  </React.StrictMode>
);