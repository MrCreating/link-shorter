/**
 * Create link and get it.
 * If it matches - test passed.
*/

const LinkShorter = require('./../link-shorter/linkShorter.js');
const startedUrl = 'https://yunnet.ru/messages';

const linkShorter = new LinkShorter();
linkShorter.createLink(startedUrl).then(function (queryResult) {
	linkShorter.getLink(queryResult).then(function (url) {
		if (url === startedUrl) {
			console.log('[OK] Test passed.');

			return process.exit(0);
		}

		console.log('[!] Test failed.\n\nStarted url is: ' + startedUrl + '\nGot URL: ' + url);

		return process.exit(1);
	}).catch(function (err) {
		console.log('[!] Test failed.\n\nGot error.');

		return process.exit(1);
	});
}).catch(function (err) {
	console.log('[!] Test failed.\n\nGot error.');

	return process.exit(0);
});