const crypto = require('crypto');
const nodemailer = require('nodemailer');
const UserModel = require('../models/User.model');
const bcrypt = require('bcryptjs');

// Fonction pour envoyer l'email de réinitialisation du mot de passe
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
        subject: "Réinitialisation de votre mot de passe",
        text: `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetUrl}`,
    };

    await transporter.sendMail(mailOptions);
};

// Route pour demander la réinitialisation du mot de passe
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        // Vérifiez si l'utilisateur existe
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

        // Générer un token de réinitialisation
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;  // Assigner seulement le token, pas d'expiration
        await user.save();

        // Envoyer l'email de réinitialisation
        await sendPasswordResetEmail(email, resetToken);

        res.status(200).json({ message: "Email de réinitialisation envoyé avec succès." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la demande de réinitialisation.", error: error.message });
    }
};

// Route pour réinitialiser le mot de passe
const resetPassword = async (req, res) => {
    try {
        const { token } = req.query;
        const { newPassword } = req.body;

        // Vérifiez si un utilisateur existe avec le token
        const user = await UserModel.findOne({
            resetToken: token,  // Recherche par token uniquement
        });

        if (!user) return res.status(400).json({ message: "Token invalide." });

        // Hacher le nouveau mot de passe
        const saltRounds = 10;
        user.password = await bcrypt.hash(newPassword, saltRounds);

        // Supprimer le token de réinitialisation
        user.resetToken = null;

        await user.save();

        res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la réinitialisation du mot de passe.", error: error.message });
    }
};

module.exports = { requestPasswordReset, resetPassword };
