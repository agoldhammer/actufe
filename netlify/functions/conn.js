import { MongoClient } from 'mongodb';
/* eslint-disable-next-line */
exports.handler = async (event, context) => {
	console.log('event, context', event, context);
	console.log(process.env.MONGO_URI);
	const client = new MongoClient(process.env.MONGO_URI);
	console.log('conn: starting mongo client');
	console.dir(client);
	const db = client.db();
	const articles = db.collection('articles');
	const data = await articles
		.find({}, { limit: 30, projection: { _id: 0, title: 1, summary: 1, pubdate: 1 } })
		.sort({ pubdate: -1 })
		.toArray();
	console.log(data);
	const reply = {
		articles: data,
		count: data.length,
		message: 'Hello Conn'
	};

	return {
		statusCode: 200,
		body: JSON.stringify(reply)
	};
};

// export function startMongo() {
//   console.log("starting mongo client");
//   return client.connect();
// }

// export default client.db();
