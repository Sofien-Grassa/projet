const Emploi = require('../models/Emploi.model');

// Ajouter un emploi
exports.createEmploi = async (req, res) => {
    try {
        const newEmploi = new Emploi(req.body);
        const savedEmploi = await newEmploi.save();
        res.status(201).send({ message: "Emploi ajouté avec succès", emploi: savedEmploi });
    } catch (error) {
        res.status(400).send({ message: "Erreur lors de la création de l'emploi", error: error.message });
    }
};

// Récupérer tous les emplois
exports.getEmplois = async (req, res) => {
    try {
        const emplois = await Emploi.find();
        res.status(200).send(emplois);
    } catch (error) {
        res.status(500).send({ message: "Erreur lors de la récupération des emplois", error: error.message });
    }
};
