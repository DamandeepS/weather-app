const http = require('http');
const serverPort = 3000;
const mapsAPIKey = 'AIzaSyBreImqsKzyjSd-BMOCJgtu0CYnxrat6ow';
const googleMapsClient = require('@google/maps').createClient({
  key: mapsAPIKey,
  Promise: Promise
});
http.createServer((req, resp) => {
  console.log(req.url);
  resp.setHeader('Access-Control-Allow-Origin', '*');
	resp.setHeader('Access-Control-Request-Method', '*');
	resp.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
	resp.setHeader('Access-Control-Allow-Headers', '*');
	if ( req.method === 'OPTIONS' ) {
		resp.writeHead(200);
		resp.end();
		return;
	}
  if(req.url.startsWith("/mapsproxy/")) {

    var urlParts = req.url.split('?');
    if(!urlParts[1] || urlParts[1].indexOf("=")==-1) {
      resp.writeHead(401, 'No Query Provided', {'Content-Type': 'text/json'});
      return resp.end('{message: "No Query Provided"}');
    }


    switch (urlParts[0].split("/")[2]) {
      case "suggestions":
        var query = urlParts[1].split("input=")[1]
        googleMapsClient.placesQueryAutoComplete({input: query}).asPromise().then(res => {
          console.log(res)
          resp.writeHead(200, 'Results', {'Content-Type': 'text/json', 'Access-Control-Allow-Headers': 'http://127.0.0.1:8081'})
          return resp.end(JSON.stringify(res))
        }).catch(e => {
          console.log(e);
          resp.writeHead(405, 'Method Not Supported', {'Content-Type': 'text/json'});
          return resp.end(JSON.stringify(e));
        })
        break;
      case "geocode":
        var query = urlParts[1].split("id=")[1];
        console.log(query)
        googleMapsClient.place({placeid: query}).asPromise().then(res => {
          console.log(res)
          resp.writeHead(200, 'Place details', {'Content-Type': 'text/json'})
          return resp.end(JSON.stringify(res))
        }).catch(e => {
          console.log(e);
          resp.writeHead(405, 'Method Not Supported', {'Content-Type': 'text/json'});
          return resp.end(JSON.stringify(e));
        })
        break;
      default:

        resp.writeHead(405, 'Method Not Supported', {'Content-Type': 'text/json'});
        return resp.end('{message: "Method not supported"}');

    }
  } else {
    resp.writeHead(405, 'Method Not Supported', {'Content-Type': 'text/json'});
    return resp.end('{message: "Method not supported"}');

  }

}).listen(serverPort)
console.log('maps proxy available on localhost:' + serverPort)
