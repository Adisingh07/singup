require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ Mongo error:", err));

// Define User schema
const User = mongoose.model('User', new mongoose.Schema({
  uid: { type: String, unique: true },
  username: String,
  createdAt: { type: Date, default: Date.now }
}));

// Signup route
app.post('/api/signup', async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: 'Access token is required' });
  }

  try {
    // Validate token with Pi API
    const piResponse = await axios.get('https://api.minepi.com/v2/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const { uid, username } = piResponse.data.user;

    // Upsert user in DB
    const user = await User.findOneAndUpdate(
      { uid },
      { username },
      { upsert: true, new: true }
    );

    res.json({ message: '✅ User verified and stored', username: user.username });
  } catch (err) {
    console.error("❌ Verification or DB error:", err.response?.data || err.message);
    res.status(401).json({ error: 'Invalid or expired access token' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
