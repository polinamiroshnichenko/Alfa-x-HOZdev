require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const sequelize = require('./database_config/database');
const User = require('./database_config/user-model');
const app = express();
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const jwt = require('jsonwebtoken');

// Инициализация базы данных
const initializeDatabase = async (triesAmount = 1, currentTry = 0, tryInterval = 10000) => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection established');
    
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    if (currentTry < triesAmount) {
        console.log(`⏳ Waiting ${tryInterval/1000} seconds and trying again.`)
        console.log(`⏳ Tries remaining: ${triesAmount - currentTry}`)
        await new Promise(resolve => setTimeout(resolve, tryInterval));
        initializeDatabase(triesAmount, currentTry + 1);    
    }
  }
};

initializeDatabase();

// Middleware
app.use(express.json()); // Добавьте это для парсинга JSON
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

// Настройка CORS
const cors = require('cors');
app.use(cors({
    origin: process.env.CLIENT_URL, // URL вашего фронтенда
    credentials: true
}));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Валидация
    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Проверяем существует ли пользователь
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Создаем нового пользователя
    const newUser = await User.create({
      email,
      password: await bcrypt.hash(password, 10),
      name
    });
    // Генерация JWT токена
    const token = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
    );

    // Возвращаем данные без пароля
    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        },
        token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/api/check", async (req, res) => {
    try {
        console.log("Connection checked")
        res.status(201).json({
            message: "Check successful",
        });

    } catch (error) {
        console.error('Check error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Валидация
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Поиск пользователя в БД
        const user = await User.findOne({ 
            where: { email } 
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Проверка пароля
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Генерация JWT токена
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/api/user/profile", authenticateToken, async (req, res) => {
    try {
        // Поиск пользователя в БД по ID из JWT токена
        const user = await User.findByPk(req.user.userId, {
            attributes: { exclude: ['password'] } // Исключаем пароль
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});



// Middleware для проверки JWT токена
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access token required" });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
}

app.listen(5000, () => {
    console.log('Server running on port 5000');
});