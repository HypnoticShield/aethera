const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const SECRET = "aethera_secret";

mongoose.connect('mongodb://localhost:27017/aethera')
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

app.post('/register', async (req, res) => {
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

app.post('/login', async (req, res) => {
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
        token
    });
});

app.get('/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

app.get('/', (req, res) => {
    res.send("Auth Service Running");
});

app.listen(3000, () => {
    console.log('Auth service running on port 3000');
});
