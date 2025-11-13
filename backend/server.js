if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const bcrypt = require("bcrypt");
const initializePassport = require("./passport-config");
const app = express();
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const jwt = require('jsonwebtoken');

initializePassport(
    passport,
    (email) => users.find((user) => user.email === email),
    (id) => users.find((user) => user.id === id)
);

const users = [
    {
        id: "1762881966080",
        name: "w",
        email: "w@w",
        password: "$2b$10$UCJsVfxbPqyvj6kXQooece/WjM1foahOHz9Ivsp7m2LX7kI028GrO",
    },
];

// Middleware
// app.set("view-engine", "ejs");
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

const cors = require('cors');

// Настройка CORS
app.use(cors({
    origin: 'http://localhost:5176', // URL вашего фронтенда
    credentials: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

// CORS для фронтенда
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.header('Access-Control-Allow-Credentials', 'true');
//     next();
// });

// API Routes (для React фронтенда)
app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Валидация
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Проверка существующего пользователя
        const existingUser = users.find((user) => user.email === email);
        if (existingUser) {
            return res.status(409).json({ error: "User with this email already exists" });
        }

        // Хеширование пароля
        const hashedPass = await bcrypt.hash(password, 10);
        
        // Создание пользователя
        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            password: hashedPass,
        };
        users.push(newUser);

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
        res.status(500).json({ error: "Internal server error" });
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

        // Поиск пользователя
        const user = users.find((user) => user.email === email);
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
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'fallback-secret',
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

// Защищенный API маршрут
app.get("/api/user/profile", authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.userId);
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

app.listen(3000, () => {
    console.log('Server running on port 3000');
});