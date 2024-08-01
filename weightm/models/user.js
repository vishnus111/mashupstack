const mongoose = require('mongoose');

const weightSchema = new mongoose.Schema({
    weight: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    weights: [weightSchema]
});

module.exports = mongoose.model('User', userSchema);
