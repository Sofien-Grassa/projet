const mongoose = require('mongoose');

const testResultatSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    skill: {
        type: String,
        required: true,
    },
    score: {
        type: Number,
        required: false,
    }
});

module.exports = mongoose.model('TestResultat', testResultatSchema);
