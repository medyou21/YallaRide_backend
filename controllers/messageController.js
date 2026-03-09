const Message = require("../models/Message");

// Créer un message
exports.createMessage = async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupérer tous les messages entre 2 utilisateurs pour un trajet
exports.getMessagesByUsers = async (req, res) => {
  try {
    const { user1, user2, tripId } = req.query;
    const messages = await Message.find({
      tripId,
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 }
      ]
    }).populate("senderId", "name").populate("receiverId", "name");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Supprimer un message
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if(!message) return res.status(404).json({ error: "Message non trouvé" });
    res.json({ message: "Message supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate("senderId", "name")
      .populate("receiverId", "name");
    if(!message) return res.status(404).json({ error: "Message non trouvé" });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};