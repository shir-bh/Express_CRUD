import express from 'express';
import * as fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import {v4 as uuidv4} from "uuid";

const __dirname = dirname(fileURLToPath(import.meta.url));
const router=express.Router();
let currData=[];
const readData= async (res,req,next)=>{
    try {
        const DATA =  await fs.readFile(path.resolve(__dirname,'../data.json'),'utf-8');
        const {users} = JSON.parse(DATA)
        currData = users
        next()
      } catch (err) {
        console.log(err)
        next(err)
      }
}
const logs=async(req,res,next)=>{
    try {
        await fs.appendFile(path.resolve(__dirname,'../logs.txt'),  `${req.method} ${req.originalUrl} \n`)
        next();
      } catch (err) {
          console.log(err);
          next(err);
      }
    }
    
    const handleErrors = (err, req, res, next) => {
        return res.status(500).json({
          status: 'error',
          message: err.message
        });
      }


const writeToFile= async (db)=>{
    try {
        await fs.writeFile(path.resolve(__dirname,'../data.json'),  JSON.stringify({users: db}))
      } catch (err) {
          console.log(err);
      }
    }

    router.use(readData);
    router.use(logs);
    router.use(handleErrors);
router.get('/',(req, res) => {
    res.json(currData)
  })
  router.get('/:id',(req, res) => {
      const index=currData.findIndex((item)=>item.id==req.params.id);
      if(index!==-1)
        res.json(currData[index])
    else
    res.send(`cant find user id :${req.params.id}`);
  })
  router.post('/add',(req,res)=>{
      if(req.body&&req.body.first_name&&req.body.last_name&&req.body.email){
        const id=uuidv4();
        const newUser={...req.body,id:id};
        const newData=[...currData,newUser]
        writeToFile(newData);
        res.send(`posted new iser with id :${id}`);
      }
    else{
        res.send("failed to post new user")
    }
  })
  router.put('/replace/:id',(req,res)=>{
    if(req.body){
      const userIndex=currData.findIndex((item)=>item.id==req.params.id);
      const newUser={...req.body};
      currData[userIndex]=newUser;
      writeToFile(currData);
      res.send(`replaced user id:${req.params.id}`);
    }
    else{
        res.send("failed replace");
    }
})
  router.patch('/update/:id',(req,res)=>{
      if(req.body){
        const userIndex=currData.findIndex((item)=>item.id==req.params.id);
        const newUser={...currData[userIndex],...req.body};
        currData[userIndex]=newUser;
        writeToFile(currData);
        res.send(`updated user id:${req.params.id}`);
      }
      else{
          res.send("failed update");
      }
  })
  router.delete('/remove/:id',(req,res)=>{
      const newData=currData.filter((item)=>item.id!=req.params.id);
      if(newData.length===currData.length){
          res.send(`delete id :${req.params.id} failed`);
      }
      else{
        writeToFile(newData);
        res.send(`deleted id: ${req.params.id}`);
      }
  })
  router.get("*", (req,res) => {
    res.status(404).send("NOT FOUND")
})
export default router;