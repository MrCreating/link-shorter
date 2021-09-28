function createURL (shorterSession, currentDomain, url, readableURL = null) {
	return new Promise(function (resolve) {
		shorterSession.createLink(url, readableURL).then(function (url) {
			return resolve({
				result: {
					url: currentDomain + '/' + url
				}
			});
		}).catch(function (err) {
			return resolve({
				error: {
					code: err.code || 0,
					message: err.message
				}
			});
		})
	});
}