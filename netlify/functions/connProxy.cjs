exports.handler = async event => {
  // * check backend alive
  const radar_uri = process.env.RADAR_URI;
	const radar_resp = await fetch(radar_uri);
  if (radar_resp.status !== 204) {
    console.error('Backend not responding');
  }

  // console.log ('event qsp', event.queryStringParameters);
  const tf = event.queryStringParameters.timeframe || '0';
  const tw = event.queryStringParameters.timewindow || '2';
  const tx = event.queryStringParameters.txtquery;
  // console.log ('tf', tf);
  // console.log ('tw', tw);
  // console.log ('tx', tx);

  const proxy_uri = process.env.PROXY_URI;
  let uri;
  if (tx) {
    uri = `${proxy_uri}/?timeframe=${tf}&timewindow=${tw}&txtquery=${tx}`;
  } else {
    uri = `${proxy_uri}/?timeframe=${tf}&timewindow=${tw}`;
  }
  // console.log ('connProxy uri', uri);
  const body = await fetch (uri).then (resp => resp.json ());
  // TODO decoding/encoding json is inefficient; do something with stream passthrough?
  return {
    statusCode: 200,
    body: JSON.stringify (body),
  };
};
