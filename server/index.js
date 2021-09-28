/**
 * Main server file
*/
const queryParser = require('url');
const parser = require('multiparty');
const fs = require('fs');
function processPOST (request) {
	return new Promise(function (resolve) {
		let post = new parser.Form();
          
        post.parse(request, function (error, fields, files) {
            if (error)
            	return resolve({});

            return resolve(fields);
        });
	});
}

const mainPage = fs.readFileSync('./server/main.html');
const favicon  = fs.readFileSync('./server/favicon.ico');
module.exports = function (req, res, context) {
	let url = queryParser.parse(req.url, true);
	let currentPage = url.href;

	if (currentPage === '/' && req.method === 'GET') {
		return res.end(showHTML());
	} else if (currentPage === '/favicon.ico') {
		return res.end(favicon);
	} else if (currentPage === '/' && req.method === 'POST') {
		return processPOST(req).then(function (POST) {
			let action = POST.action[0];
			if (action === 'createLink') {
				let url = POST.url[0];
				let screen_name = POST.screen_name[0];
				if (screen_name === '') screen_name = null;

				return context.API.createURL(context.linkShorter, context.config.server.domain, url, screen_name).then(function (result) {
					return res.end(JSON.stringify(result));
				});
			}

			return res.end(JSON.stringify({error: 1}));
		});
	} else {
		let query = currentPage.substr(1, currentPage.length);

		return context.linkShorter.getLink(query).then(function (url) {
			res.writeHead(301, {
				Location: url
			});

			return res.end();
		}).catch(function (err) {
			res.writeHead(301, {
				Location: '/'
			});

			return res.end('Failed to redirect to this url.');
		})
	}
}

function showHTML () {
	return mainPage;
}