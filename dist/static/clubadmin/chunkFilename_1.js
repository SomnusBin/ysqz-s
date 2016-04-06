webpackJsonp([1,2],{

/***/ 9:
/***/ function(module, exports, __webpack_require__) {

	var app = __webpack_require__(5);

	var HomeController = app.ControllerView.extend({
	    Actions: {
	        index: __webpack_require__(10)
	    }
	});

	module.exports = HomeController;


/***/ },

/***/ 10:
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(1);
	var _ = __webpack_require__(2);
	var Backbone = __webpack_require__(3);

	var app = __webpack_require__(5);
	var template = __webpack_require__(11);
	var undef;

	var IndexAction = app.ActionView.extend({
		template: template,
		events: {
	        
		},
	    initialize: function() {
	    	this.$el.html(this.template);
	    }
	});

	module.exports = IndexAction;

/***/ },

/***/ 11:
/***/ function(module, exports) {

	module.exports = "\n<layout src=\"./common/layout.html\">\n\t<!-- 头部导航 -->\n\t<div class=\"header\">\n\t\t<div class=\"header_left\">\n\t\t\t<a href=\"#\" title=\"艺术圈子\"><span class=\"logo\"></span></a>\n\t\t</div>\n\t\t<div class=\"header_right\">\n\t\t\t<ul>\n\t\t\t\t<li><a href=\"\" title=\"123\"><span></span></a></li>\n\t\t\t\t<li><a href=\"\" title=\"123\"><span></span></a></li>\n\t\t\t\t<li><a href=\"\" title=\"123\"><span></span></a></li>\n\t\t\t</ul>\n\t\t</div>\n\t</div>\n\t<!-- 轮播图 -->\n\t<div class=\"slider-wrapper\">\n\t\t<div class=\"slider\">\n\t\t\t\n\t\t</div>\n\t</div>\n\t<!-- 功能 -->\n\t<div class=\"design\">\n\t\t<dd class=\"vis\">\n\t\t\t<a href=\"#\"></a>\n\t\t</dd>\n\t\t<dd class=\"vis\">\n\t\t\t<a href=\"#\"></a>\n\t\t</dd>\n\t\t<dd class=\"vis\">\n\t\t\t<a href=\"#\"></a>\n\t\t</dd>\n\t\t<dd class=\"vis\">\n\t\t\t<a href=\"#\"></a>\n\t\t</dd>\n\t\t<dd class=\"vis\">\n\t\t\t<a href=\"#\"></a>\n\t\t</dd>\n\t\t<dd class=\"vis\">\n\t\t\t<a href=\"#\"></a>\n\t\t</dd>\n\t\t<dd class=\"vis\">\n\t\t\t<a href=\"#\"></a>\n\t\t</dd>\n\t\t<dd class=\"vis\">\n\t\t\t<a href=\"#\"></a>\n\t\t</dd>\n\t</div>\n\t<!-- 页脚\t -->\n\t<div class=\"footer\">\n\t\t<div class=\"footer_icon\">\n\t\t\t<a href=\"#\" title=\"关于艺术圈子\" target=\"_blank\"></a>\n\t\t</div>\n\t\t<p>为了让作品与众不同而去打破已经建立好的模式，这就是创造力</p>\n\t\t<div class=\"copyright_w\">\n\t\t\t<a href=\"\" target=\"_blank\" title=\"关于奇迹秀\">关于奇迹秀</a>　|　<a href=\"\" target=\"_blank\" title=\"联系\">联系</a>　|　<a href=\"\" target=\"_blank\" title=\"合作\">合作</a>　|　<a href=\"\" target=\"_blank\" title=\"记录人生\">记录人生</a>　|　<a href=\"down/index.htm\" target=\"_blank\" title=\"工具箱\">工具箱</a>　|　<a href=\"\" target=\"_blank\" title=\"在线简历\">在线简历</a>　|　<a href=\"\" target=\"_blank\" title=\"友情链接\">友情链接</a>　|　<a>209609939</a><a target=\"_blank\" href=\"http://jq.qq.com/?_wv=1027&amp;k=VrhwFk\" style=\"color: #EA2F2F;\">（大神休闲群）</a>　|　<a>28093183</a><a target=\"_blank\" href=\"http://jq.qq.com/?_wv=1027&amp;k=effaVS\" style=\"color: #EA2F2F;\">（大神学习群）</a>　|　\n\t\t</div>\n\t\t<div class=\"copyright_certificate\">\n\t\t\t蜀ICP备14021999号&nbsp;Copyright&nbsp;©&nbsp;www.NNNNN.com. All Rights Reserved.\n\t\t</div>\n\t</div>\n</layout>";

/***/ }

});