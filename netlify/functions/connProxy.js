exports.handler = async (event, context) => {
  const tf = event.queryStringParamters.timeframe || '0';
  const proxy_uri = process.env.PROXY_URI;
  const reply = await fetch (`${proxy_uri}/?timeframe=${tf}`);
  return reply;
};
