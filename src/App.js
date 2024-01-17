import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import fotoImage from './imgs/logo.png';
// import fotoImage from './imgs/FLUIG-01.png';


const App = () => {
  const [cpf, setCpf] = useState('');
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [values, setValues] = useState([]);
  const [nonValues, setNonValues] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [selectedNonValues, setSelectedNonValues] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

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
    "Encorajamento",
    "Engajamento dos colaboradores",
    "Ética",
    "Excelência",
    "Fazer a diferença",
    "Fazer com Qualidade",
    "Honestidade",
    "Igualdade",
    "Imparcialidade",
    "Iniciativa",
    "Inovação",
    "Integridade",
    "Melhoria contínua",
    "Parceria",
    "Proatividade",
    "Reconhecimento dos colaboradores",
    "Resiliência",
    "Respeito",
    "Responsabilidade socioambiental",
    "Satisfação do cliente",
    "Segurança",
    "Trabalho em equipe",
    "Transparência",
    "União",
    "Valoriza a diversidade",
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
    "Encorajamento",
    "Engajamento dos colaboradores",
    "Ética",
    "Excelência",
    "Fazer a diferença",
    "Fazer com Qualidade",
    "Honestidade",
    "Igualdade",
    "Imparcialidade",
    "Iniciativa",
    "Inovação",
    "Integridade",
    "Melhoria contínua",
    "Parceria",
    "Proatividade",
    "Reconhecimento dos colaboradores",
    "Resiliência",
    "Respeito",
    "Responsabilidade socioambiental",
    "Satisfação do cliente",
    "Segurança",
    "Trabalho em equipe",
    "Transparência",
    "União",
    "Valoriza a diversidade",
  ];

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('authenticatedUser'));
    if (storedUser) {
      setAuthenticatedUser(storedUser);
    }
    fetchValues();
    fetchNonValues();
  }, []);

  // Função para exibir o modal com as instruções
  const showInstructions = () => {
    setShowInstructionsModal(true);
  };


  const authenticateUser = async () => {
    try {
      const response = await axios.post('http://localhost:5000/authenticate', { cpf });
      const responseData = response.data;
  
      if (responseData.error) {
        // Exibe a mensagem de erro se o usuário não for encontrado
        setErrorMessage('Usuário não encontrado. Verifique o CPF e tente novamente.');
        return;
      }
  
      if (responseData.message === '2') {
        // Mostra a mensagem e impede o usuário de continuar
        setErrorMessage('Pesquisa já realizada pelo seu CPF.');
        return;
      }
  
      const authenticatedUser = responseData;
      setErrorMessage('');
      setAuthenticatedUser(authenticatedUser);
      localStorage.setItem('authenticatedUser', JSON.stringify(authenticatedUser));
  
      showInstructions();
    } catch (error) {
      console.error('Erro ao autenticar usuário:', error);
      setErrorMessage('Erro ao autenticar usuário. Por favor, tente novamente.');
    }
  };
  


  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/logout');
      setAuthenticatedUser(null);
      localStorage.removeItem('authenticatedUser');
    } catch (error) {
      console.error('Erro ao realizar logout:', error);
    }
  };

  window.addEventListener('beforeunload', () => {
    logout();
  });

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
      // Verifica se há exatamente 6 frases de valor e 6 frases de não valor selecionadas
      if (selectedValues.length !== 6 || selectedNonValues.length !== 6) {
        alert('Por favor, escolha exatamente 6 frases de valor e 6 frases de não valor.');
        return;
      }

      // Envia os dados para o backend
      const response = await axios.post('http://localhost:5000/saveSelections', {
        userId: authenticatedUser.RD0_NOME,
        cpfId: authenticatedUser.RD0_CIC,
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
      <header className="App-header with-background">
        {authenticatedUser ? (
          <div>
            <h2>Bem-vindo(a), {authenticatedUser.RD0_NOME}!</h2>
            {/* <p>Filial: {authenticatedUser.RD0_FILIAL}</p> */}
            <p>CPF: {authenticatedUser.RD0_CIC}</p>

            <div className="container">
              <div className="row">
                <div className="panel">
                  <h3>Escolha 6 frases de <strong>valores</strong> que <strong>melhor</strong> refletem o dia a dia no seu ambiente de trabalho</h3>
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
                            backgroundColor: isSelected ? 'rgba(255, 2, 2, 0.562), 76, 76)' : isDisabled ? '#e0e0e0' : '#f2f2f2',
                            color: isSelected ? '#fff' : '',
                          }}
                        >
                          {phrase}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Botão de Ancora para o Final da Página */}
              <button
                className="scroll-to-bottom-button"
                onClick={() => {
                  const scrollHeight = document.documentElement.scrollHeight;
                  window.scrollTo({
                    top: scrollHeight,
                    behavior: 'smooth',
                  });
                }}
              >
                <strong>Ir para a segunda etapa</strong>
              </button>

              <div className="container">
                <div className="panel">
                  <h3>Frases Selecionadas de Valores  que <strong>melhor</strong> refletem o dia a dia no seu ambiente trabalho</h3>
                  <ul className="resultado">
                    {selectedValues.map((phrase, index) => (
                      <li key={index}>{phrase}</li>
                    ))}
                  </ul>
                </div>

                <div className="panel">
                  <h3>Escolha 6 frases de <strong>valores</strong> que <strong>não</strong> refletem no seu dia a dia de trabalho</h3>
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
                            backgroundColor: isSelected ? 'rgba(255, 2, 2, 0.562), 76, 76)' : isDisabled ? '#e0e0e0' : '#f2f2f2', color: isSelected ? '#fff' : '',
                          }}
                        >
                          {phrase}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="panel">
                  <h3>Frases Selecionadas de Valores que NÃO refletem no seu dia a dia de trabalho</h3>
                  <ul className="resultado">
                    {selectedNonValues.map((phrase, index) => (
                      <li key={index}>{phrase}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="panel">
                <button
                  onClick={insertData}
                  className="insert-button"  /* Adiciona a classe do botão */
                >
                  Enviar e finalizar
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

            <div className={`success-modal ${showInstructionsModal ? 'show' : 'hide'}`}>
              <p>
                <strong>"Os colaboradores deverão escolher 6 palavras (Valores) que MELHOR refletem o dia a dia
                  no seu ambiente ou local de trabalho e 6 palavras (Valores) que NÃO refletem no seu dia a dia."</strong>
              </p>
              <button onClick={() => setShowInstructionsModal(false)} className="insert-button">
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <div className="validation-screen">
            <div className="validation-form">
              <div className="logo-container">
                <img src={fotoImage} alt="Logo" className="logo" />
              </div>
              <h2 className="auth-title">Pesquisa de Valores</h2>
              <div className="input-container">
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <label className="cpf-label">Utilize seu <strong>CPF</strong> para entrar (Apenas numeros)</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="cpf-input"
                />
              </div>
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
