var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');

var app = require('base');
var User = require('../../model/user');
var template = require('html?attrs=false!../../template/home/index.html');
var undef;

var LoginModel = User.extend({
	defaults: {
		username: undef,
		password: undef,
		jumpurl: undef
	},
	verify: function() {
		var username = this.get('username');
		var password = this.get('password');
		var error = {};

		if(!_.isUndefined(username)) {
			if(username.length === 0) {
				error.username = '请输入账号';
			} else {
				if (username.length < 2) {
					error.username = '账号长度错误';
				}
			}
		}

		if(!_.isUndefined(password)) {
			if(password.length === 0) {
				error.password = '请输入密码';
			} else {
				if (password.length < 6 || password.length > 20) {
					error.password = '密码在6~20位';
				}
			}
		}

		this.trigger('illegal', this, error);

		if(_.size(error)) {
			return false;
		} else {
			return true;
		}
	}
});

var IndexAction = app.ActionView.extend({
	template: template,
	events: {
		'blur input[name="pwuser"]' : 'pickUsername',
		'blur input[name="pwpwd"]' : 'pickPassword',
		'keydown input[name="pwuser"]': function(e) {
			if(e.keyCode === 13) {
				this.$('.form_btn_s_b').trigger('click');
			}
		},
		'keydown input[name="pwpwd"]': function(e) {
			if(e.keyCode === 13) {
				this.$('.form_btn_s_b').trigger('click');
			}
		},
		'click .form_btn_s_b': function(e) {
			this.pickUsername();
			this.pickPassword();
			this.pickJumpurl();
			if(this.model.verify()) {
				this.model.login(this.model.get('username'), this.model.get('password'), this.model.get('jumpurl'))
					.done(function(data) {
						if (data.jumpurl) {
							window.location.href = data.jumpurl;
						} else {
							window.location.href = '/union/page';//这里先这样跳哦
						}
					});
			}

			return false;
		}
	},
	pickUsername: function() {
		var username = this.$('input[name="pwuser"]').val();

		this.model.set('username', username).verify();
	},
	pickPassword: function() {
		var password = this.$('input[name="pwpwd"]').val();

		this.model.set('password', password).verify();
	},
	pickJumpurl: function() {
		var jumpurl = this.$('input[name="jumpurl"]').val();

		this.model.set('jumpurl', jumpurl).verify();
	},
	errorHandler: function(model, error) {
		var usernameTips = this.$('input[name="pwuser"]').closest('.w_input_box').find('.wrong');
		var passwordTips = this.$('input[name="pwpwd"]').closest('.w_input_box').find('.wrong');

		if('username' in error) {
			usernameTips.removeClass('hidden')
				.html(error.username);
		} else {
			usernameTips.addClass('hidden')
		}

		if('password' in error) {
			passwordTips.removeClass('hidden')
				.html(error.password);
		} else {
			passwordTips.addClass('hidden')
		}
	},
    initialize: function() {
    	this.$el.html(this.template);
    	this.model = new LoginModel();
		this.model.on('illegal', _.bind(this.errorHandler, this));
    }
});

module.exports = IndexAction;