    const CV = require("../models/Cv.model"); // Assurez-vous que le chemin est correct
    const TestResultat = require('../models/TestResultat.model');

    // R�cup�rer les comp�tences par email
    const getCvSkillsByEmail = async (req, res) => {
        try {
            const { email } = req.query; // R�cup�rer l'email depuis les param�tres de requ�te

            if (!email) {
                return res.status(400).json({ message: "L'email est requis pour rechercher des comp�tences." });
            }

            // Rechercher les CV associ�s � l'email
            const cvs = await CV.find({ email });

            if (cvs.length === 0) {
                return res.status(404).json({ message: "Aucun CV trouv� pour cet email." });
            }

            // Regrouper toutes les comp�tences extraites des CV
            const allSkills = cvs.reduce((acc, cv) => {
                cv.skills.forEach(skill => {
                    if (!acc.includes(skill)) {
                        acc.push(skill); // Ajouter la comp�tence si elle n'est pas d�j� pr�sente
                    }
                });
                return acc;
            }, []);

            res.json({ email, skills: allSkills }); // Retourner l'email et la liste des comp�tences
        } catch (error) {
            console.error("Erreur lors de la r�cup�ration des comp�tences :", error);
            res.status(500).send("Erreur lors de la r�cup�ration des comp�tences.");
        }
    };
    const save_test = async (req, res) => {
        const { email, skill, score } = req.body;

        if (!email || !skill || score === undefined) {
            return res.status(400).json({ message: "Tous les champs sont requis." });
        }

        try {
            // V�rifier si un r�sultat de test existe d�j� pour cet email et cette comp�tence
            const existingTestResult = await TestResultat.findOne({ email, skill });

            if (existingTestResult) {
                // Mettre � jour le score existant
                existingTestResult.score = score;
                await existingTestResult.save();
                return res.status(200).json({
                    message: "R�sultat du test mis � jour avec succ�s.",
                    data: existingTestResult,
                });
            } else {
                // Cr�er un nouvel enregistrement de r�sultat de test
                const newTestResult = new TestResultat({
                    email,
                    skill,
                    score,
                });
                await newTestResult.save();

                return res.status(201).json({
                    message: "R�sultat du test enregistr� avec succ�s.",
                    data: newTestResult,
                });
            }
        } catch (error) {
            console.error("Erreur lors de l'enregistrement/mise � jour du r�sultat du test", error);
            res.status(500).json({ message: "Erreur serveur." });
        }
    };
const getTestResultsByEmail = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: "L'email est requis pour r�cup�rer les r�sultats de test." });
        }

        // Rechercher les r�sultats de test associ�s � l'email
        const testResults = await TestResultat.find({ email });

        // Retourner une r�ponse vide si aucun r�sultat n'est trouv�
        res.status(200).json({
            message: "R�sultats r�cup�r�s avec succ�s.",
            results: testResults,
        });

    } catch (error) {
        console.error("Erreur lors de la r�cup�ration des r�sultats de test :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

const getEligibleSkills = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: "L'email est requis." });
        }

        // Trouver les comp�tences avec score >= 70 pour cet email
        const testResults = await TestResultat.find({ email, score: { $gte: 70 } });

        if (testResults.length === 0) {
            return res.status(404).json({ message: "Aucune comp�tence �ligible trouv�e pour cet email." });
        }

        const eligibleSkills = testResults.map(result => result.skill);

        res.status(200).json({ email, skills: eligibleSkills });
    } catch (error) {
        console.error("Erreur lors de la r�cup�ration des comp�tences �ligibles :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};
const getTestResultsPaginated = async (req, res) => {
    try {
        const { email, page = 1, limit = 5 } = req.query;

        if (!email) {
            return res.status(400).json({ message: "L'email est requis pour r�cup�rer les r�sultats de test." });
        }

        // Calculer les r�sultats � ignorer pour la pagination
        const skip = (page - 1) * limit;

        // Rechercher les r�sultats pagin�s
        const testResults = await TestResultat.find({ email })
            .skip(skip)
            .limit(Number(limit));

        // Compter le nombre total de r�sultats
        const totalCount = await TestResultat.countDocuments({ email });

        res.status(200).json({
            message: "R�sultats r�cup�r�s avec succ�s.",
            results: testResults,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: Number(page),
        });
    } catch (error) {
        console.error("Erreur lors de la r�cup�ration des r�sultats de test avec pagination :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};



    module.exports = {
        getCvSkillsByEmail, getTestResultsPaginated, save_test, getTestResultsByEmail, getEligibleSkills,
    };
