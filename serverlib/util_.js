var md5 = require('js-md5');

module.exports = {
	encode_password : function (text){
		var hash = md5.create();
		hash.update(text);
		return hash.hex();
	},
}