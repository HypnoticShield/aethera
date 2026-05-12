require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const SECRET = process.env.JWT_SECRET || "aethera_secret";

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aethera')
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    subscription: {
        type: String,
        default: "Basic"
    },
    watchHistory: {
        type: [String],
        default: []
    }
});

const User = mongoose.model('User', userSchema);

app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;

    const user = new User({
        username,
        password
    });

    await user.save();

    res.json({
        message: "User registered successfully"
    });
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username, password });

    if (!user) {
        return res.status(401).json({
            message: "Invalid credentials"
        });
    }

    const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });

    res.json({
        message: "Login successful",
        token,
        subscription: user.subscription
    });
});

app.get('/api/auth/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

app.get('/api/auth', (req, res) => {
    res.send("Auth Service Running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
});
