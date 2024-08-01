const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');


exports.signup = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ email, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};


exports.addWeight = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { weight } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const today = new Date().toISOString().split('T')[0];
        const existingWeight = user.weights.find(w => w.date.toISOString().split('T')[0] === today);

        if (existingWeight) {
            return res.status(400).json({ msg: 'Weight for today already added' });
        }

        user.weights.push({ weight });
        await user.save();
        res.json(user.weights);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Other controller methods for viewing, editing, deleting weights, and calculating weight loss
