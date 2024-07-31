const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth');
const User = require('../models/User');
const Weight = require('../models/Weight');

// Register Page
router.get('/register', (req, res) => res.render('register'));

// Register Handle
router.post('/register', (req, res) => {
    const { username, password, password2 } = req.body;
    let errors = [];

    if (!username || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            username,
            password,
            password2
        });
    } else {
        User.findOne({ username: username }).then(user => {
            if (user) {
                errors.push({ msg: 'Username already exists' });
                res.render('register', {
                    errors,
                    username,
                    password,
                    password2
                });
            } else {
                const newUser = new User({
                    username,
                    password
                });

                newUser.save().then(user => {
                    req.flash('success_msg', 'You are now registered and can log in');
                    res.redirect('/users/login');
                }).catch(err => console.log(err));
            }
        });
    }
});

// Login Page
router.get('/login', (req, res) => res.render('login'));

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/users/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/users/login');
    });
});

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    Weight.find({ user: req.user.id }).sort({ date: 'desc' }).exec((err, weights) => {
        if (err) {
            console.log(err);
        } else {
            res.render('dashboard', {
                user: req.user,
                weights: weights
            });
        }
    });
});

// Add Weight
router.get('/add-weight', ensureAuthenticated, (req, res) => {
    res.render('add-weight', {
        user: req.user
    });
});

router.post('/add-weight', ensureAuthenticated, async (req, res) => {
    const { weight } = req.body;
    const userId = req.user.id;
    const today = new Date().setHours(0, 0, 0, 0);

    const existingWeight = await Weight.findOne({
        user: userId,
        date: {
            $gte: new Date(today),
            $lt: new Date(today + 24 * 60 * 60 * 1000)
        }
    });

    if (existingWeight) {
        req.flash('error_msg', 'You can only add one weight per day');
        return res.redirect('/users/add-weight');
    }

    const newWeight = new Weight({
        weight,
        user: userId
    });

    newWeight.save().then(() => {
        req.flash('success_msg', 'Weight added successfully');
        res.redirect('/users/dashboard');
    }).catch(err => console.log(err));
});

// Edit Weight
router.get('/edit-weight/:id', ensureAuthenticated, (req, res) => {
    Weight.findById(req.params.id, (err, weight) => {
        if (err) {
            console.log(err);
        } else {
            if (weight.user != req.user.id) {
                req.flash('error_msg', 'Not Authorized');
                return res.redirect('/users/dashboard');
            }
            res.render('edit-weight', {
                weight: weight
            });
        }
    });
});

router.put('/edit-weight/:id', ensureAuthenticated, (req, res) => {
    const { weight } = req.body;
    Weight.findByIdAndUpdate(req.params.id, { weight }, err => {
        if (err) {
            console.log(err);
        } else {
            req.flash('success_msg', 'Weight updated successfully');
            res.redirect('/users/dashboard');
        }
    });
});

// Delete Weight
router.delete('/delete-weight/:id', ensureAuthenticated, (req, res) => {
    Weight.findByIdAndDelete(req.params.id, err => {
        if (err) {
            console.log(err);
        } else {
            req.flash('success_msg', 'Weight deleted successfully');
            res.redirect('/users/dashboard');
        }
    });
});

// Find Weight Loss between Dates (AJAX)
router.post('/find-weight-loss', ensureAuthenticated, async (req, res) => {
    const { startDate, endDate } = req.body;
    const weights = await Weight.find({
        user: req.user.id,
        date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
    }).sort({ date: 'asc' });

    if (weights.length < 2) {
        return res.status(400).send('Not enough data to calculate weight loss');
    }

    const weightLoss = weights[0].weight - weights[weights.length - 1].weight;
    res.send({ weightLoss });
});

module.exports = router;
``
