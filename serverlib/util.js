var md5 = require('js-md5');
var nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
var config = require('../src/config.json');

function encode_confirm_link(msg){
	var date = new Date();
	var hash = md5.create();
	hash.update(msg+date.toLocaleTimeString('en-US'));
	return hash.hex();
}

function SendConfirmationEmail(info){
	var transporter = nodemailer.createTransport({
	  service: 'gmail',
	  auth: {
	    user: 'sycruise.huang@gmail.com',
	    pass: 'sycr3697'
	  }
	});

	var mailOptions = {
	  from: 'sycruise.huang@gmail.com',
	  to: info.to,
	  subject: 'Sending Email using Node.js',
	  text: "hello",
	  html: info.link,
	};

	transporter.sendMail(mailOptions, function(error, info){
	  if (error) {
	    console.log(error);
	  } else {
	    console.log('Email sent: ' + info.to);
	  }
	});
}

function SendGridSendEmail(info){
	//sgMail.setApiKey(process.env.SENDGRID_API_KEY);
	sgMail.setApiKey(config.send_grid_key);
	const msg = {
		to: info.to,
		from: 'sycruise.huang@gmail.com',
		subject: 'Confirmation email from VocabularyBuilder',
		text: 'Confirmation email from VocabularyBuilder',
		html: info.link,
	};
	sgMail.send(msg);
}

module.exports = {
	encode_password : function (text){
		var hash = md5.create();
		hash.update(text);
		return hash.hex();
	},
	encode_confirm_link: encode_confirm_link,
	SendConfirmationEmail :SendConfirmationEmail,
	SendGridSendEmail : SendGridSendEmail,
}