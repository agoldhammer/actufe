import { MongoClient } from 'mongodb';
import { subHours } from 'date-fns';
/* eslint-disable-next-line */
exports.handler = async (event, context) => {
	// console.log('event, context', event, context);
	// console.log(process.env.MONGO_URI);
	const client = new MongoClient(process.env.MONGO_URI);
	console.log('conn: starting mongo client');
	const time = event.queryStringParameters.time;
	console.log('conn: time:', time);
	const now = new Date();
	const then = subHours(now, 3);
	console.log('conn: now, then: ', now, then);
	const db = client.db();
	const articles = db.collection('articles');
	const data = await articles
		.find(
			{},
			{ limit: 30, projection: { _id: 0, title: 1, summary: 1, pubdate: 1, pubname: 1, link: 1 } }
		)
		.sort({ pubdate: -1 })
		.toArray();
	// console.log(data);
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
