'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cleanCSS = require('gulp-clean-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
    spritesmith = require('gulp.spritesmith'),
    notify = require("gulp-notify"),
    merge = require('merge-stream'),
    changed = require('gulp-changed'),
    buffer = require('vinyl-buffer'),
    fileinclude = require('gulp-file-include');

var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: {
        html: 'src/*.html',
        js: 'src/js/global.js',
        style: 'src/style/*.scss',
        img: ['src/img/**/*.*', '!src/img/icons/*.*'],
        sprite: 'src/img/icons/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: ['src/img/**/*.*', '!src/img/icons/*.*'],
        fonts: 'src/fonts/**/*.*',
        sprite: 'src/img/icons/**/*.*'
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: false,
    host: 'localhost',
    port: 9000,
    logPrefix: "project"
};

gulp.task('html:build', function () {
    gulp.src(path.src.html)
        // .pipe(rigger())
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}))
        .pipe(notify("html"));
});

gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(changed(path.build.js))
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}))
        .pipe(notify("js"));
});

gulp.task('style:build', function () {
    gulp.src(path.src.style)
        .pipe(changed(path.build.css,{ extension: '.css' }))
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(prefixer())
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(browserSync.reload({stream:true}))
        .pipe(notify("style"));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(changed(path.build.img))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
    })) // TODO: Расскоментировать на продакшене
    .pipe(gulp.dest(path.build.img))
    .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(changed(path.build.fonts))
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('sprite:build', function() {
    var spriteData =
        gulp.src(path.src.sprite) // путь, откуда берем картинки для спрайта
            .pipe(spritesmith({
                imgName: 'sprite.png',
                cssName: '_sprite.scss',
                algorithm: 'binary-tree',
                imgPath : '../img/sprite.png',
                padding: 5,
            }));

    var imgStream = spriteData.img
        .pipe(buffer())
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest('src/img/')); // путь, куда сохраняем картинку
    var cssStream = spriteData.css.pipe(gulp.dest('src/style/partials/')); // путь, куда сохраняем стили

    return merge(imgStream, cssStream).pipe(notify("Sprite Done!"));
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('build', [
    'sprite:build',
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
]);

gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch(path.watch.img, function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
    watch([path.watch.sprite], function(event, cb) {
        gulp.start('sprite:build');
    });
});

gulp.task('default', ['build', 'webserver', 'watch']);
gulp.task('test', ['webserver', 'watch']);