/**
 * 系统一些公用的model
 * @author kelvshi
 */
var app = require('base');
var Backbone = require('backbone');
var undef;

var Env = app.BaseModel.extend({
	defaults: {
	},
},{
	apiBath: 'http://dev6.kezhanwang.cn',
	inforApi: "/union/unionadm/systemuser/apiuinfo",
	REGEXP: {
		email: /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/,
		username: /^[a-zA-z0-9]\w{5,19}$/,
		mobilephone: /^[1-9][0-9]{10}$/i,
		password: /^.{6,20}$/
	}
});

module.exports = Env;