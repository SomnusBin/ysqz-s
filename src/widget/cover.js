/**
 * 各种提示组件
 * @author weixin
 */
var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var app = require('../helper/base');

var Base = app.BaseView.extend({
	name: null,
	className: 'cover-wrapper',
	el: null,
	constructor: function(options) {
		_.extend(this, _.pick(options, ['name', 'template']));

		var oldShow = this.show;
		var oldHide = this.hide
		this.show = function() {
			var option = arguments[arguments.length - 1];
			option || (option = {});
			this.status = 1;
			this.trigger('show', this);
			var ret = oldShow.apply(this, arguments);
			return ret;
		};
		this.hide = function() {
			var option = arguments[arguments.length - 1];
			option || (option = {});
			if(!option.silent) {
				this.status = 0;
				this.trigger('hide', this);
			}
			var ret = oldHide.apply(this, arguments); 
			return ret;
		};

		Backbone.View.prototype.constructor.call(this);
		this.hide();

		Cover.singleton().register(this);
	},
	status: 0,
	mask: false,
	show: function() {
		return this.$el.show();
	},
	hide: function() {
		return this.$el.hide();
	},
	setPromise: function() {
		this.def = $.Deferred();

		return this.def.promise();
	},
	setElement: function(element) {
		var ret = this._super(element);
		if(this.template) {
			this.$el.html(_.result(this, 'template'));
		}
		return ret;
	},
	destroy: function() {
		Cover.singleton().unregister(this);
		this.undelegateEvents();
		this.remove();
		this.off();
	}
});

var PosCenterBase = Base.extend({
	show: function() {
		var ret = this._super();
		this.setPosCenter();

		return ret;
	},
	setPosCenter: function() {
		var width = this.$el.outerWidth();
		var height = this.$el.outerHeight();
		var wWdith = $(window).width();
		var wHeight = $(window).height();

		var left = (wWdith-width)/2;
		var top = (wHeight-height)/2 + $(window).scrollTop();
		if(top < 0) {
			top = 0;
		}
		this.$el.css({
			left: left,
			top: top
		});
	},
	setElement: function(element) {
		var ret = this._super(element);

		this.$el.css('position', 'absolute');

		return ret;
	}
});

var Cover = app.BaseView.extend({
	zIndex: 1000,
	subview: null,
	className: 'w_cover',
	el: null,
	isHide: true,
	currentView: null,
	initialize: function() {
		var view = this;
		this.subview = [];
		this.mask = $('<div>').addClass('w_cover_mask');
		this.mask.css('position', 'relative');
		this.mask.on('click', function() {
			var currentView = view.currentView;
			if(currentView && currentView.mask && currentView.maskClickHide) {
				currentView.hide();
			}
		});
		this.$el.append(this.mask);
		$(app.mainView.$el).append(this.$el);
		$(window).on('resize', function() {
			if(!view.isHide) {
				view.resetPostionMask();
			}
			_.each(view.subview, function(view) {
				if(view instanceof PosCenterBase) {
					if(view.status === 1) {
						view.setPosCenter();
					}
				}
			});
		});
	},
	register: function(widget) {
		if(widget.name) {
			widget.$el.data('name', widget.name);
		}
		widget.app = app;
		this.subview.push(widget);

		widget.on('hide', _.bind(function(view) {
			this.checkHideStatus(view);
			this.adjustMaskIndex();
			this.checkCurrentView();
		}, this));

		widget.on('show', function(view) {
			this.showReady(view);
			this.adjustMaskIndex();
			this.checkCurrentView();
		}, this);

		this.$el.append(widget.$el);
	},
	unregister: function(view) {
		this.subview = _.without(this.subview, view);
	},
	checkCurrentView: function() {
		var maxIndex = 0;
		var maxView;
		_.each(this.subview, function(view) {
			if(view.status && view.zIndex >= maxIndex) {
				maxIndex = view.zIndex;
				maxView = view;
			}
		});

		if(maxIndex) {
			this.currentView = maxView;
		} else {
			this.currentView = null;
		}
	},
	adjustMaskIndex: function() {
		var maxIndex = 0;

		_.each(this.subview, function(view) {
			if(view.mask && view.status) {
				var index = view.zIndex;
				index = Number(index);

				if(!_.isNaN(index)) {
					if(index > maxIndex) {
						maxIndex = index;
					}
				}
			}
		});

		if(maxIndex) {
			this.mask.css('z-index', maxIndex-1);
		}
	},
	showReady: function(view) {

		// this.resetPosition();
		this.mask.hide();
		_.each(this.subview, function(view) {
			if(view.mask) {
				this.mask.show();
				this.resetPostionMask();
			}
		}, this);

		var zIndex = this.zIndex;

		this.$el.css('z-index', zIndex++);
		view.zIndex = zIndex;
		view.$el.css('z-index', zIndex++);
		this.$el.show();

		this.zIndex = zIndex;

		this.isHide = false;
	},
	resetPostionMask: function() {
		var width = $(document.body).width();
		var height = $(document.body).height();
		if(width == 0) {
			width = $(document.body).width();
		}
		this.mask.css({
			width: width,
			height: height
		});
	},
	resetPosition: function() {
		var scrollTop = $(window).scrollTop();
		this.$el.css('top', scrollTop);
		$('html').css('overflow-y', 'hidden');
	},
	checkHideStatus: function() {
		var toHide = true;
		_.each(this.subview, function(view) {
			if(view.status) {
				toHide = false;
			}
		}, this);

		if(toHide) {
			this.isHide = true;
			this.$el.hide();
		}
	},
	hideSub: function(except) {
		except = except || [];
		if(!_.isArray(except)) {
			except = [except];
		}
		_.each(this.subview, function(view) {
			if(!~_.indexOf(except, view.name)) {
				view.hide({silent: true});
			}
		});
	}
}, {
	Base: Base,
	PosCenterBase: PosCenterBase
});

module.exports = Cover;
