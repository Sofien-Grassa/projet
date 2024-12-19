    const CV = require("../models/Cv.model"); // Assurez-vous que le chemin est correct
    const TestResultat = require('../models/TestResultat.model');

    // Récupérer les compétences par email
    const getCvSkillsByEmail = async (req, res) => {
        try {
            const { email } = req.query; // Récupérer l'email depuis les paramètres de requête

            if (!email) {
                return res.status(400).json({ message: "L'email est requis pour rechercher des compétences." });
            }

            // Rechercher les CV associés à l'email
            const cvs = await CV.find({ email });

            if (cvs.length === 0) {
                return res.status(404).json({ message: "Aucun CV trouvé pour cet email." });
            }

            // Regrouper toutes les compétences extraites des CV
            const allSkills = cvs.reduce((acc, cv) => {
                cv.skills.forEach(skill => {
                    if (!acc.includes(skill)) {
                        acc.push(skill); // Ajouter la compétence si elle n'est pas déjà présente
                    }
                });
                return acc;
            }, []);

            res.json({ email, skills: allSkills }); // Retourner l'email et la liste des compétences
        } catch (error) {
            console.error("Erreur lors de la récupération des compétences :", error);
            res.status(500).send("Erreur lors de la récupération des compétences.");
        }
    };
    const save_test = async (req, res) => {
        const { email, skill, score } = req.body;

        if (!email || !skill || score === undefined) {
            return res.status(400).json({ message: "Tous les champs sont requis." });
        }

        try {
            // Vérifier si un résultat de test existe déjà pour cet email et cette compétence
            const existingTestResult = await TestResultat.findOne({ email, skill });

            if (existingTestResult) {
                // Mettre à jour le score existant
                existingTestResult.score = score;
                await existingTestResult.save();
                return res.status(200).json({
                    message: "Résultat du test mis à jour avec succès.",
                    data: existingTestResult,
                });
            } else {
                // Créer un nouvel enregistrement de résultat de test
                const newTestResult = new TestResultat({
                    email,
                    skill,
                    score,
                });
                await newTestResult.save();

                return res.status(201).json({
                    message: "Résultat du test enregistré avec succès.",
                    data: newTestResult,
                });
            }
        } catch (error) {
            console.error("Erreur lors de l'enregistrement/mise à jour du résultat du test", error);
            res.status(500).json({ message: "Erreur serveur." });
        }
    };
const getTestResultsByEmail = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: "L'email est requis pour récupérer les résultats de test." });
        }

        // Rechercher les résultats de test associés à l'email
        const testResults = await TestResultat.find({ email });

        // Retourner une réponse vide si aucun résultat n'est trouvé
        res.status(200).json({
            message: "Résultats récupérés avec succès.",
            results: testResults,
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des résultats de test :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

const getEligibleSkills = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: "L'email est requis." });
        }

        // Trouver les compétences avec score >= 70 pour cet email
        const testResults = await TestResultat.find({ email, score: { $gte: 70 } });

        if (testResults.length === 0) {
            return res.status(404).json({ message: "Aucune compétence éligible trouvée pour cet email." });
        }

        const eligibleSkills = testResults.map(result => result.skill);

        res.status(200).json({ email, skills: eligibleSkills });
    } catch (error) {
        console.error("Erreur lors de la récupération des compétences éligibles :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};
const getTestResultsPaginated = async (req, res) => {
    try {
        const { email, page = 1, limit = 5 } = req.query;

        if (!email) {
            return res.status(400).json({ message: "L'email est requis pour récupérer les résultats de test." });
        }

        // Calculer les résultats à ignorer pour la pagination
        const skip = (page - 1) * limit;

        // Rechercher les résultats paginés
        const testResults = await TestResultat.find({ email })
            .skip(skip)
            .limit(Number(limit));

        // Compter le nombre total de résultats
        const totalCount = await TestResultat.countDocuments({ email });

        res.status(200).json({
            message: "Résultats récupérés avec succès.",
            results: testResults,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des résultats de test avec pagination :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};



    module.exports = {
        getCvSkillsByEmail, getTestResultsPaginated, save_test, getTestResultsByEmail, getEligibleSkills,
    };
