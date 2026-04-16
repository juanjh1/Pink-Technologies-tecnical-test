import { AppDataSource } from "./data-source.js"
import express from "express"
import { userRoutes } from "./routes/user.routes.js"
import { authRoutes } from "./routes/auth.routes.js"
const app = express()
app.use(express.json())
app.use("/auth", authRoutes())
app.use("/users", userRoutes())
const port = 8100

AppDataSource.initialize().then(async () => {
  app.listen(port, ()=>{
    console.log(`server is listen on a port ${port}`)    
  })
}).catch(error => console.log(error))
