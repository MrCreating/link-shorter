console.log('[OK] Application is loaded, now reading the config');

const API = require('./link-shorter/api.js');
const LinkShorter = require('./link-shorter/linkShorter.js');

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

if (!config.server.domain || config.server.port) {
	console.log('[!] Specify the domain and port in config.');
	process.exit(1);
}

if (!config.database.host || !config.database.user || !config.database.password) {
	console.log('[!] Specify database host, username and password in config.');
	process.exit(1);
}