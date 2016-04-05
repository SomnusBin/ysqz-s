var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');

var app = require('base');
var template = require('html?attrs=false!../../template/home/index.html');
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