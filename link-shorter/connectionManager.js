/**
 * Connection manager - is a class for managing MySQL and MemCached connections
 *
 * static method: getDBConnection
 * return: created connection Object
 *
 * static method: getCacheConnection
 * return: created Memcached connection object.
*/
module.exports = class ConnectionManager {
	constructor () {
		throw new TypeError('This class can not be constructed.');
	}

	static getDBConnection (host, user, password, database) {
		let mysql = require('mysql');

		let connection = mysql.createConnection({
			host: host,
			user: user,
			password: password,
			database: database
		});

		connection.connect();
		return connection;
	}

	static getCacheConnection (host = '127.0.0.1', port = '11211') {
		let Memcached = require('memcached');

		return new Memcached(host + ':' + port);
	}
}