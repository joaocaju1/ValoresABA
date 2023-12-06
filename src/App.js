import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import fotoImage from './imgs/foto.jpg';


const App = () => {
  const [cpf, setCpf] = useState('');
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [values, setValues] = useState([]);
  const [nonValues, setNonValues] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [selectedNonValues, setSelectedNonValues] = useState([]);

  const valueList = [
    "Aprendizagem contínua",
    "Atingir Objetivos",
    "Atitude Positiva",
    "Bem estar (físico, emocional, mental e espiritual)",
    "Colaboração com o cliente",
    "Comprometimento",
    "Comunicação aberta",
    "Confiança",
    "Cooperação",
    "Crescimento profissional",
    "Criatividade",
    "Desenvolvimento da liderança",
    "Desenvolvimento de pessoas",
    "Determinação",
    "Eficiência",
    "Ética",
    "Excelência",
    "Fazer a diferença",
    "Fazer com Qualidade",
    "Honestidade",
    "Imparcialidade",
    "Iniciativa",
    "Melhoria contínua",
    "Reconhecimento dos colaboradores",
    "Respeito",
    "Satisfação do cliente",
    "Segurança",
    "Trabalho em equipe",
    "Transparência",
    "Valoriza a diversidade"
  ];

  const nonValueList = [
    "Aprendizagem contínua",
    "Atingir Objetivos",
    "Atitude Positiva",
    "Bem estar (físico, emocional, mental e espiritual)",
    "Colaboração com o cliente",
    "Comprometimento",
    "Comunicação aberta",
    "Confiança",
    "Cooperação",
    "Crescimento profissional",
    "Criatividade",
    "Desenvolvimento da liderança",
    "Desenvolvimento de pessoas",
    "Determinação",
    "Eficiência",
    "Ética",
    "Excelência",
    "Fazer a diferença",
    "Fazer com Qualidade",
    "Honestidade",
    "Imparcialidade",
    "Iniciativa",
    "Melhoria contínua",
    "Reconhecimento dos colaboradores",
    "Respeito",
    "Satisfação do cliente",
    "Segurança",
    "Trabalho em equipe",
    "Transparência",
    "Valoriza a diversidade"
  ];

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('authenticatedUser'));
    if (storedUser) {
      setAuthenticatedUser(storedUser);
    }
    fetchValues();
    fetchNonValues();
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

  const fetchValues = () => {
    setValues(valueList);
  };

  const fetchNonValues = () => {
    setNonValues(nonValueList);
  };



  const togglePhraseSelection = (phrase, panel) => {
    if (panel === 'values') {
      setSelectedValues((prevSelectedValues) => {
        if (prevSelectedValues.includes(phrase)) {
          return prevSelectedValues.filter((item) => item !== phrase);
        } else if (prevSelectedValues.length < 6 && !selectedNonValues.includes(phrase)) {
          return [...prevSelectedValues, phrase];
        }
        return prevSelectedValues;
      });
    } else if (panel === 'nonValues') {
      setSelectedNonValues((prevSelectedNonValues) => {
        if (prevSelectedNonValues.includes(phrase)) {
          return prevSelectedNonValues.filter((item) => item !== phrase);
        } else if (prevSelectedNonValues.length < 6 && !selectedValues.includes(phrase)) {
          return [...prevSelectedNonValues, phrase];
        }
        return prevSelectedNonValues;
      });
    }
  };

  const isPhraseDisabled = (phrase, panel) => {
    if (panel === 'values') {
      return selectedValues.includes(phrase) || selectedNonValues.includes(phrase);
    } else if (panel === 'nonValues') {
      return selectedValues.includes(phrase) || selectedNonValues.includes(phrase);
    }
    return false;
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const insertData = async () => {
    try {
      // Verifica se há frases selecionadas
      if (selectedValues.length === 0 && selectedNonValues.length === 0) {
        alert('Selecione pelo menos uma frase de valor ou não valor.');
        return;
      }

      // Envia os dados para o backend
      const response = await axios.post('http://localhost:5000/saveSelections', {
        userId: authenticatedUser.RD0_NOME,
        selectedValues,
        selectedNonValues,
      });

      // Limpa as frases selecionadas após a inserção
      setSelectedValues([]);
      setSelectedNonValues([]);

      console.log('Dados inseridos com sucesso:', response.data);

      // Exibe a tela de sucesso
      setShowSuccessModal(true);

      // Fecha o modal de sucesso após 3 segundos
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);

      // Desloga o usuário após 4 segundos
      setTimeout(() => {
        logout();
      }, 4000);
    } catch (error) {
      console.error('Erro ao inserir dados:', error);
    }
  };

  

  return (
    <div className="App">
      <header className="App-header">
        {authenticatedUser ? (
          <div>
            <h2>Bem-vindo(a), {authenticatedUser.RD0_NOME}!</h2>
            {/* <p>Filial: {authenticatedUser.RD0_FILIAL}</p> */}
            <p>CPF: {authenticatedUser.RD0_CIC}</p>
          

            <div className="container">
              <div className="row">
                <div className="panel">
                  <h3>Frases de Valores</h3>
                  <ul className="phrase-list">
                    {values.map((phrase, index) => {
                      const isSelected = selectedValues.includes(phrase);
                      const isDisabled = isPhraseDisabled(phrase, 'values');

                      return (
                        <li
                          key={index}
                          onClick={() => togglePhraseSelection(phrase, 'values')}
                          className={`phrase-item ${isSelected ? 'selected' : ''}`}
                          style={{
                            backgroundColor: isSelected ? '#007bff' : isDisabled ? '#e0e0e0' : '#f2f2f2',
                            color: isSelected ? '#fff' : '',
                          }}
                        >
                          {phrase}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* <div className="panel">
                  <h3>Frases Selecionadas de Valores</h3>
                  <ul className="phrase-list">
                    {selectedValues.map((phrase, index) => (
                      <li key={index}>{phrase}</li>
                    ))}
                  </ul>
                </div> */}

                <div className="panel">
                  <h3>Frases de Não Valores</h3>
                  <ul className="phrase-list">
                    {nonValues.map((phrase, index) => {
                      const isSelected = selectedNonValues.includes(phrase);
                      const isDisabled = isPhraseDisabled(phrase, 'nonValues');

                      return (
                        <li
                          key={index}
                          onClick={() => togglePhraseSelection(phrase, 'nonValues')}
                          className={`phrase-item ${isSelected ? 'selected' : ''}`}
                          style={{
                            backgroundColor: isSelected ? '#007bff' : isDisabled ? '#e0e0e0' : '#f2f2f2',
                            color: isSelected ? '#fff' : '',
                          }}
                        >
                          {phrase}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* <div className="panel">
                  <h3>Frases Selecionadas de Não Valores</h3>
                  <ul className="phrase-list">
                    {selectedNonValues.map((phrase, index) => (
                      <li key={index}>{phrase}</li>
                    ))}
                  </ul>
                </div> */}
              </div>
              <div className="panel">
              <button
                  onClick={insertData}
                  className="insert-button"  /* Adiciona a classe do botão */
                >
                  Inserir no Banco de Dados
                </button>
                </div>

                {/* Modal de sucesso */}
            <div className={`success-modal ${showSuccessModal ? 'show' : 'hide'}`}>
              <p>Dados enviados com sucesso!</p>
            </div>

            {/* Fundo escuro do modal
            <div
              className={`overlay ${showSuccessModal ? 'show' : 'hide'}`}
              onClick={() => setShowSuccessModal(false)}
            ></div> */}
            </div>
          </div>
        ) : (
          <div className="validation-screen">
            <div className="validation-form">
              <div className="logo-container">
              <img src={fotoImage} alt="Logo" className="logo" />


              </div>
              <h2>Tela de Autenticação</h2>
              <label className="cpf-label">CPF:</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="cpf-input"
                />
                <button onClick={authenticateUser} className="auth-button">
                  Autenticar
                </button>
              </div>
          </div>
        )}
      </header>
    </div>
  );
};

export default App;
