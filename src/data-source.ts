import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User.js"
import dotenv from "dotenv"
dotenv.config()
export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: process.env.DB_USER ,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
})
