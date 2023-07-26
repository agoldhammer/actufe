import db from "./mongo"

export const articles = db.collection("articles")