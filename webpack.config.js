var webpack = require('webpack');
var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var htmlPlugin = new HtmlWebpackPlugin({
    title: '广告联盟-管理后台',
    template: __dirname+'/src/index.ejs',
    inject: 'body'
});
module.exports = {
    plugins: [commonsPlugin, htmlPlugin],
    entry: {
        app: './src/app.js'
    },
    output: {
        path: './dist/static/clubadmin/',
        filename: '[name].js',
        chunkFilename: 'chunkFilename_[id].js'
    },
    module: {
        loaders: []
    },
    resolve: {
        root: __dirname,
        extensions: ['', '.js'],
        alias: {
            base: 'src/helper/base.js',
        }
    }
};