/**
 * 翻页组件
 * @author weixin
 */
var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var app = require('base');
var PaginationModel = app.BaseModel.extend({
    defaults: {
        page: 1,
        total: 0,
        offset: 3,
        totalPages: 1
    }
});

var Pagination = app.BaseView.extend({
    template: require('html?attrs=false!../template/widget/pagination.html'),
    events: {
        'click a[data-page]': function(e) {
            var target = $(e.currentTarget);
            var page = target.data('page');

            this.trigger('page', page);

            return false;
        }
    },
    setup: function(data) {
        var page = data.page || 1;
        var total = data.total || 0;
        var totalPages = data.totalPages || 0;

        this.model.set('page', Number(page));
        this.model.set('total', Number(total));

        if(total === 0) {
            this.$el.html('');
        } else {
            this.$el.html(_.template(this.template)(this.model.toJSON()));
        }
    },
    initialize: function() {
        this.model = new PaginationModel();
    }
});

var ExtraPagination = Pagination.extend({
    events: _.extend({}, Pagination.prototype.events, {
        'submit form': function() {
            var input = this.$('form [name=page]');
            var page = Number(input.val());

            if(_.isNaN(page) || page < 0) {
                app.error('请输入正确的页码！');
                return false;
            }
            if(page > this.model.get('total')) {
                app.error('超过最大页数！');
                return false;
            }
            this.trigger('page', page);
            return false;
        }
    }),
    setup: function(data) {
        var totalNum = data.totalNum || 0;

        this.model.set('totalNum', totalNum);
        this._super(data);
    },
    initialize: function() {
        this._super();

        this.model.set('extra', true);
        this.model.set('totalNum', 0);
    }
});

exports.Pagination = Pagination;
exports.ExtraPagination = ExtraPagination;