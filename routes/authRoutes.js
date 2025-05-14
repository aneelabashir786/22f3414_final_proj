const express = require('express');
const router = express.Router();
const User = require('../model/User'); // create this model
const bcrypt = require('bcrypt');

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.json({ success: false, message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.json({ success: false, message: 'Incorrect password' });

        res.json({ success: true, message: 'Login successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Signup route
// Update the signup route in authRoutes.js

router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password } = req.body; // Changed from 'name'
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already in use' });
        }

        const user = new User({
            firstName,    // Changed from 'name'
            lastName,
            email,
            password: await bcrypt.hash(password, 10)
        });

        await user.save();
        res.json({ success: true, message: 'Signup successful' });
    } catch (err) {
        console.error("Full error:", err);
        res.status(500).json({
            success: false,
            message: err.message || 'Server error'
        });
    }
});
module.exports = router;
