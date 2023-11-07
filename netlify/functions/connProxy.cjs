exports.handler = async event => {
  
  const tf = event.queryStringParameters.timeframe || '0';
  const tw = event.queryStringParameters.timewindow || '2';
  const tx = event.queryStringParameters.txtquery;
  

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
