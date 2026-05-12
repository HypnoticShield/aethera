require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aethera_content')
.then(async () => {
    console.log('Content DB connected for population');
    
    const movieSchema = new mongoose.Schema({
        title: String,
        genre: String,
        videoFile: String,
        thumbnailFile: String,
        rating: { type: Number, default: 0 }
    });
    const Movie = mongoose.model('Movie', movieSchema);

    const movies = await Movie.find({});
    console.log(`Found ${movies.length} movies.`);

    for (let movie of movies) {
        if (!movie.rating || movie.rating === 0) {
            // Random rating between 3.0 and 5.0
            const randomRating = (Math.random() * 2 + 3).toFixed(1);
            movie.rating = parseFloat(randomRating);
            await movie.save();
            console.log(`Updated rating for ${movie.title} to ${movie.rating}`);
        }
    }
    
    console.log("Population complete.");
    process.exit(0);
})
.catch(err => {
    console.log(err);
    process.exit(1);
});
