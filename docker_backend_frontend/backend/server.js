require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const sequelize = require("./database_config/database");
const User = require("./database_config/user-model");
const app = express();
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const jwt = require("jsonwebtoken");

// Инициализация базы данных
const initializeDatabase = async (
    triesAmount = 3,
    currentTry = 0,
    tryInterval = 3000
) => {
    try {
        await sequelize.authenticate();
        console.log("⛓️ PostgreSQL connection established");

        await sequelize.sync({ force: false });
        console.log("✅ Database synchronized");
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        if (currentTry < triesAmount) {
            console.log(
                `⏳ Waiting ${tryInterval / 1000} seconds and trying again.`
            );
            console.log(`🔢 Tries remaining: ${triesAmount - currentTry}`);
            await new Promise((resolve) => setTimeout(resolve, tryInterval));
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
        secret: process.env.SESSION_SECRET || "fallback-secret",
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

// Настройка CORS
const cors = require("cors");
app.use(
    cors({
        origin: process.env.CLIENT_URL, // URL вашего фронтенда
        credentials: true,
    })
);

app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, business_sphere, region, desc, password } =
            req.body;

        // Валидация
        if (!(name && email && password && business_sphere != "none" && business_sphere && region != "none" && region && desc)) {
            return res.status(400).json({ error: "Не все поля заполнены" });
        }

        // Проверяем существует ли пользователь
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res
                .status(409)
                .json({ error: "Пользователь с такой почтой уже существует" });
        }
        if (password.length < 8) {
            return res
                .status(400)
                .json({ error: "Пароль должен содержать не менее 8 символов" });
        }

        // Создаем нового пользователя
        const newUser = await User.create({
            email,
            password: await bcrypt.hash(password, 10),
            name,
            business_sphere,
            region,
            desc,
            watchedOnboarding: false
        });

        // Генерация JWT токена
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            process.env.JWT_SECRET || "fallback-secret",
            { expiresIn: "24h" }
        );

        // Возвращаем данные без пароля
        res.status(201).json({
            message: "Пользователь успешно зарегистрирован",
            user: newUser,
            token,
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

app.get("/api/check", async (req, res) => {
    try {
        console.log("Connection checked");
        res.status(201).json({
            message: "Успешная проверка соединения с сервером",
        });
    } catch (error) {
        console.error("Server check error:", error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Валидация
        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "Не все поля заполнены" });
        }

        // Поиск пользователя в БД
        const user = await User.findOne({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: "Неверная почта или пароль" });
        }

        // Проверка пароля
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Неверная почта или пароль" });
        }

        // Генерация JWT токена
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({
            message: "Успешный вход",
            user: user,
            token,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

app.put("/api/user/update", async (req, res) => {
    try {
        const { id, name, email, business_sphere, region, desc, password } =
            req.body;
        // Находим пользователя
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        // Проверяем email на уникальность (если меняется)
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res
                    .status(409)
                    .json({ error: "Пользователь с такой почтой уже существует" });
            }
        }

        // Подготавливаем данные для обновления
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (business_sphere) updateData.business_sphere = business_sphere;
        if (region) updateData.region = region;
        if (desc) updateData.desc = desc;

        // Хешируем пароль если он предоставлен
        if (password) {
            if (password.length < 8) {
                return res
                    .status(400)
                    .json({ error: "Пароль должен содержать не менее 8 символов" });
            }
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Обновляем пользователя
        await user.update(updateData);

        // Получаем обновленного пользователя (без пароля)
        const updatedUser = await User.findByPk(id, {
            attributes: { exclude: ["password"] },
        });

        res.json({
            message: "Пользователь успешно обновлен",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Update user error:", error);

        if (error.name === "SequelizeUniqueConstraintError") {
            return res
                .status(409)
                .json({ error: "Пользователь с такой почтой уже существует" });
        }

        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({ error: error.errors[0].message });
        }

        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

app.put("/api/user/completeOnboarding", async (req, res) => {
    try {
        const id = req.body.id;

        // Находим пользователя
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        await user.update({ watchedOnboarding: true });

        // Получаем обновленного пользователя (без пароля)
        const updatedUser = await User.findByPk(id, {
            attributes: { exclude: ["password"] },
        });

        res.json({
            message: "Пользователь успешно обновлен",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Update user error:", error);

        if (error.name === "SequelizeUniqueConstraintError") {
            return res
                .status(409)
                .json({ error: "Пользователь с такой почтой уже существует" });
        }

        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({ error: error.errors[0].message });
        }

        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

app.get("/api/user/profile", authenticateToken, async (req, res) => {
    try {
        // Поиск пользователя в БД по ID из JWT токена
        const user = await User.findByPk(req.user.userId, {
            attributes: { exclude: ["password"] }, // Исключаем пароль
        });

        if (!user) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        res.json({
            user: user
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

if (process.env.NODE_ENV === "development") {
    app.get("/api/dev/users", async (req, res) => {
        try {
            const users = await User.findAll({
                order: [["createdAt", "DESC"]],
            });

            // Простой текстовый вывод
            let output = `USERS TABLE (${users.length} users)\n\n`;
            output +=
                "ID".padEnd(38) +
                "NAME".padEnd(20) +
                "EMAIL".padEnd(25) +
                "CREATED AT\n";
            output += "-".repeat(100) + "\n";

            users.forEach((user) => {
                output += `${user.id} | ${user.name.padEnd(
                    18
                )} | ${user.email.padEnd(
                    23
                )} | ${user.createdAt.toLocaleString()}\n`;
            });

            res.type("text/plain");
            res.send(output);
        } catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).json({ error: "Ошибка чтения списка пользователей" });
        }
    });
}

// Middleware для проверки JWT токена
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Необходим ключ доступа" });
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback-secret",
        (err, user) => {
            if (err) {
                return res
                    .status(403)
                    .json({ error: "Ключ доступа недействителен или просрочен" });
            }
            req.user = user;
            next();
        }
    );
}

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
