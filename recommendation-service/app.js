require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());

// Dual connections
const aetheraConn = mongoose.createConnection(process.env.MONGO_URI || 'mongodb://localhost:27017/aethera');
const contentConn = mongoose.createConnection(process.env.MONGO_CONTENT_URI || 'mongodb://localhost:27017/aethera_content');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    subscription: String,
    watchHistory: [String]
});
const User = aetheraConn.model('User', userSchema);

const movieSchema = new mongoose.Schema({
    title: String,
    genre: String,
    videoFile: String,
    thumbnailFile: String,
    rating: { type: Number, default: 0 }
});
const Movie = contentConn.model('Movie', movieSchema);

app.get('/api/recommendation/recommendations/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const watchHistory = user.watchHistory || [];

        // Get all movies to analyze
        const allMovies = await Movie.find({});

        // Calculate genre preferences
        const watchedMovies = allMovies.filter(m => watchHistory.includes(m.videoFile));
        const genreCounts = {};
        
        watchedMovies.forEach(m => {
            if (m.genre) {
                genreCounts[m.genre] = (genreCounts[m.genre] || 0) + 1;
            }
        });

        // Get top 3 favorite genres
        const topGenres = Object.entries(genreCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(entry => entry[0]);

        // Filter out watched movies
        let unwatchedMovies = allMovies.filter(m => !watchHistory.includes(m.videoFile));

        // Score unwatched movies
        const scoredMovies = unwatchedMovies.map(m => {
            let score = m.rating || 0; // Base score is the rating
            if (topGenres.includes(m.genre)) {
                score += 3; // Genre match weight
            }
            return { movie: m, score };
        });

        // Sort by score descending
        scoredMovies.sort((a, b) => b.score - a.score);

        // Return top 10 with S3 URL
        const s3BaseUrl = process.env.S3_BASE_URL || 'https://aethera-media-bucket.s3.amazonaws.com';
        const recommendations = scoredMovies.slice(0, 10).map(s => ({
            ...s.movie._doc,
            thumbnailUrl: `${s3BaseUrl}/thumbnails/${s.movie.thumbnailFile}`
        }));

        res.json(recommendations);

    } catch (error) {
        console.error("Error in recommendation service:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get('/api/recommendation', (req, res) => {
    res.send("Recommendation Service Running");
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`Recommendation service running on port ${PORT}`);
});
