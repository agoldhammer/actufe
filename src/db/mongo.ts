import { MongoClient } from "mongodb";
import { MONGOURL } from '$env/static/private';

const client = new MongoClient(MONGOURL)

export function startMongo() {
    console.log("starting mongo client")
    return client.connect()
}

export default client.db()
