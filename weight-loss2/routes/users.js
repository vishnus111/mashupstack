const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Login Page
router.get('/login', (req, res) => res.render('login'));

// Register Page
router.get('/register', (req, res) => res.render('register'));

// Register Handle
router.post('/register', [
    body('username').not().isEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('password2').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('register', {
            errors: errors.array(),
            username: req.body.username,
            password: req.body.password,
            password2: req.body.password2
        });
    }

    const { username, password } = req.body;
    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.render('register', {
                errors: [{ msg: 'Username already exists' }],
                username,
                password,
                password2: req.body.password2
            });
        }

        user = new User({ username, password });
        await user.save();
        req.session.messages.push({ msg: 'You are now registered and can log in' });
        res.redirect('/users/login');
    } catch (err) {
        console.error(err);
        res.render('register', {
            errors: [{ msg: 'Server error' }],
            username,
            password,
            password2: req.body.password2
        });
    }
});

// Login Handle
router.post('/login', [
    body('username').not().isEmpty().withMessage('Username is required'),
    body('password').not().isEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('login', {
            errors: errors.array(),
            username: req.body.username,
            password: req.body.password
        });
    }

    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.render('login', {
                errors: [{ msg: 'Invalid username or password' }],
                username,
                password
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', {
                errors: [{ msg: 'Invalid username or password' }],
                username,
                password
            });
        }

        req.session.user = user;
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.render('login', {
            errors: [{ msg: 'Server error' }],
            username,
            password
        });
    }
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/dashboard');
        }
        res.redirect('/users/login');
    });
});

module.exports = router;
