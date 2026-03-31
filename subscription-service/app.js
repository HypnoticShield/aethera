const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/aethera')
.then(() => console.log('User DB connected'))
.catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    subscription: String,
    watchHistory: [String]
});

const User = mongoose.model('User', userSchema);

let plans = [
    { id: 1, name: "Basic", price: "199" },
    { id: 2, name: "Premium", price: "499" }
];

app.get('/plans', (req, res) => {
    res.json(plans);
});

app.post('/subscribe', async (req, res) => {
    const { username, plan } = req.body;

    await User.findOneAndUpdate(
        { username },
        { subscription: plan }
    );

    res.json({
        message: `${username} subscribed to ${plan}`
    });
});

app.get('/', (req, res) => {
    res.send("Subscription Service Running");
});

app.listen(3002, () => {
    console.log('Subscription service running on port 3002');
});
