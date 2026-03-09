const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

// Messages
router.post("/", messageController.createMessage);
router.get("/", messageController.getMessagesByUsers);
router.get("/:id", messageController.getMessageById);
router.delete("/:id", messageController.deleteMessage);

module.exports = router;