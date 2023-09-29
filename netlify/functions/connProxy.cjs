exports.handler = async event => {
  //   console.log ('event', event);
  const tf = event.queryStringParameters.timeframe || '0';
  console.log ('tf', tf);
  const proxy_uri = process.env.PROXY_URI;
  // TODO fix this to use timewindow properly
  const uri = `${proxy_uri}/?timeframe=${tf}&timewindow=2`;
  console.log ('connProxy uri', uri);
  const body = await fetch (uri).then (resp => resp.json ());
  // TODO decoding/encoding json is inefficient; do something with stream passthrough?
  return {
    statusCode: 200,
    body: JSON.stringify (body),
  };
};
