const crypto = require('crypto');
const nodemailer = require('nodemailer');
const UserModel = require('../models/User.model');
const bcrypt = require('bcryptjs');

// Fonction pour envoyer l'email de r�initialisation du mot de passe
const sendPasswordResetEmail = async (email, token) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const resetUrl = `http://localhost:3000/reset_password?token=${token}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "R�initialisation de votre mot de passe",
        text: `Cliquez sur ce lien pour r�initialiser votre mot de passe : ${resetUrl}`,
    };

    await transporter.sendMail(mailOptions);
};

// Route pour demander la r�initialisation du mot de passe
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        // V�rifiez si l'utilisateur existe
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(404).json({ message: "Utilisateur non trouv�." });

        // G�n�rer un token de r�initialisation
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;  // Assigner seulement le token, pas d'expiration
        await user.save();

        // Envoyer l'email de r�initialisation
        await sendPasswordResetEmail(email, resetToken);

        res.status(200).json({ message: "Email de r�initialisation envoy� avec succ�s." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la demande de r�initialisation.", error: error.message });
    }
};

// Route pour r�initialiser le mot de passe
const resetPassword = async (req, res) => {
    try {
        const { token } = req.query;
        const { newPassword } = req.body;

        // V�rifiez si un utilisateur existe avec le token
        const user = await UserModel.findOne({
            resetToken: token,  // Recherche par token uniquement
        });

        if (!user) return res.status(400).json({ message: "Token invalide." });

        // Hacher le nouveau mot de passe
        const saltRounds = 10;
        user.password = await bcrypt.hash(newPassword, saltRounds);

        // Supprimer le token de r�initialisation
        user.resetToken = null;

        await user.save();

        res.status(200).json({ message: "Mot de passe r�initialis� avec succ�s." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la r�initialisation du mot de passe.", error: error.message });
    }
};

module.exports = { requestPasswordReset, resetPassword };
