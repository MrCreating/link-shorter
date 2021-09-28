/**
 * Main source code file.
 *
 * Class LinkShorter
 * method: createLink (readableUrl = null)
 * Creates a shorted link fron url 
 * return: string query or user-given url
 *
 * method: getLink (query - required string)
 * Get a URL by query from DB or cache.
 * return: url string, it can be used to redirect.
*/

/**
 * Used MySQL table:
 * links.data (id BIGINT PRIMARY KEY AUTOINCREMENT, query TEXT, url TEXT);
*/

module.exports = class LinkShorter {
	#currentDataBAseConnection;
	#currentCacheConnection;

	#getRandomString = function (string = 'abcdefghijklmnopqrstuvwxyz123456789ABCDEFGHIJKLOMNPQRSTUVWXYZ', stringLenth = 8) {
		return string.split('').sort(function() { return 0.5 - Math.random() }).join('').substr(0, Number(stringLenth) || 8);
	}

	constructor (config = null, databaseConnection = null, cacheConnection = null) {
		const ConnectionManager = require('./connectionManager.js');

		if (!databaseConnection) {
			this.#currentDataBAseConnection = ConnectionManager.getDBConnection(config.database.host, config.database.user, config.database.password, 'links');
		}
		if (!cacheConnection) {
			this.#currentCacheConnection = ConnectionManager.getCacheConnection();
		}

		if (databaseConnection) {
			this.#currentCacheConnection = databaseConnection;
		}
		
		if (cacheConnection) {
			this.#currentCacheConnection = cacheConnection;
		}
	}

	createLink (neededUrl, readableUrl = null) {
		let it = this;

		return new Promise(function (resolve, reject) {
			if (typeof neededUrl !== "string") neededUrl = String(neededUrl);

			if (!neededUrl.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/)) {
				let error = new TypeError('Final URL is invalid');
				let errorCode = 3;

				error.code = errorCode;

				return reject(error);
			}

			let finalQuery = (readableUrl ? readableUrl : it.#getRandomString()).split(' ').join('');
			if (finalQuery.length > 16) {
				let error = new TypeError('URL is too long');
				let errorCode = 2;

				error.code = errorCode;

				return reject(error);
			}

			if (!finalQuery.match(/^[a-z0-9]{1}[a-z0-9_\d\s]*[a-z0-9_\s\d]{1}$/i)) {
				let error = new TypeError('URL is not match');
				let errorCode = 4;

				error.code = errorCode;

				return reject(error);
			}

			it.getLink(finalQuery).then(function (result) {
				if (!result) {
					it.#currentDataBAseConnection.query('INSERT INTO links.data (query, url) VALUES (?, ?)', [finalQuery, neededUrl], function (error, result) {
						if (error) return reject(error);

						return resolve(finalQuery);
					})
					return;
				}

				if (finalQuery == readableUrl) {
					let error = new TypeError('This URL is already exists');
					let errorCode = 1;

					error.code = errorCode;

					return reject(error);
				} else {
					it.createLink(readableUrl).then(resolve).catch(reject);
				}
			}).catch(function (err) {
				return reject(err);
			})
		});
	}

	getLink (query) {
		let it = this;

		return new Promise(function (resolve, reject) {
			it.#currentCacheConnection.get(query, function (error, result) {
				if (error) return resolve(null);
				if (result) return resolve(result);

				it.#currentDataBAseConnection.query('SELECT url FROM links.data WHERE query = ? LIMIT 1', [query], function (error, result) {
					if (error) return reject(error);

					if (result && result.length == 0) return resolve(null);

					return it.#currentCacheConnection.set(query, result[0].url, 3600, function (err) {
						return resolve(result[0].url);
					})
				});
			})	
		});
	}
}