const bcrypt = require('bcrypt');
const UserModel = require("../models/User.model");

const login = async (req, res) => {
    try {
        // 1. Récupérer l'email et le mot de passe de la requête
        const { email, password } = req.body;

        // 2. Vérifier si un utilisateur avec cet email existe dans la base de données
        const user = await UserModel.findOne({ email });
        if (!user) {
            // Si l'utilisateur n'existe pas, retourner une erreur
            return res.status(400).json({ message: "Email ou mot de passe incorrect" });
        }

        // 3. Vérifier si le mot de passe est correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            // Si le mot de passe ne correspond pas, retourner une erreur
            return res.status(400).json({ message: "Email ou mot de passe incorrect" });
        }

        // 4. Si l'authentification réussit, retourner une réponse de succès
        return res.status(200).json({ message: "Connexion réussie", user: user });
    } catch (err) {
        // En cas d'erreur, retourner un message d'erreur
        return res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

module.exports = { login };
