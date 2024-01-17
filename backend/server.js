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
    secret: 'suaChaveSecreta',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 5000, // Tempo em milissegundos (5 segundos)
      expires: new Date(Date.now() + 5000), // Expira em 5 segundos
    },
  })
);  


  app.use(bodyParser.json());

const mysqlConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'climaadonai',
};

const config = {
    user: 'CLT138102fin.paper',
    password: 'inzow54823RADPM@!',
    server: '45.6.155.211',
    port: 37000,
    database: 'CRQK4E_138102_PR_PD',
    options: {
        trustServerCertificate: true, // Adicione esta opção para aceitar certificados autoassinados
      },
};

const pool = mysql.createPool(mysqlConfig);


app.post('/authenticate', async (req, res) => {
    const { cpf } = req.body;
  
    try {

       // Conectar ao MySQL
    const connection = await mysql.createConnection(mysqlConfig);

    // Consultar o campo selections_completed
    const [rows] = await connection.query(
      'SELECT selections_completed, cpf_id FROM user_selections WHERE cpf_id = ?',
      [cpf]
    );
    if (rows.length > 0 && rows[0].selections_completed === 1) {
      return res.status(200).json({ message: '2' });
    }
    

    await sql.connect(config);
    const result = await sql.query`SELECT TOP(1) RD0_NOME, RD0_CIC, RD0_FILIAL FROM 
    (
    SELECT 
    DISTINCT RA_NOME RD0_NOME, RA_CIC RD0_CIC, RA_FILIAL RD0_FILIAL,
    ROW_NUMBER() OVER (PARTITION BY RA_NOME, RA_CIC ORDER BY (SELECT NULL)) AS RowNum
    FROM SRA010
    WHERE D_E_L_E_T_ = '' AND RA_DEMISSA = '' AND RA_MSBLQL <> '1'
    
    UNION ALL
    
    SELECT
    DISTINCT A2_NOME RD0_NOME, A2_CGC RD0_CIC, '0101' RD0_FILIAL,
    ROW_NUMBER() OVER (PARTITION BY A2_NOME, A2_CGC ORDER BY (SELECT NULL)) AS RowNum
    FROM SA2010
    WHERE D_E_L_E_T_ = '' AND A2_MSBLQL <> '1' AND A2_XCOD = ''
    ) SRA
    WHERE RowNum = '1' AND RD0_CIC = ${cpf}`;
  
    if (result.recordset.length > 0) {
      const authenticatedUser = result.recordset[0];
    
      // Armazenar informações do usuário na sessão
      req.session.user = authenticatedUser;
    
      res.status(200).json(authenticatedUser);
    } else {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return; // Adicione esta linha para garantir que a função encerre aqui
    }
  // Certifique-se de fechar a conexão após o uso
      if (connection) {
        await connection.end();
      }
    res.status(200).json(/* Dados do usuário */);
  } catch (error) {
    console.error('Erro ao autenticar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});



app.get('/user', (req, res) => {
  const user = req.session.user;

  if (user) {
    if (user.selections_completed === 1) {
      return res.status(401).json({ error: 'Usuário já fez as seleções' });
    }

    res.status(200).json(user);
  } else {
    res.status(401).json({ error: 'Usuário não autenticado' });
  }
});


  app.post('/saveSelections', async (req, res) => {
    let connection; // Declare a variável connection fora do bloco try
  
    try {
      // Obtenha os dados da requisição
      const { userId,cpfId, selectedValues, selectedNonValues } = req.body;
  
      // Crie uma conexão com o MySQL
      connection = await mysql.createConnection(mysqlConfig);
  
      // Inicie uma transação
      await connection.beginTransaction();
  
      console.log(cpfId)
      // Insira os dados na tabela user_selections
      await connection.query(
        'INSERT INTO user_selections (user_id, selected_values, selected_non_values, selections_completed, cpf_id) VALUES (?, ?, ?, ?, ?)',
        [userId, JSON.stringify(selectedValues), JSON.stringify(selectedNonValues),1, cpfId]
      );
  
            // // Atualize o campo selections_completed para 1
            // await connection.query(
            //   'UPDATE user_selections SET selections_completed = 1 WHERE user_id = ?',
            //   [userId]
            // );
        
      // Commit da transação
      await connection.commit();
  
      // Envie a resposta de sucesso
      res.json({ success: true, message: 'Seleções salvas com sucesso!' });
    } catch (error) {
      // Rollback da transação em caso de erro
      if (connection) {
        await connection.rollback();
      }
      console.error('Erro ao salvar seleções:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    } finally {
      // Feche a conexão após o uso
      if (connection) {
        await connection.end();
      }
    }
  });
  
  app.post('/logout', (req, res) => {
    // Destrua a sessão
    req.session.destroy((err) => {
      if (err) {
        console.error('Erro ao encerrar a sessão:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
      } else {
        if (req.session) {
          req.session.save(); // Salve a sessão após destruí-la
        }
        res.status(200).json({ success: true, message: 'Sessão encerrada com sucesso' });
      }
    });
  });




app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});
