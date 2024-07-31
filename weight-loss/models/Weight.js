const mongoose = require('mongoose');

const WeightSchema = new mongoose.Schema({
    weight: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Weight', WeightSchema);
