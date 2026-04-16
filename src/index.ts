import { AppDataSource } from "./data-source.js"
import express from "express"

const app = express()
const port = 8100


AppDataSource.initialize().then(async () => {
  app.listen(port, ()=>{
    console.log(`server is listen on a port ${port}`)    
  })
}).catch(error => console.log(error))
