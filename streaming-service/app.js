const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

app.use(cors());

mongoose.connect('mongodb://localhost:27017/aethera')
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    subscription: String,
    watchHistory: [String]
});

const User = mongoose.model('User', userSchema);

app.use('/videos', express.static(path.join(__dirname, '../videos')));

app.get('/stream/:movie', async (req, res) => {
    const movie = req.params.movie;
    const username = req.query.username;

    if (username) {
        await User.findOneAndUpdate(
            { username },
            { $push: { watchHistory: movie } }
        );
    }

    res.sendFile(path.join(__dirname, '../videos', movie));
});

app.get('/', (req, res) => {
    res.send('Streaming Service Running');
});

app.listen(3003, () => {
    console.log('Streaming service running on port 3003');
});
