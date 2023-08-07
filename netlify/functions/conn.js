import { MongoClient } from 'mongodb';
import { subHours, format } from 'date-fns';
/* eslint-disable-next-line */
exports.handler = async (event, context) => {
	// db setup
	const timewindow = 2;
	const client = new MongoClient(process.env.MONGO_URI);
	const db = client.db();
	const articles = db.collection('articles');
	console.log('conn: starting mongo client');

	// time setup
	const tf = event.queryStringParameters.timeframe || '0';
	const timeframe = parseInt(tf, 10);
	console.log('conn: timeframe:', timeframe);
	const now = new Date();
	const end = subHours(now, timeframe * timewindow);
	const start = subHours(end, timewindow);
	let data;
	let ndocs = 0;

	try {
		data = await articles
			.find(
				{ pubdate: { $gte: start, $lt: end } },
				{ projection: { _id: 0, title: 1, summary: 1, pubdate: 1, pubname: 1, link: 1, hash: 1 } }
			)
			.sort({ pubdate: -1 })
			.toArray();
		ndocs = await articles.countDocuments();
	} finally {
		client.close();
	}
	// console.log(data);
	const reply = {
		articles: data,
		count: data.length,
		timespan: { start: format(start, 'HH:mm O'), end: format(end, 'HH:mm O') },
		ndocs: ndocs
	};

	return {
		statusCode: 200,
		body: JSON.stringify(reply)
	};
};
