const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Inscription
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const user = new User({ name, email, password, phone, role });
    await user.save();
    res.status(201).json({ message: "Utilisateur créé avec succès", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ error: "Email incorrect" });

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(400).json({ error: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Liste des utilisateurs
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if(!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.json(user);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
};

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if(!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.json(user);
  } catch(err) {
    res.status(400).json({ error: err.message });
  }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if(!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.json({ message: "Utilisateur supprimé" });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
};