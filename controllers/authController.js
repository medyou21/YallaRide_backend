const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// 🔑 Générer Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, roles: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

// 🔑 Générer Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

//
// ================= REGISTER =================
//
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Vérifier email existant
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "Email déjà utilisé" });
    }

    // Création user
    const user = new User({
      name,
      email,
      password,
      phone,
      roles: ["passenger"] // 🔥 par défaut
    });

    await user.save();

    // Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles
      },
      accessToken,
      refreshToken
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//
// ================= LOGIN =================
//
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Email incorrect" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Mot de passe incorrect" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles
      },
      accessToken,
      refreshToken
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//
// ================= REFRESH TOKEN =================
//
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token requis" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    const newAccessToken = generateAccessToken(user);

    res.json({ accessToken: newAccessToken });

  } catch (err) {
    res.status(403).json({ error: "Refresh token invalide" });
  }
};

//
// ================= GET PROFILE =================
//
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//
// ================= DEVENIR DRIVER =================
//
exports.becomeDriver = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    if (!user.roles.includes("driver")) {
      user.roles.push("driver");
    }

    await user.save();

    res.json({
      message: "Vous êtes maintenant conducteur",
      roles: user.roles
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};