import { useEffect } from 'react';
import './game.css';

export default function Game() {
  useEffect(() => {
    const checkAndCreateToken = async () => {
      
      const token = localStorage.getItem('token');
      
      // Verificação mais robusta
      if (!token || token === 'undefined' || token === 'null' || token.length < 10) {
        try {
          const response = await fetch('http://localhost:3000/auth/guest', {
            method: 'POST',
          });
          
          if (!response.ok) {
            throw new Error('Erro na resposta da API');
          }
          
          const data = await response.json();
          
          if (data.token) {
            localStorage.setItem('token', data.token);
            console.log('✅ Token criado e salvo:', data.token);
          } else {
            console.error('❌ A API não retornou um token válido');
          }
        } catch (err) {
          console.error('❌ Erro ao gerar token:', err);
        }
      } else {
        const response = await fetch('http://localhost:3000/played?token='+token);
        const data = await response.json();
        window.words = data;
      }
    };

    checkAndCreateToken();

    // Carrega o script do jogo
    setTimeout(()=>{
      const script = document.createElement('script');
      script.src = "/js/script.js";
      script.async = true;
      document.body.appendChild(script);
  
      return () => {
        document.body.removeChild(script);
      };
    }, 10)

  }, []);

  return (
    <main id="game">
      <section id="board"></section>
      <section id="keyboard"></section>
      <section id="finished"></section>
    </main>
  );
}