var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var Tips = require('./widget/tips');
var User = require('./model/user');
var app = require('base');
var Env = require('./model/env');

// 定义一些常量
var HOME_PAGE = "";

app.autoload = function(module, callback) {
    switch(module) {
        case 'home':
        case 'report':
            require.ensure('./page/report/controller.js', function(require) {
                callback(require('./page/report/controller.js'));
            });
            break;
        case 'customer':
            require.ensure('./page/customer/controller.js', function(require) {
                callback(require('./page/customer/controller.js'));
            });
            break;
        case 'system':
            require.ensure('./page/system/controller.js', function(require) {
                callback(require('./page/system/controller.js'));
            });
            break;
        default:
            break;
    }
};

app.error = function(msg) {
    app.tips(msg, {type: "error"});
};

app.alert = function(msg) {
    app.tips(msg, {type: "alert"});
};

app.success = function(msg) {
    app.tips(msg);
};

app.confirm = function(msg, option) {
    var defauls = {
        type: "confirm"
    }
    if(_.isFunction(option)){
        var temp = option;
        defauls.yesFn = option;
    }else{
        defaults = _.extend(defaults, option);
    }
    app.tips(msg, defauls);
};

app.tips = function(msg, option) {
    var def = $.Deferred();
    option || (option = {});
    var instance, promise;
    if(option.type === 'error') {
        instance = new Tips.ErrorTips();
    } else if(option.type === 'alert') {
        instance = new Tips.AlertTips();
    } else if(option.type === 'success') {
        instance = new Tips.SuccessTips();
    } else if(option.type === 'confirm') {
        instance = new Tips.Confirm();
        instance.yesFn = option.yesFn;
    } else {
        instance = new Tips.SuccessTips();
    }
    promise = instance.show(msg);
    promise.then(function() {
        def.resolve();
    }, function() {
        def.reject();
    }).always(function() {
        instance.destroy();
    });
    return def.promise();
};

app.loading = function(box) {
    $(box).html('<div class="e_loading"><i class="fa fa-spinner fa-spin"></i></div>');
};

var MainView = app.MainView.extend({
    events: {
        "click .w_xt_left .redmenu a.first": function (e) {
            var this_a = $(e.currentTarget);
            if(this_a.hasClass('active')){
                this_a.removeClass('active');
            }else{
                this.$el.find('.w_xt_left .redmenu a.first').removeClass('active');
                this_a.addClass('active');
            }
            return false;
        },
        "click .head_nav .j_logout_btn": function (e) {
            var self = this;
            app.confirm("确定退出系统吗？", function(){
                self.logout();
            });
            return false;
        }
    },
    handlerRouter: function() {
        var controller = app.router.activeController;
        var action = app.router.activeAction;
        if(controller == "home"){
            controller = "report";
        }
        var topNav = this.$('.w_xt_left .redmenu>li>a[data-controller="'+controller+'"]');
        var actionDom = topNav.siblings('ul.second').find('a[data-action="'+action+'"]');

        this.$('.w_xt_left .redmenu>li>a[data-controller]').removeClass('active');
        this.$('.w_xt_left .redmenu a[data-action]').removeClass('on');
        if(topNav.size()) {
            topNav.addClass('active');
            actionDom.addClass('on');
        } else {
            this.$('.w_xt_left .redmenu>li>a[data-controller="'+app.router.defaultController+'"]');
        }
    },
    logout:function () {
        User.singleton().logout().done(function (data) {
            window.location.href = HOME_PAGE;
        })
    },
    initialize: function() {
        app.router.on('router', this.handlerRouter, this);
        // 显示昵称
        $(".j-nick_name").html(User.singleton().get('username'));
        $(".p_main_view .e_start_loading").remove();
    }
});

Backbone.oldAjax = Backbone.ajax;
Backbone.ajax = function(request) {
    request.dataType = 'jsonp';
    if(request.url.indexOf('http') != 0 || request.url.indexOf('https') != 0) {
        request.url = Env.apiBath + (request.url.indexOf('/') == 0 ? request.url : '/' + request.url);
    }

    var oldSuccess = request.success;
    var oldError = request.error;

    request.success = request.error = null;
    var ajax = Backbone.oldAjax.apply(Backbone, arguments);
    var def = $.Deferred();

    ajax.done(function(data) {
        if(data.code !== 0) {
            def.reject(ajax, data);
        } else {
            def.resolve(data.data);
        }
    });

    ajax.fail(function(ajax, textStatus, errorThrown) {
        def.reject(ajax, {});
    });

    def.done(function(data) {
        oldSuccess && oldSuccess(data);
        return data;
    });

    var reject = def.reject;
    def.reject = function(ajax, info) {
        var hasErrorTips = true;
        if (def.state() !== 'rejected') {
            def.fail(function(ajax, data) {
                var msg = '网络错误，请重试！';
                if(data.msg) {
                    msg = data.msg;
                }
                if(ajax.statusText !== 'abort' && hasErrorTips) {
                    app.error(msg);
                }
                oldError && oldError(data);
                return data;
            });
        }

        return reject.call(def, ajax, info, function(showError) {
            hasErrorTips = showError;
        });
    };

    var promise = def.promise();
    promise.abort = function() {
        ajax.abort.apply(ajax, arguments);
    };

    return promise;
};

// Backbone.history.start();
// 获取用户信息
// User.singleton().fetch({url:Env.inforApi}).done(function(data) {
//     app.routerMainView = new app.MainView({
//         el:".p_main_view",
//     });

//     app.router = new app.Router({
//         mainView: app.routerMainView,
//         defaultController: 'home',
//         Controller: {
//             'home': 'home',
//             'report': 'report',
//             'customer': 'customer',
//             'system': 'system',
//         }
//     });
//     app.mainView = new MainView();
//     Backbone.history.start();
// }).fail(function () {
//     window.location.href = HOME_PAGE;
// })

