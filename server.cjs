const cors = require('cors');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger.cjs');
const cron = require("node-cron")
//import para fazer o token pra salvar score e palavras(mesmo anonimo)


// Configuração inicial
const prisma = new PrismaClient();
const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'seuSegredoSuperSecreto123';
const PORT = process.env.PORT || 3000;




const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let currentWord = {};

// Caminho para o arquivo dictionary.db
const dbPath = path.join(__dirname, 'dictionary.db');

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Conectando ao banco
const db = new sqlite3.Database('dictionary.db', async (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err.message);
  } else {
    console.log('Conectado ao banco dictionary.db');
    const findFirst = await prisma.word.findFirst();
    if (!findFirst) {
      const query = `
      SELECT word, wordtype, definition 
      FROM entries 
      WHERE LENGTH(word) = 5
      ORDER BY RANDOM() 
      LIMIT 1
    `;

      db.get(query, [], async (err, row) => {
        if (err) {
          console.error('Erro ao buscar palavra:', err.message);
        } else {
          const word = await prisma.word.create({
            data: {
              word: row["word"],
              definitions: [row["definition"]]
            }, select: {
              id: true,
              word: true,
              definitions: true
            }
          })
          currentWord = word
        }
      });
    } else {
      const lastWord = await prisma.word.findFirst({
        orderBy: {
          id: 'desc',
        }
      });
      currentWord = lastWord;
    }
  }
});




/**
 * @swagger
 * /auth/guest:
 *   post:
 *     summary: Gera um token para um usuário visitante
 *     tags: [Autenticação]
 *     responses:
 *       200:
 *         description: Token gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 */
//rota pra gerar o token anonimo e retorna para o front
app.post('/auth/guest', async (req, res) => {

  const user = await prisma.user.create({
    data: {
      score: 0
    },
    select: {
      id: true,
      email: false,
      name: false,
      score: true,
      createdAt: true
    }
  });
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1y' });
  res.json({ token });
});



const { translate } = require('@vitalets/google-translate-api');
const { json } = require('stream/consumers');

async function toPortuguese(rawText) {
  try{
  const { text } = await translate(rawText, { to: 'pt' });
  return text;
  }catch(error){
    return rawText;
  }

}




cron.schedule("10 39 7 * * *", () => {
  const query = `
  SELECT word, wordtype, definition 
  FROM entries 
  WHERE LENGTH(word) = 5
  ORDER BY RANDOM() 
  LIMIT 1
`;

  db.get(query, [], async (err, row) => {
    if (err) {
      console.error('Erro ao buscar palavra:', err.message);
    } else {

      const definitions = []

      const allResults = await new Promise((resolve, reject) => {
        db.all("SELECT word, definition FROM entries WHERE word = ?", [row["word"]], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
      for (let i = 0; i < allResults.length; i++) {
        const def = await toPortuguese(allResults[i]["definition"].replace("\n", "").replace("  ", " "));
        definitions.push(def);
      }
      const word = await prisma.word.create({
        data: {
          word: row["word"],
          definitions: definitions
        }, select: {
          id: true,
          word: true,
          definitions: true
        }
      })
      currentWord = word
    }
  });
})



//swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middlewares
app.use(express.json());

// Validações
const validateUser = [
  body('email').isEmail().normalizeEmail(),
  body('name').notEmpty().trim(),
  body('password').isLength({ min: 6 })
];


/**
 * @swagger
 * /random-word:
 *   get:
 *     summary: Retorna uma palavra aleatória de 5 letras do dicionário
 *     tags: [Dicionário]
 *     responses:
 *       200:
 *         description: Palavra retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 word:
 *                   type: string
 *       500:
 *         description: Erro ao buscar a palavra
 */
// Rota para palavra aleatória
app.get('/random-word', (req, res) => {
  const query = `
    SELECT word, wordtype, definition 
    FROM entries 
    WHERE LENGTH(word) = 5
    ORDER BY RANDOM() 
    LIMIT 1
  `;

  db.get(query, [], (err, row) => {
    if (err) {
      console.error('Erro ao buscar palavra:', err.message);
      return res.status(500).json({ error: 'Erro ao buscar palavra' });
    }

    res.json(row);
  });
});

app.get("/todays-word", (req, res) => {
  res.json(currentWord);
});

app.get("/:word/is-a-word", async (req, res) => {
  const query = `
    SELECT word, wordtype, definition 
    FROM entries 
    WHERE word = '${req.params.word.toLowerCase()}'
    LIMIT 1
  `;

  db.get(query, [], (err, row) => {
    if (err) {
      console.error('Erro ao buscar palavra:', err.message);
      return res.status(500).json({ error: 'Erro ao buscar palavra' });
    }
    if (row == undefined) {
      res.json({ isWord: false })
    } else {
      res.json({ isWord: true })
    }

  });
});




/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verifica se o servidor está online
 *     responses:
 *       200:
 *         description: Servidor rodando corretamente
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *               score:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Erros de validação
 *       409:
 *         description: Email já cadastrado
 */
app.post('/users', validateUser, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, name, password, score = 0 } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email já cadastrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        score: Number(score)
      },
      select: {
        id: true,
        email: true,
        name: true,
        score: true,
        createdAt: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      error: "Erro ao criar usuário",
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

app.post("/play", async (req, res) => {

  try {
    const { token, word, attempt } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Token é obrigatório." });
    }
    if (!word) {
      return res.status(400).json({ error: "a palavra é obrigatória." });
    }
    if (!attempt) {
      return res.status(400).json({ error: "o numero da tentativa é obrigatório." });
    }
    const decoded = jwt.verify(token, JWT_SECRET);

    const userId = decoded.id;

    const gameAttempt = await prisma.gameAttempt.create({
       data: {
         userId: userId,
         wordId : currentWord.id,
         attempts : attempt,
         score:0,
         guess:word
        } 
      })
      return res.status(200).json(gameAttempt);
  } catch (error) {
    if (error) {
      return res.status(500).json({ error: "algo deu errado" });
    }
  }

})


app.get("/played", async (req, res)=>{
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ error: "Token é obrigatório." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const userId = decoded.id;

    const rows = await prisma.gameAttempt.findMany({where:{userId:userId, wordId:currentWord.id}})
      return res.status(200).json(rows);
  } catch (error) {
    if (error) {
      console.log(error)
      return res.status(500).json({ error: "algo deu errado" });
    }
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Realiza login de um usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *       400:
 *         description: Campos obrigatórios ausentes
 *       401:
 *         description: Credenciais inválidas
 */
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign({
      id: user.id,
      email: user.email
    }, JWT_SECRET, { expiresIn: '1h' });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword,
      expiresIn: 3600
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *       401:
 *         description: Token ausente
 *       403:
 *         description: Token inválido ou expirado
 */

// Middleware de autenticação JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.sendStatus(401); // Sem token

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Erro ao verificar token JWT:', err);
      return res.status(403).json({ error: "Token inválido ou expirado" });
    }
    req.user = user; // Adiciona o usuário à requisição
    next(); // Continua para a próxima função/middleware
  });
}

app.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        score: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Tratamento de erros
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});