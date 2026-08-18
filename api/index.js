const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  mongoose.connect(MONGO_URI).catch(e => console.error('Mongo error', e.message));
}

const ContactSchema = new mongoose.Schema({
  name: String, email: String, eventType: String, date: String, message: String, createdAt: { type: Date, default: Date.now }
});
const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);

app.get('/api/health', async (req, res) => {
  const state = mongoose.connection.readyState;
  res.json({ status: 'ok', db: state === 1 ? 'connected' : 'disconnected', state });
});

app.post('/api/contact', async (req, res) => {
  try {
    const doc = await Contact.create(req.body);
    res.json({ success: true, id: doc._id });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = app;
