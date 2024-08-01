const express = require('express');
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();


router.post('/signup', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], userController.signup);

router.post('/weight', [
    auth,
    check('weight', 'Weight is required').not().isEmpty()
], userController.addWeight);

// Other routes for viewing, editing, deleting weights, and calculating weight loss

module.exports = router;
