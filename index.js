console.log('[OK] Application is loaded, now reading the config');

const API = require('./link-shorter/api.js');
const LinkShorter = require('./link-shorter/linkShorter.js');
const ConnectionManager = require('./link-shorter/connectionManager.js');
const fs = require('fs');

let config = null;
try {
	config = require('./config.json');
	console.log('[OK] config file found and parsed successfully.');
} catch (e) {
	console.log('[!] Config file loading failed.');
	process.exit(1);
}

if (!config.server) {
	console.log('[!] Server block in config is required.');
	process.exit(1);
}
if (!config.database) {
	console.log('[!] Database block in config is required.');
	process.exit(1);
}
if (!config.https) {
	console.log('[!] HTTPS block in config is required.');
	process.exit(1);
}

if (!config.server.domain || !config.server.port) {
	console.log('[!] Specify the domain and port in config.');
	process.exit(1);
}

if (!config.database.host || !config.database.user || !config.database.password) {
	console.log('[!] Specify database host, username and password in config.');
	process.exit(1);
}

console.log('[OK] Config parsed successfully. Now initializing the server...');
const linkShorterSession = new LinkShorter(config);
const serverOptions = {};
const server = require('./server/index.js');

let useHTTPS = config.https.ssl_cert && config.https.ssl_key;
let serverManager = useHTTPS ? require('https') : require('http');
if (useHTTPS) {
	console.log('[+] Found HTTPS serticates paths. Trying to load it...');

	try {
		let cert = fs.readFileSync(config.https.ssl_cert);
		let key = fs.readFileSync(config.https.ssl_key);

		serverOptions.key = key;
		serverOptions.cert = cert;
		console.log('[OK] Certificates loaded. Use HTTPS mode.');
	} catch (e) {
		console.log('[!] Certificates loading failed. Rolling back to HTTP.');
		useHTTPS = false;
		serverManager = require('http');
	}
}

console.log('[OK] Server initialized. Now starting it...');
serverManager.createServer(serverOptions, function (req, res) {
	return server(req, res, {
		config: config,
		API: API,
		linkShorter: linkShorterSession,
		connectionManager: ConnectionManager
	});
}).listen(config.server.port, function () {
	console.log('[OK] Server started successfully.');
});