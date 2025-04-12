require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Mongo error:", err));

const User = mongoose.model('User', new mongoose.Schema({
  uid: { type: String, unique: true },
  username: String,
  createdAt: { type: Date, default: Date.now }
}));

app.post('/api/signup', async (req, res) => {
  const { uid, username } = req.body;
  if (!uid || !username) return res.status(400).json({ error: 'Missing uid or username' });

  try {
    const user = await User.findOneAndUpdate(
      { uid },
      { username },
      { upsert: true, new: true }
    );
    res.json({ message: 'User stored', user });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: 'Failed to save user' });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
