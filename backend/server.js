const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const session = require('express-session');
const mysql = require('mysql2/promise');  // Use a versão promise do mysql2 para trabalhar com async/await



const app = express();
const port = 5000; // ou o número de porta desejado
const bodyParser = require('body-parser');

app.use(cors());
app.use(express.json());

app.use(
    session({
      secret: 'suaChaveSecreta', // Substitua com uma chave secreta mais segura
      resave: false,
      saveUninitialized: true,
    })
  );

  app.use(bodyParser.json());

const mysqlConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'minigame_db',
};

const config = {
    user: 'CLT144398fin.paper',
    password: 'qpoux47325UAQKV!@',
    server: '45.6.155.110',
    port: 1129,
    database: 'CRQK4E_144398_PR_DV',
    options: {
        trustServerCertificate: true, // Adicione esta opção para aceitar certificados autoassinados
      },
};

const pool = mysql.createPool(mysqlConfig);


app.post('/authenticate', async (req, res) => {
    const { cpf } = req.body;
  
    try {
      await sql.connect(config);
      const result = await sql.query`SELECT RD0_NOME, RD0_CIC, RD0_FILIAL FROM RD0010 WHERE RD0_CIC = ${cpf} AND D_E_L_E_T_ = ''`;
  
      if (result.recordset.length > 0) {
        const authenticatedUser = result.recordset[0];
  
        // Armazenar informações do usuário na sessão
        req.session.user = authenticatedUser;
  
        res.status(200).json(authenticatedUser);
      } else {
        res.status(404).json({ error: 'Usuário não encontrado' });
      }
    } catch (error) {
      console.error('Erro ao autenticar usuário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    } finally {
      // Certifique-se de fechar a conexão após o uso
      sql.close();
    }
  });

  app.get('/user', (req, res) => {
    // Rota para obter informações do usuário a partir da sessão
    const user = req.session.user;
  
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(401).json({ error: 'Usuário não autenticado' });
    }
  });

  app.post('/saveSelections', async (req, res) => {
    try {
      const { userId, selectedValues, selectedNonValues } = req.body;
  
      // Use o userId (nome do usuário) como identificador único
      const result = await pool.query(
        'INSERT INTO user_selections (user_id, selected_values, selected_non_values) VALUES (?, ?, ?)',
        [userId, JSON.stringify(selectedValues), JSON.stringify(selectedNonValues)]
      );
  
      res.json({ success: true, message: 'Seleções salvas com sucesso!' });
    } catch (error) {
      console.error('Erro ao salvar seleções:', error);
      res.status(500).json({ success: false, message: 'Erro ao salvar seleções.' });
    }
  });

app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});
