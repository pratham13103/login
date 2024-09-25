const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/loginDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// User Model
const User = mongoose.model('User', userSchema);

// Serve the login form at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Login Route
app.post('/login', async (req, res) => {
    const { name, password } = req.body;

    try {
        const foundUser = await User.findOne({ name: name });
        if (foundUser) {
            const isMatch = await bcrypt.compare(password, foundUser.password);
            if (isMatch) {
                return res.send('Login successful!');
            } else {
                return res.send('Incorrect password.');
            }
        } else {
            return res.send('User not found.');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error.');
    }
});

// Registration Route
app.post('/register', async (req, res) => {
    const { name, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ name: name });
        if (existingUser) {
            return res.send('User already exists. Please choose a different username.');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            name: name,
            password: hashedPassword,
        });

        // Save the user to the database
        await newUser.save();
        res.send('User registered successfully! You can now log in.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error.');
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
