var app = require('base');

var HomeController = app.ControllerView.extend({
    Actions: {
        index: require('./index.js')
    }
});

module.exports = HomeController;
