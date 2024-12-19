const mongoose = require('mongoose');

const emploiSchema = new mongoose.Schema({
    title: { type: String, required: [true, "Le nom de l'emploi est obligatoire"] },
    entreprise: { type: String, required: [true, "Le nom de l'entreprise est obligatoire"] },
    skills: { type: [String], required: [true, "Les compétences sont obligatoires"] },
    description: { type: String, required: [true, "La description est obligatoire"] },
    email: {
        type: String,
        required: [true, "L'email est obligatoire"],
        match: [/^\S+@\S+\.\S+$/, "Veuillez entrer un email valide"],
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Emploi', emploiSchema);
