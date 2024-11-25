const mongoose = require('mongoose');

const cvSchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    skills: { type: [String], required: true },
    email: { type: String, required: true }, // Nouveau champ pour l'email
});

module.exports = mongoose.model('CV', cvSchema);
