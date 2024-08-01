const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { ensureAuthenticated } = require('../middleware/auth');
const Weight = require('../models/Weight');

// Add weight
router.post('/add', ensureAuthenticated, [
    body('weight').isFloat({ gt: 0 }).withMessage('Weight must be a positive number')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.messages = errors.array();
        return res.redirect('/dashboard');
    }

    try {
        const { weight } = req.body;
        const userId = req.session.user._id;

        const existingWeight = await Weight.findOne({
            userId,
            date: {
                $gte: new Date().setHours(0, 0, 0, 0),
                $lt: new Date().setHours(23, 59, 59, 999)
            }
        });

        if (existingWeight) {
            req.session.messages.push({ msg: 'You can only add one weight per day' });
            return res.redirect('/dashboard');
        }

        const newWeight = new Weight({ userId, weight });
        await newWeight.save();
        req.session.messages.push({ msg: 'Weight added successfully' });
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        req.session.messages.push({ msg: 'Error adding weight' });
        res.redirect('/dashboard');
    }
});

// View weights with pagination
router.get('/view', ensureAuthenticated, async (req, res) => {
    const perPage = 10;
    const page = req.query.page || 1;

    try {
        const weights = await Weight.find({ userId: req.session.user._id })
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .sort({ date: -1 });

        const count = await Weight.countDocuments({ userId: req.session.user._id });

        res.render('view', {
            weights,
            current: page,
            pages: Math.ceil(count / perPage)
        });
    } catch (err) {
        console.error(err);
        req.session.messages.push({ msg: 'Error fetching weights' });
        res.redirect('/dashboard');
    }
});

// Edit weight
router.post('/edit/:id', ensureAuthenticated, [
    body('weight').isFloat({ gt: 0 }).withMessage('Weight must be a positive number')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.messages = errors.array();
        return res.redirect('/weights/view');
    }

    try {
        const { weight } = req.body;
        const weightId = req.params.id;

        await Weight.findByIdAndUpdate(weightId, { weight });
        req.session.messages.push({ msg: 'Weight updated successfully' });
        res.redirect('/weights/view');
    } catch (err) {
        console.error(err);
        req.session.messages.push({ msg: 'Error updating weight' });
        res.redirect('/weights/view');
    }
});

// Delete weight
router.post('/delete/:id', ensureAuthenticated, async (req, res) => {
    try {
        const weightId = req.params.id;

        await Weight.findByIdAndDelete(weightId);
        req.session.messages.push({ msg: 'Weight deleted successfully' });
        res.redirect('/weights/view');
    } catch (err) {
        console.error(err);
        req.session.messages.push({ msg: 'Error deleting weight' });
        res.redirect('/weights/view');
    }
});

module.exports = router;
