const bcrypt = require('bcrypt');
const UserModel = require("../models/User.model");

const login = async (req, res) => {
    try {
        // 1. R�cup�rer l'email et le mot de passe de la requ�te
        const { email, password } = req.body;

        // 2. V�rifier si un utilisateur avec cet email existe dans la base de donn�es
        const user = await UserModel.findOne({ email });
        if (!user) {
            // Si l'utilisateur n'existe pas, retourner une erreur
            return res.status(400).json({ message: "Email ou mot de passe incorrect" });
        }

        // 3. V�rifier si le mot de passe est correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            // Si le mot de passe ne correspond pas, retourner une erreur
            return res.status(400).json({ message: "Email ou mot de passe incorrect" });
        }

        // 4. Si l'authentification r�ussit, retourner une r�ponse de succ�s
        return res.status(200).json({ message: "Connexion r�ussie", user: user });
    } catch (err) {
        // En cas d'erreur, retourner un message d'erreur
        return res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

module.exports = { login };
