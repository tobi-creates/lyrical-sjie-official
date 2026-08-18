const mongoose = require('mongoose');
let isConnected=false; async function connectDB(){ if(isConnected) return; await mongoose.connect(process.env.MONGODB_URI); isConnected=true; }
module.exports = async (req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  try{ await connectDB(); res.json({ok:true,connected:true,db:'lyricalsjiedb 7455'}); }
  catch(e){ res.status(500).json({ok:false,error:e.message}); }
}