const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

// Créer un message (optionnel)
router.post("/", messageController.createMessage);

// Récupérer l'historique des messages entre deux utilisateurs pour un trajet
router.get("/", messageController.getMessagesByUsers);

// Récupérer un message par ID
router.get("/:id", messageController.getMessageById);

// Supprimer un message
router.delete("/:id", messageController.deleteMessage);

module.exports = router;