const mongoose = require('mongoose');

const WeightSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    weight: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Weight = mongoose.model('Weight', WeightSchema);

module.exports = Weight;
