const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// ================= PUBLIC ROUTES =================
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refreshToken);

// ================= PROTECTED ROUTES =================

// 🔐 Profil utilisateur
router.get("/me", authMiddleware, authController.getProfile);

// 🔥 Devenir conducteur (BlaBlaCar style)
router.put("/become-driver", authMiddleware, authController.becomeDriver);

module.exports = router;