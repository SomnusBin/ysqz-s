/**
 * @author: weixin
 * @project: kezhan-club
 * @structure: 
 *   ~/dist
 *    - css: css样式目录
 *      - style.css: 同步加载的css，放置首屏所需的css和公用css
 *                   映射自src/assets/less/style/style.less
 *                   增加了include功能，包含了style文件夹下所有的less文件
 *                   并经过less编译后与
 *                   [vendor/normalize.css/normalize.css,src/assets/css/global.css]
 *                   合并
 *      - component.css: 页面组件的css，这个css是异步加载的
 *                       映射自src/assets/less/component/component.less
 *                       增加了include功能，包含了component文件夹下所有的less文件
 *    - images: 映射自src/assets/images
 *    - js: js目录
 *      - lib.js: vendor下所有js合并而成
 *      - app.js: 业务逻辑全局js，由src下app.js和helper、model、page下所有js合并而成
 *      - widget.js: 组件的js
 *    - pages: 制作稿目录，从pages目录映射过来 
 * @task:
 *   page: 制作稿开发
 *   hash: 计算上线文件的hash并写入version.json内
 *   proxy: 线上文件代理
 *   release: 生成生产文件
 *   deploy: 部署到线上
 */
var path = require('path');
var bone = require('bone');
var include = bone.require('bone-act-include');
var less = bone.require('bone-act-less');
var concat = bone.require('bone-act-concat');
var layout = bone.require('bone-act-htmllayout');
// var autoprefixer = bone.require('bone-act-autoprefixer');

var dist = bone.dest('dist');
var staticDir = bone.dest('dist/static/clubadmin');

// css style
staticDir.dest('css')
    .src('~/src/assets/less/*/style.less')
    .dir('./')
    .act(less)
    // .act(autoprefixer({}, {
    //     filter: {
    //         ext: ['.less', 'css']
    //     }
    // }))
    .rename(function(fileName, filePath, fileInfo) {
        var name = path.basename(fileInfo.dir);
        return name+'.css';
    });

// images
staticDir.dest('images')
    .src('~/src/assets/images/*');
// dist/static/fonts
staticDir.dest('fonts')
    .src('~/vendor/fonticon/fonts/*');

// 制作稿
dist.dest('pages')
    .src([
        '~/pages/*.html',
    ])
    .act(layout)
    .act(include);

bone.cli(require('bone-cli-build')());

// 制作稿开发
bone.task('page', {
    cli: require('bone-cli-connect')({
        base: '~/dist',
        livereload: true
    })
});

// dist文件内容生成
bone.task('webpack', {
    exec: 'node node_modules/webpack/bin/webpack.js',
});

// release
bone.task('release', 'build', 'webpack', {
    exec: 'grunt clean copy strip',
    desc: '删除旧文件 & 复制源文件 & 去debug信息'
}, {
    exec: 'grunt uglify:dist',
    desc: '压缩js'
}, {
    exec: 'grunt cssmin:dist',
    desc: '压缩css'
}, 'hash');

// calc hash
bone.task('hash',  function() {
    var fs = require('fs');
    var md5 = require('MD5');
    var version = {};
    var bonefs = this.fs;
    var files = bonefs.search('~/dist/static_min/**/*.*');
    var distPath = bonefs.pathResolve('~/dist/static_min');
    var path = require('path');
    var ignoreExt = {'.json': true};

    bone.log('正在计算hash值！');

    files.forEach(function(file) {
        // filter image
        if(path.extname(file) in ignoreExt) 
            return;
        var ctn = fs.readFileSync(file);
        var p = file.replace(distPath+'/', '/');

        version[p] = md5(ctn).substr(-6);
    });
    console.log('写入version.json文件.');
    bonefs.writeFile('~/dist/version.json', JSON.stringify(version, null, 4));
});
// scp to dev
bone.task('scp', function() {
    var client = require('scp2');
    var static = this.fs.pathResolve('~/dist/static');
    var pages = this.fs.pathResolve('~/dist/pages');
    var version = this.fs.pathResolve('~/dist/version.json');
    bone.log('sync', 'start sync to dev6.');
    // scp static
    client.scp(static, {
        host: '123.56.156.37',
        username: 'root',
        password: '',
        path: '/a/domains/dev6.kezhanwang.cn/kz/static'
    }, function(err) {
        if(err) {
            throw err;
        } else {
            bone.log.info('sync','upload "dist/static" success!');
        }
    });
    // scp pages
    client.scp(pages, {
        host: '123.56.156.37',
        username: 'root',
        password: '',
        path: '/a/domains/dev6.kezhanwang.cn/kz/pages/clubadmin/pages'
    }, function(err) {
        if(err) {
            throw err;
        } else {
            bone.log.info('sync','upload "dist/pages" success!');
        }
    });
});
// copy to php
bone.task('copy', function() {
    var fs = require('fs-extra');
    var bonefs = this.fs;
    bone.log('复制js文件到php目录');
    fs.copy(bonefs.pathResolve('~/dist/static_min'), bonefs.pathResolve('~/../../web/trunk/kz/static'), function (err) {
        if (err) {
            console.log('复制文件失败！');
            return console.error(err)
        }
        fs.copy(bonefs.pathResolve('~/dist/version.json'), bonefs.pathResolve('~/../../web/trunk/kz/static/version.json'), function() {
            console.log('成功复制frontend构建文件到static目录!');

        });
    });
});
// deploy
bone.task('deploy', function() {
    var request = require('request');
    var bonefs = this.fs;
    var fs = require('fs');
    var version = fs.readFileSync(bonefs.pathResolve('~/dist/version.json'));
    var zipPathRoot = bonefs.pathResolve('~/dist/static_min');
    var NativeZip = require("node-native-zip");
    var zip = new NativeZip();
    // 从远端获取版本号文件
    request.get({
        uri: 'http://123.56.89.14/deploy/version.json',
        headers: {
            host: 'frontend.com',
        }
    }, function(err, httpResponse, body) {
        if (err) {
            bone.log.error('fetch version.json failed:', err);
        }

        try {
            var remoteVersion = JSON.parse(body);
        } catch(e) {
            var remoteVersion = {};
        }
        var uploadVersion = {};

        zip.add('version.json', version);
        // 和本地版本号对比，仅上传版本号不同的文件
        version = JSON.parse(version);
        bone.utils.each(version, function(hash, path) {
            if(path in remoteVersion) {
                if(remoteVersion[path] == hash) {
                    return;
                }
            }
            uploadVersion[path] = hash;
        });
        if(!bone.utils.size(uploadVersion)) {
            bone.log.info('文件无改变，终止部署！');
            return;
        }
        var zipSize = 0;
        var zipOverflow = false;
        // 添加到zip压缩包内
        bone.utils.each(uploadVersion, function(hash, path) {
            var buffer = fs.readFileSync(zipPathRoot+path);
            zipSize += buffer.length;
            // php 上传文件限制在8M以内，8M之后的文件不添加
            if(zipSize < 8 * 1024 * 1024) {
                zip.add(path, buffer);
            } else {
                zipOverflow = true;
            }
        });
        // 远端路径，参数传递用来校验
        var remotePath = '/a/domains/kezhanwang.cn/static';
        request.post({
            uri: 'http://123.56.89.14/deploy/deal.php',
            headers: {
                host: 'frontend.com',
            },
            formData: {
                zip: {
                    value: zip.toBuffer(),
                    options: {
                        filename: 'dist.zip',
                        contentType: 'application/zip'
                    }
                },
                path: 'web'
            }
        }, function(err, httpResponse, body) {
            if (err) {
                bone.log.error('upload failed:', err);
            }
            try {
                var info = JSON.parse(body);
            } catch(e) {
                console.log('statusCode:'+httpResponse.statusCode+' headers:'+JSON.stringify(httpResponse.headers));
                console.log(body);
                bone.log.error('部署失败，请重试！');
            }
            if(info.code != 0) {
                bone.log.error('remote server return info: '+body);
            }

            var detail = {
                newFile: [],
                existsFile: [],
                illegalFile: []
            };

            bone.utils.each(info.data, function(item, path) {
                if(!item.legal) {
                    if(item.zip_file_not_exitst) return;
                    detail.illegalFile.push({
                        path: path,
                        info: item
                    });
                } else if(item.isExists) {
                    detail.existsFile.push(path);
                } else {
                    detail.newFile.push(item.destination);
                }
            });

            if(detail.newFile.length) {
                bone.log.info('新增以下文件:');
                bone.utils.each(detail.newFile, function(path) {
                    var p = path.replace(remotePath, '');
                    bone.log.info(p + '  ==> ' + 'http://res.kezhanwang.cn/static'+p);
                });
            }
            if(detail.existsFile.length) {
                bone.log.warn('服务器上已存在文件:');
                bone.utils.each(detail.existsFile, function(path) {
                    bone.log.info(path.replace(remotePath, ''));
                });
            }
            if(detail.illegalFile.length) {
                bone.log.warn('服务器校验以下文件非法:');
                bone.utils.each(detail.illegalFile, function(item) {
                    var p = item.path.replace(remotePath, '');

                    if(item.extension_not_avalid) {
                        bone.log.warn(p + ' [非法文件类型，仅限js|css|png|jpg|jpeg]');
                    } else {
                        bone.log.warn(p + ' [hash不一致] 服务器计算值:' + item.info.md5 + ' => ' + item.info.shortMd5 + ' 请求hash值: ' + item.info.rawHash + '.');
                        bone.log.warn('请release后再次部署!');
                    }
                });
            }
            if(zipOverflow) {
                bone.log.warn('部署文件太大，分段上传部署，请再次执行deploy任务！');
            }
        });
    });
});

bone.task('webpackdev', {
    exec: 'node node_modules/webpack-dev-server/bin/webpack-dev-server.js --content-base=dist/static/clubadmin --port=8000'
});