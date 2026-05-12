require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

app.use(cors());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aethera')
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    subscription: String,
    watchHistory: [String]
});

const User = mongoose.model('User', userSchema);

// Removed for S3 migration
// app.use('/videos', express.static(path.join(__dirname, '../videos')));

app.get('/api/streaming/stream/:movie', async (req, res) => {
    const movie = req.params.movie;
    const username = req.query.username;

    if (username) {
        await User.findOneAndUpdate(
            { username },
            { $push: { watchHistory: movie } }
        );
    }

    const s3BaseUrl = process.env.S3_BASE_URL || 'https://aethera-media-bucket.s3.amazonaws.com';
    res.redirect(`${s3BaseUrl}/videos/${movie}`);
});

app.get('/api/streaming', (req, res) => {
    res.send('Streaming Service Running');
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Streaming service running on port ${PORT}`);
});
