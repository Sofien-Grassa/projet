const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const nlp = require('compromise');
const CV = require('../models/Cv.model'); // Importer le modèle CV
const TestResultat = require('../models/TestResultat.model'); // Importer le modèle CV

// Configuration de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path.join(__dirname, '../uploads');
        cb(null, uploadsDir);  // Dossier de destination
    },
    filename: (req, file, cb) => {
        // Utiliser le nom de fichier original sans modification
        cb(null, file.originalname);  // Conserver le nom original du fichier
    },
});

const upload = multer({ storage });

// Liste des compétences à rechercher (modifiez selon vos besoins)
const skillsList = [
    "Python", "C#", ".Net", "Angular",
    "JavaScript", "NoSQL", "TypeScript", "Sql",
    "Vue.js", "React", "Php", "Node.js", "Ajax","Jquery","C","Java"
];

// Fonction pour extraire des compétences en utilisant compromise et expressions régulières
function extractSkillsWithCompromise(text) {
    let doc = nlp(text.toLowerCase());  // Applique compromise sur le texte en minuscules
    let foundSkills = [];

    // Recherche chaque compétence de la liste dans le texte, insensible à la casse
    skillsList.forEach(skill => {
        let skillLowerCase = skill.toLowerCase();
        if (doc.has(skillLowerCase)) {
            foundSkills.push(skill);  // Ajouter la compétence trouvée dans sa forme originale
        }
    });

    // Recherche spécifique pour ".net" avec une expression régulière
    const regexNet = /\b\.?net\b/i;  // Expression régulière pour détecter .Net, Net, .net, etc.
    if (regexNet.test(text)) {
        foundSkills.push(".net");
    }

    return foundSkills;
}

// Fonction pour extraire le texte depuis un fichier PDF
async function extractTextFromPDF(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(fileBuffer);
    return data.text;
}

// Contrôleur pour gérer l'upload et extraire les compétences
const upload_cv = async (req, res) => {
    try {
        const { email } = req.body; // Récupérer l'email de la requête
        const filePath = req.file.path;
        const ext = path.extname(filePath).toLowerCase();

        if (!email) {
            return res.status(400).json({ message: "L'email est requis pour enregistrer un CV." });
        }
        const existingCv = await CV.findOne({ email: email, fileName: req.file.originalname });
        if (existingCv) {
            return res.status(409).json({
                message: "Un CV avec le même nom de fichier et email existe déjà. Upload refusé.",
            });
        }
        let extractedText = '';
        if (ext === '.pdf') {
            extractedText = await extractTextFromPDF(filePath); // Lecture PDF
        } else {
            extractedText = fs.readFileSync(filePath, 'utf-8'); // Lecture texte brut
        }

        // Extraire les compétences avec compromise
        const skills = extractSkillsWithCompromise(extractedText);

        // Créer un document CV dans la base de données
        const newCv = new CV({
            fileName: req.file.originalname, // Utilise le nom du fichier téléchargé
            skills: skills,                 // Les compétences extraites du fichier
            email: email,                   // Associe l'email au CV
        });

        // Enregistrer dans la base de données
        await newCv.save();

       

        // Envoyer la réponse avec les compétences extraites et confirmation d'enregistrement
        res.json({
            message: "Fichier traité et enregistré avec succès.",
            skills: skills,
        });
    } catch (error) {
        console.error("Erreur lors du traitement :", error);
        res.status(500).send("Erreur lors du traitement du fichier.");
    }
};

const getCvByEmail = async (req, res) => {
    try {
        const { email } = req.query; // Récupérer l'email depuis les paramètres de requête

        if (!email) {
            return res.status(400).json({ message: "L'email est requis pour rechercher des CV." });
        }

        // Rechercher les CV associés à l'email
        const cvs = await CV.find({ email });

        if (cvs.length === 0) {
            return res.status(404).json({ message: "Aucun CV trouvé pour cet email." });
        }

        res.json({ cvs });
    } catch (error) {
        console.error("Erreur lors de la récupération des CV :", error);
        res.status(500).send("Erreur lors de la récupération des CV.");
    }
};
const deleteCv = async (req, res) => {
    try {
        const { id } = req.params; // Récupérer l'ID depuis les paramètres d'URL

        if (!id) {
            return res.status(400).json({ message: "L'ID est requis pour supprimer un CV." });
        }

        // Rechercher et supprimer le CV dans la base de données
        const deletedCv = await CV.findByIdAndDelete(id);

        if (!deletedCv) {
            return res.status(404).json({ message: "CV non trouvé." });
        }

        // Supprimer les tests associés à l'email du CV supprimé
        await TestResultat.deleteMany({ email: deletedCv.email });

        res.json({
            message: "CV et tests associés supprimés avec succès.",
            deletedCv,
        });
    } catch (error) {
        console.error("Erreur lors de la suppression du CV :", error);
        res.status(500).send("Erreur lors de la suppression du CV.");
    }
};

module.exports = { upload_cv, upload, getCvByEmail, deleteCv };
