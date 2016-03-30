/**
 * 各种提示组件
 * @author weixin
 */
var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var app = require('../helper/base');
var Cover = require('./cover');
var undef;

var Tips = Cover.PosCenterBase.extend({
	name: 'widget.tips',
	template: require('html?attrs=false!../template/widget/tips.html'),
	mask: true,
	events: {
		'click .s_done': function() {
			// 优先hide，再触发promise方法，防止在hide之前实例对象被destroy
			this.hide();
			if(this.def) {
				this.def.resolve();
				this.def = undef;
			}
		}
	},
	show: function(html) {
		var view = this;
		view.$('.co_ly_ctx .co_ly_ctx_body').html(html || '');
		this._super(html);

		return this.setPromise();
	}
});

var ErrorTips = Tips.extend({
	name: 'widget.tips.errortips',
	initialize: function() {
		this.$('.co_ly_ctx i.fa').addClass('fa-times-circle');
	}
});

var AlertTips = Tips.extend({
	name: 'widget.tips.alerttips',
	initialize: function() {
		this.$('.co_ly_ctx i.fa').addClass('fa-exclamation-circle');
	}
});

var SuccessTips = Tips.extend({
	name: 'widget.tips.successtips',
	initialize: function() {
		this.$('.co_ly_ctx i.fa').addClass('fa-check-circle');
	}
});

var Confirm = Tips.extend({
	name: 'widget.tips.confirm',
	events: {
		'click .s_done': function() {
			this.hide();

			if(this.def) {
				this.def.resolve();
				this.def = undef;
			}
			if(this.yesFn){
				this.yesFn();
			}
		},
		'click .s_cancel': function() {
			this.hide();

			if(this.def) {
				this.def.reject();
				this.def = undef;
			}
			if(this.noFn){
				this.noFn();
			}
		}
	},
	initialize: function() {
		this.$('.s_cancel').css("display", "inline-block");
		this.$('.co_ly_ctx i.fa').addClass('fa-question-circle');
	}
});

exports.Tips = Tips;
exports.Confirm = Confirm;
exports.ErrorTips = ErrorTips;
exports.AlertTips = AlertTips;
exports.SuccessTips = SuccessTips;