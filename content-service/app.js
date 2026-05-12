require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

app.use(cors());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aethera_content')
.then(() => console.log('Content DB connected'))
.catch(err => console.log(err));

const movieSchema = new mongoose.Schema({
    title: String,
    genre: String,
    videoFile: String,
    thumbnailFile: String,
    rating: { type: Number, default: 0 },
    description: String
});

const Movie = mongoose.model('Movie', movieSchema);

// Removed for S3 migration
// app.use('/thumbnails', express.static(path.join(__dirname, '../thumbnails')));

app.get('/api/content/movies', async (req, res) => {
    const movies = await Movie.find();
    const s3BaseUrl = process.env.S3_BASE_URL || 'https://aethera-media-bucket.s3.amazonaws.com';
    const moviesWithS3 = movies.map(m => ({
        ...m._doc,
        thumbnailUrl: `${s3BaseUrl}/thumbnails/${m.thumbnailFile}`
    }));
    res.json(moviesWithS3);
});

app.get('/api/content', (req, res) => {
    res.send("Content Service Running");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Content service running on port ${PORT}`);
});
