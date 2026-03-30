const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token manquant" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 récupérer user réel (pas seulement JWT)
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: "Utilisateur invalide" });

    req.user = {
      id: user._id,
      roles: user.roles,
    };

    next();
  } catch (err) {
    res.status(401).json({ error: "Token invalide" });
  }
};