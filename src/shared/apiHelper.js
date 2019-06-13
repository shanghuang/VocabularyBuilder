var agent = require('superagent');
var cookie = require('cookie');
var HOST  = require('../config.json').admin_server;
//var HOST = "";

function access_token() {
  return (typeof window !== "undefined") ? cookie.parse(document.cookie).access_token : null;
}

exports.get = (endpoint, token, query) => {
  token = token || access_token();
  return  agent.get(HOST+endpoint).query({ 'access_token': token }).query(query);
};

exports.post = (endpoint, data, token, query) => {
  token = token || access_token();
  return  agent.post(HOST+endpoint).send(data).query({ 'access_token': token }).query(query);
};

exports.put = (endpoint, data, token, query) => {
  token = token || access_token();
  return  agent.put(HOST+endpoint).send(data).query({ 'access_token': token }).query(query);
};

exports.del = (endpoint, token, query) => {
  token = token || access_token();
  return  agent.del(HOST+endpoint).query({ 'access_token': token }).query(query);
};

exports.localTime = (utcTime) => {
  var  ut = new Date(utcTime);
  var d1 = new Date().getTimezoneOffset();
  var d2 = new Date(ut.getTime() - d1*60000);
  return d2;
};

exports.isMobile = () => {

	if(typeof window === "undefined")
		return false;

	return ['iPhone', 'Android'].some(function(keyword){
		return ( navigator.userAgent.indexOf(keyword) > -1 );
	});

};
