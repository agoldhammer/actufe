import { startMongo } from "./db/mongo";

// this runs once when server is started to establish connection with db
startMongo().then( () =>
    console.log("Mongo started")
)