
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
// Use ATLAS in production, localhost when you run locally
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lyricalsjiedb';

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

mongoose.connect(MONGO_URI).then(()=>console.log(`✅ MongoDB Connected: ${MONGO_URI}`)).catch(err=>console.error('❌ Mongo Error:', err));

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  type: { type: String, default: 'Show Booking' },
  message: String,
  source: String,
  createdAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema, 'contacts');

app.post('/api/contacts', async (req,res)=>{
  try{
    const doc = await Contact.create(req.body);
    console.log('📩 New booking:', doc.name);
    res.status(201).json({ success:true, data:doc });
  }catch(e){ res.status(500).json({success:false, error:e.message}); }
});

app.get('/api/contacts', async (req,res)=>{
  try{
    const docs = await Contact.find().sort({createdAt:-1});
    res.json(docs);
  }catch(e){ res.status(500).json({error:e.message}); }
});

app.get('/api/health', (req,res)=>{
  res.json({ status:'ok', db: mongoose.connection.readyState===1?'connected':'disconnected' });
});

// Export for Vercel
module.exports = app;

// Only listen when running locally (node backend/server.js)
if (require.main === module) {
  app.listen(PORT, ()=>console.log(`🚀 Local backend: http://localhost:${PORT} — Frontend http://localhost:${PORT}/index.html`));
}
