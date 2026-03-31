const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

app.use(cors());

mongoose.connect('mongodb://localhost:27017/aethera_content')
.then(() => console.log('Content DB connected'))
.catch(err => console.log(err));

const movieSchema = new mongoose.Schema({
    title: String,
    genre: String,
    videoFile: String,
    thumbnailFile: String
});

const Movie = mongoose.model('Movie', movieSchema);

app.use('/thumbnails', express.static(path.join(__dirname, '../thumbnails')));

app.get('/movies', async (req, res) => {
    const movies = await Movie.find();
    res.json(movies);
});

app.get('/', (req, res) => {
    res.send("Content Service Running");
});

app.listen(3001, () => {
    console.log('Content service running on port 3001');
});
