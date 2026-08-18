const mongoose = require('mongoose');
let isConnected=false; async function connectDB(){ if(isConnected) return; await mongoose.connect(process.env.MONGODB_URI); isConnected=true; }
const Schema = new mongoose.Schema({name:String,email:String,message:String,createdAt:{type:Date,default:Date.now}});
const Model = mongoose.models.Message || mongoose.model('Message', Schema);
module.exports = async (req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*'); res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS'); res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.status(200).end();
  try{ await connectDB();
    if(req.method==='POST'){ const doc=await Model.create(req.body); return res.json({ok:true,id:doc._id}); }
    const data=await Model.find().sort({createdAt:-1}); return res.json(data);
  }catch(e){ res.status(500).json({error:e.message}); }
}