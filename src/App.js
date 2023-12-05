import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [cpf, setCpf] = useState('');
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [values, setValues] = useState([]);
  const [nonValues, setNonValues] = useState([]);

  useEffect(() => {
    // Verificar se o usuário está autenticado ao carregar a página
    const storedUser = JSON.parse(localStorage.getItem('authenticatedUser'));
    if (storedUser) {
      setAuthenticatedUser(storedUser);
    }
  }, []);

  const authenticateUser = async () => {
    try {
      const response = await axios.post('http://localhost:5000/authenticate', { cpf });

      const authenticatedUser = response.data;
      setAuthenticatedUser(authenticatedUser);
      localStorage.setItem('authenticatedUser', JSON.stringify(authenticatedUser));
    } catch (error) {
      console.error('Erro ao autenticar usuário:', error);
    }
  };

  const logout = () => {
    setAuthenticatedUser(null);
    localStorage.removeItem('authenticatedUser');
  };

  const fetchValues = async () => {
    try {
      const response = await axios.get('http://localhost:5000/values');
      setValues(response.data);
    } catch (error) {
      console.error('Erro ao obter frases de valores:', error);
    }
  };

  const fetchNonValues = async () => {
    try {
      const response = await axios.get('http://localhost:5000/nonvalues');
      setNonValues(response.data);
    } catch (error) {
      console.error('Erro ao obter frases de não valores:', error);
    }
  };

  const selectPhrase = (phrase, panel) => {
    // Adicionar a frase selecionada ao painel correspondente
    if (panel === 'values') {
      setValues((prevValues) => [...prevValues, phrase]);
    } else if (panel === 'nonValues') {
      setNonValues((prevNonValues) => [...prevNonValues, phrase]);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {authenticatedUser ? (
          <div>
            <h2>Bem-vindo, {authenticatedUser.RD0_NOME}!</h2>
            <p>Filial: {authenticatedUser.RD0_FILIAL}</p>
            <p>CPF: {authenticatedUser.RD0_CIC}</p>
            <button onClick={logout}>Logout</button>
            <div>
              <h3>Frases de Valores</h3>
              <button onClick={fetchValues}>Carregar Frases de Valores</button>
              <ul>
                {values.map((phrase, index) => (
                  <li key={index}>
                    {phrase}{' '}
                    <button onClick={() => selectPhrase(phrase, 'values')}>Selecionar</button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Frases de Não Valores</h3>
              <button onClick={fetchNonValues}>Carregar Frases de Não Valores</button>
              <ul>
                {nonValues.map((phrase, index) => (
                  <li key={index}>
                    {phrase}{' '}
                    <button onClick={() => selectPhrase(phrase, 'nonValues')}>Selecionar</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div>
            <h2>Tela de Autenticação</h2>
            <label>CPF:</label>
            <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} />
            <button onClick={authenticateUser}>Autenticar</button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
