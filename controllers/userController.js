const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// 🔹 Inscription
exports.register = async (req, res) => {
  try {
    console.log("REGISTER HIT", req.body);

    const { name, email, password, phone, roles } = req.body;

    // 🔒 Vérif email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email déjà utilisé" });
    }

    // 🔒 Rôles
    const allowedRoles = ["driver", "passenger"];
    let filteredRoles = (roles || []).filter(r => allowedRoles.includes(r));

    if (!filteredRoles.length) {
      filteredRoles = ["passenger"];
    }

    // 🔐 Hash auto via pre("save")
    const user = new User({
      name,
      email,
      password,
      phone,
      roles: filteredRoles,
    });

    await user.save();

    // ❌ enlever password
    const { password: _, ...userWithoutPassword } = user.toObject();

    // 🔥 GENERER TOKEN
    const token = jwt.sign(
      {
        id: user._id,
        roles: user.roles,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      token, // 🔥 AJOUT IMPORTANT
      user: userWithoutPassword,
    });

  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(400).json({ error: "Email déjà utilisé" });
    }

    res.status(500).json({ error: "Erreur serveur" });
  }
};

// 🔹 Connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "Email incorrect" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Mot de passe incorrect" });

    // 🔥 FIX IMPORTANT → roles au lieu de role
    const token = jwt.sign(
      {
        id: user._id,
        roles: user.roles,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Liste des utilisateurs
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // 🔥 sécurité
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Récupérer un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user)
      return res.status(404).json({ error: "Utilisateur non trouvé" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
  try {
    const { name, phone, roles } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        phone,
        roles,
      },
      { new: true }
    ).select("-password");

    if (!user)
      return res.status(404).json({ error: "Utilisateur non trouvé" });

    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 🔹 Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user)
      return res.status(404).json({ error: "Utilisateur non trouvé" });

    res.json({ message: "Utilisateur supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};