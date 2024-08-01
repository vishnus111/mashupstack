const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Weight = require('../models/Weight');
const { ensureAuthenticated } = require('../config/auth');




router.post('/weight-loss', ensureAuthenticated, async (req, res) => {
    const { startDate, endDate } = req.body;
    const userId = req.session.user._id;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Both start and end dates are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
        return res.status(400).json({ error: 'Invalid date format' });
    }

    try {
        const weights = await Weight.find({
            userId: userId,
            date: { $gte: start, $lte: end }
        }).sort({ date: 1 });

        if (weights.length < 2) {
            return res.status(400).json({ error: 'Not enough data points to calculate weight loss' });
        }

        const weightLoss = weights[0].weight - weights[weights.length - 1].weight;
        res.json({ weightLoss });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


// Route to find weight loss between two dates
// router.post('/weight-loss', ensureAuthenticated, async (req, res) => {
//     const { startDate, endDate } = req.body;
//     const userId = req.session.user._id;

//     try {
//         const weights = await Weight.find({
//             userId: userId,
//             date: { $gte: new Date(startDate), $lte: new Date(endDate) }
//         }).sort({ date: 1 });

//         if (weights.length < 2) {
//             return res.status(400).json({ error: 'Not enough data points to calculate weight loss' });
//         }

//         const weightLoss = weights[0].weight - weights[weights.length - 1].weight;
//         res.json({ weightLoss });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// Register Page
router.get('/register', (req, res) => res.render('register', { errors: [] }));

// Register Handle
router.post('/register', async (req, res) => {
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
        const user = await User.findOne({ username: username });
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

            bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, async (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                await newUser.save();
                req.session.success_msg = 'You are now registered and can log in';
                res.redirect('/users/login');
            }));
        }
    }
});

// Login Page
router.get('/login', (req, res) => res.render('login', { message: req.session.message }));

// Login Handle
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
        req.session.message = { type: 'error', message: 'User not found' };
        return res.redirect('/users/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
        req.session.user = user;
        res.redirect('/users/dashboard');
    } else {
        req.session.message = { type: 'error', message: 'Incorrect password' };
        res.redirect('/users/login');
    }
});

// Dashboard Page
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
    const weights = await Weight.find({ user: req.session.user._id }).sort({ date: -1 }).limit(10).skip((req.query.page - 1) * 10 || 0);
    const count = await Weight.countDocuments({ user: req.session.user._id });
    const pages = Math.ceil(count / 10);
    res.render('dashboard', { user: req.session.user, weights, pages, message: req.session.success_msg });
});

// Add Weight Page
router.get('/add-weight', ensureAuthenticated, (req, res) => res.render('add-weight'));

// Add Weight Handle
router.post('/add-weight', ensureAuthenticated, async (req, res) => {
    const weight = new Weight({
        user: req.session.user._id,
        weight: req.body.weight
    });

    const today = new Date().setHours(0, 0, 0, 0);
    const alreadyAdded = await Weight.findOne({ user: req.session.user._id, date: { $gte: today, $lt: new Date(today).setHours(24, 0, 0, 0) } });

    if (alreadyAdded) {
        req.session.success_msg = 'You have already added weight for today';
        return res.redirect('/users/dashboard');
    }

    await weight.save();
    req.session.success_msg = 'Weight added successfully';
    res.redirect('/users/dashboard');
});

// Edit Weight Page
router.get('/edit-weight/:id', ensureAuthenticated, async (req, res) => {
    const weight = await Weight.findById(req.params.id);
    res.render('edit-weight', { weight });
});

// Edit Weight Handle
router.post('/edit-weight/:id', ensureAuthenticated, async (req, res) => {
    const weight = await Weight.findById(req.params.id);

    if (weight.user != req.session.user._id) {
        req.session.success_msg = 'Not Authorized';
        return res.redirect('/users/dashboard');
    }

    weight.weight = req.body.weight;
    await weight.save();
    req.session.success_msg = 'Weight updated successfully';
    res.redirect('/users/dashboard');
});

// Delete Weight
router.post('/delete-weight/:id', ensureAuthenticated, async (req, res) => {
    const weight = await Weight.findById(req.params.id);

    if (weight.user != req.session.user._id) {
        req.session.success_msg = 'Not Authorized';
        return res.redirect('/users/dashboard');
    }

    await weight.remove();
    req.session.success_msg = 'Weight deleted successfully';
    res.redirect('/users/dashboard');
});

// Find Weight Loss
router.post('/find-weight-loss', ensureAuthenticated, async (req, res) => {
    const { startDate, endDate } = req.body;
    const weights = await Weight.find({
        user: req.session.user._id,
        date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
    }).sort({ date: 'asc' });

    if (weights.length < 2) {
        return res.status(400).json({ error: 'Not enough data to calculate weight loss' });
    }

    const weightLoss = weights[0].weight - weights[weights.length - 1].weight;
    res.json({ weightLoss });
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return console.log(err);
        res.redirect('/');
    });
});

// #new

// router.post('/add-weight', (req, res) => {
//     const { weight } = req.body;
//     const userId = req.session.user._id;
//     const date = new Date(); // Use the current date

//     // Check if the date is valid
//     if (isNaN(date.getTime())) {
//         return res.status(400).send('Invalid date');
//     }

//     // Check if weight is already added for the current date
//     Weight.findOne({ userId, date: { $gte: new Date().setHours(0, 0, 0, 0), $lt: new Date().setHours(23, 59, 59, 999) } })
//         .then(existingWeight => {
//             if (existingWeight) {
//                 return res.status(400).send('Weight already added for today');
//             }

//             const newWeight = new Weight({
//                 userId,
//                 weight,
//                 date
//             });

//             newWeight.save()
//                 .then(weight => {
//                     res.redirect('/users/dashboard');
//                 })
//                 .catch(err => console.log(err));
//         });
// });

// // Edit weight
// router.post('/edit-weight/:id', (req, res) => {
//     const { weight } = req.body;
//     const weightId = req.params.id;
//     const date = new Date(); // Use the current date

//     // Check if the date is valid
//     if (isNaN(date.getTime())) {
//         return res.status(400).send('Invalid date');
//     }

//     Weight.findById(weightId)
//         .then(weightDoc => {
//             if (!weightDoc) {
//                 return res.status(404).send('Weight not found');
//             }

//             weightDoc.weight = weight;
//             weightDoc.date = date;

//             weightDoc.save()
//                 .then(() => res.redirect('/users/dashboard'))
//                 .catch(err => console.log(err));
//         });
// });
module.exports = router;
