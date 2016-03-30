module.exports = function(grunt) {
    var fs = require('fs');
    var path = require('path');
    var md5 = require('MD5');

    grunt.initConfig({
        clean: {
            dist: ['dist/static_min']
        },
        copy: {
            dist: {
                expand: true,
                cwd: 'dist/static',
                src: '**',
                dest: 'dist/static_min/'
            }
        },
        strip: {
            dist: {
                src: 'dist/static_min/**/*.js',
                options: {
                    inline: true
                }
            }
        },
        cssUrlRewrite: {
            dist: {
                expand: true,
                cwd: "dist/static_min",
                src: "**/*.css",
                dest: "dist/static_min/",
                options: {
                    skipExternal: true,
                    rewriteUrl: function(url, options, dataURI) {
                        if(url.indexOf('data:') == 0) { //base64不处理
                            return url;
                        } else {
                            var p = url.replace('dist/static_min/', '../');
                            var absPath = path.resolve(url);
                            var buf = fs.readFileSync(absPath);
                            var hash = md5(buf);
                            var info = path.parse(p);
                            return info.dir + '/' + info.name + '_' + hash.substr(-6) + info.ext;
                        }
                    }
                }
            }
        },
        uglify: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'dist/static_min/club/js',
                    src: '**/*.js',
                    dest: 'dist/static_min/club/js'
                }]
            }
        },
        cssmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'dist/static_min/club/css',
                    src: '**/*.css',
                    dest: 'dist/static_min/club/css'
                }]
            }
        },
        sprite:{
            icons: {
                src: 'src/assets/sprite/icons/img/*.png',
                dest: 'src/assets/images/icons.png',
                destCss: 'src/assets/sprite/icons/icons.less',
                cssTemplate: 'src/assets/sprite/icons/less.mustache',
                imgPath: '../images/icons.png',
                padding: 8
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks("grunt-css-url-rewrite");
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-spritesmith');
    grunt.loadNpmTasks('grunt-strip');
    // grunt.loadNpmTasks('css-sprite');
};