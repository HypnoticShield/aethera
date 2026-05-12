require('dotenv').config({ path: './content-service/.env' });
const mongoose = require('mongoose');

// We use the Content DB URI for movies, and Auth DB URI for users
const contentUri = process.env.MONGO_URI || 'mongodb+srv://arnav2005sharma_db_user:XJSMR7nnu3Ky9adu@aethera-cluster.aimq9nk.mongodb.net/aethera_content?appName=aethera-cluster';
const authUri = 'mongodb+srv://arnav2005sharma_db_user:XJSMR7nnu3Ky9adu@aethera-cluster.aimq9nk.mongodb.net/aethera?appName=aethera-cluster';

async function seed() {
    try {
        console.log("Connecting to Atlas...");
        
        // 1. Seed Movies into aethera_content
        const contentConn = await mongoose.createConnection(contentUri).asPromise();
        const Movie = contentConn.model('Movie', new mongoose.Schema({
            title: String, genre: String, videoFile: String, thumbnailFile: String, rating: Number, description: String
        }));

        console.log("Clearing old movies (if any)...");
        await Movie.deleteMany({}); // Start fresh!

        console.log("Seeding exact S3 movies...");
        await Movie.insertMany([
            { title: 'Coach Carter', genre: 'Drama', videoFile: 'CoachCarter.mp4', thumbnailFile: 'CoachCarter.jpeg', rating: 4.8, description: 'Controversy surrounds a high school basketball coach after he benches his entire team for breaking their academic contract with him.' },
            { title: 'Edge Of Tomorrow', genre: 'Sci-Fi', videoFile: 'EdgeOfTomorrow.mp4', thumbnailFile: 'EdgeOfTomorrow.jpeg', rating: 4.7, description: 'A soldier fighting aliens gets to relive the same day over and over again, the day restarting every time he dies.' },
            { title: 'F1', genre: 'Action', videoFile: 'F1.mp4', thumbnailFile: 'F1.jpeg', rating: 4.5, description: 'A high-octane look into the fast-paced, dangerous world of Formula 1 racing.' },
            { title: 'La La Land', genre: 'Romance', videoFile: 'LaLaLand.mp4', thumbnailFile: 'LaLaLand.jpeg', rating: 4.9, description: 'A jazz pianist and an aspiring actress fall in love while pursuing their dreams in Los Angeles.' },
            { title: 'Love & Other Drugs', genre: 'Romance', videoFile: 'Love&OtherDrugs.mp4', thumbnailFile: 'Love&OtherDrugs.jpeg', rating: 4.6, description: 'A charming pharmaceutical rep and a woman with Parkinson\'s disease find themselves in a relationship they didn\'t expect.' }
        ]);
        console.log("Movies seeded!");

        // 2. Seed Admin User into aethera
        const authConn = await mongoose.createConnection(authUri).asPromise();
        const User = authConn.model('User', new mongoose.Schema({
            username: { type: String, required: true },
            password: { type: String, required: true },
            isPremium: { type: Boolean, default: false },
            watchHistory: [String]
        }));

        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            console.log("Seeding admin user...");
            await User.create({ username: 'admin', password: 'admin', isPremium: true, watchHistory: [] });
            console.log("Admin user seeded!");
        } else {
            console.log("Admin user already exists.");
        }

        console.log("All done! Exiting...");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
