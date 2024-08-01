// const mongoose = require('mongoose');

// const WeightSchema = new mongoose.Schema({
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     weight: { type: Number, required: true },
//     date: { type: Date, default: Date.now },
// });

// WeightSchema.index({ userId: 1, date: 1 }, { unique: true });

// module.exports = mongoose.model('Weight', WeightSchema);
const mongoose = require('mongoose');

const WeightSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        validate: {
            validator: function(value) {
                return !isNaN(Date.parse(value));
            },
            message: props => `${props.value} is not a valid date!`
        }
    }
});

module.exports = mongoose.model('Weight', WeightSchema);
