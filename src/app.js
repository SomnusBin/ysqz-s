var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var Tips = require('./widget/tips');
var app = require('base');
var Env = require('./model/env');

// 定义一些常量
var HOME_PAGE = "";

app.autoload = function(module, callback) {
    switch(module) {
        case 'home':
            require.ensure('./page/home/controller.js', function(require) {
                callback(require('./page/home/controller.js'));
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
       
    },
    handlerRouter: function() {
        
    },
    initialize: function() {
        
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

app.routerMainView = new app.MainView();

app.router = new app.Router({
    mainView: app.routerMainView,
    defaultController: 'home',
    Controller: {
        'home': 'home',
    }
});
app.mainView = new MainView();

Backbone.history.start();

