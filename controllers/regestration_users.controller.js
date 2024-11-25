const bcrypt = require('bcrypt');
const UserModel = require("../models/User.model");
const crypto = require('crypto');

const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, token) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Utilisez votre fournisseur de messagerie
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const verificationUrl = `http://localhost:3001/verify?token=${token}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Vérification de votre email",
        text: `Merci de vérifier votre email en cliquant sur ce lien : ${verificationUrl}`,
    };

    await transporter.sendMail(mailOptions);
};
const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Cet email est déjà utilisé" });

        // Hachage du mot de passe (comme dans votre code actuel)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Générer un token de vérification
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const newUser = new UserModel({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            verificationToken,
        });
        await newUser.save();

        // Envoyer l'email de vérification
        await sendVerificationEmail(email, verificationToken);

        res.status(201).json({ message: "Inscription réussie. Un email de vérification a été envoyé." });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

const verifier = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await UserModel.findOne({ verificationToken: token });
        if (!user) return res.status(400).json({ message: "Token de vérification invalide." });

        user.isVerified = true;
        user.verificationToken = null; // Supprimer le token après vérification
        await user.save();

            res.redirect("http://localhost:3000/login?verified=true");
        
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la vérification.", error: error.message });
    }
};


module.exports = { register, verifier };
