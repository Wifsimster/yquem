const Yquem = require('./yquem')

Yquem.getSubtitle('d:\\hexawin8\\Krypton\\Season 1\\Krypton - 1x01.avi', {
	languages: 'en'
})
	.then(response => {
		console.log(response)
	})
	.catch(err => {
		console.error(err)
	})
