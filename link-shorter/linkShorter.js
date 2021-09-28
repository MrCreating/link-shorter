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

class LinkShorter {
	#currentDataBAseConnection;
	#currentCacheConnection;

	constructor (databaseConnection = null, cacheConnection = null) {
		const ConnectionManager = require('./connectionManager.js');

		if (!databaseConnection) {
			this.#currentDataBAseConnection = ConnectionManager.getDBConnection('', '', '', '');
		}
		if (!cacheConnection) {
			this.#currentCacheConnection = ConnectionManager.getCacheConnection();
		}
	}
}

module.exports = {
	LinkShorter: LinkShorter
}