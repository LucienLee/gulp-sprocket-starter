var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    livereload = require('gulp-livereload'),
    sprocket = require('sprocket'),
    compass = require('gulp-compass'),
    jade = require('gulp-jade'),
    notify = require('gulp-notify'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    gulpifelse = require('gulp-if-else'),
    clean = require('gulp-rimraf');

var config = require('./config.json');
var environment = new sprocket.Environment();

var PUBLIC_PATH = config.paths.dist,
    SOURCE_PATH = config.paths.src,
    COMPASS_TMP_PATH = '/compass-complied/';
if (!environment.isProduction) {
    PUBLIC_PATH = config.paths.app;
}



//stylesheets
gulp.task('compass', function() {
    return gulp.src([
            SOURCE_PATH.sass + '/**.scss',
            SOURCE_PATH.sass + '/**.sass'
        ])
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(compass({
            css: PUBLIC_PATH.css,
            sass: SOURCE_PATH.sass,
            image: PUBLIC_PATH.image,
            font: PUBLIC_PATH.font
        }))
        .pipe(notify())
        .pipe(gulp.dest(SOURCE_PATH.css + COMPASS_TMP_PATH));
});

gulp.task('styles', ['compass'], function() {
    return gulp.src([
            SOURCE_PATH.lib + '/**/*.css', //third-party lib without bower
            SOURCE_PATH.css + COMPASS_TMP_PATH + '/*'
        ])
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(environment.createStylesheetsStream())
        .pipe(notify())
        .pipe(gulp.dest(PUBLIC_PATH.css));
});

gulp.task('styles:clean', function(){
    return gulp.src([
            PUBLIC_PATH.css + '/**/*',
            SOURCE_PATH.css + COMPASS_TMP_PATH
        ], { read: false })
        .pipe(clean())
        .pipe(notify({
            message: "<%= file.relative %> clean!"
        }));
});


//script
gulp.task('scripts', function() {
    return gulp.src([
            SOURCE_PATH.lib + '/**/*.js', //third-party lib without bower
            SOURCE_PATH.js + '/**/*.*'
        ])
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(environment.createJavascriptsStream())
        .pipe(notify())
        .pipe(gulp.dest(PUBLIC_PATH.js));
});

gulp.task('scripts:clean', function(){
    return gulp.src([ PUBLIC_PATH.js + '/**/*' ], { read: false })
        .pipe(clean())
        .pipe(notify({
            message: "<%= file.relative %> claen!"
        }));
});

//images
gulp.task('images:clean', function() {
    return gulp.src(PUBLIC_PATH.image + '/**/*', { read: false })
        .pipe(clean())
        .pipe(notify({
            message: "<%= file.relative %> clean!"
        }));
});

gulp.task('images', function() {
    return gulp.src(SOURCE_PATH.image + '/**/*')
        .pipe(gulpifelse(config.imgCache,
            function() { //if cache
                return cache(imagemin(config.imagemin))
            },
            function() { //else not cache
                return imagemin(config.imagemin)
            }))
        .pipe(gulp.dest(PUBLIC_PATH.image))
        .pipe(notify({
            message: "<%= file.relative %> complete"
        }));
});

//fonts
gulp.task('fonts:clean', function() {
    return gulp.src(PUBLIC_PATH.font + '/**/*', { read: false })
        .pipe(clean())
        .pipe(notify({
            message: "<%= file.relative %> clean!"
        }));
});

gulp.task('fonts', function() {
    return gulp.src(SOURCE_PATH.font + '/**/*')
        .pipe(gulp.dest( PUBLIC_PATH.font + '/'))
        .pipe(notify());
});


//template
gulp.task('html', ['styles', 'scripts'], function() {
    return gulp.src(SOURCE_PATH.view + '/**/*.*')
        .pipe(environment.createHtmlsStream())
        .pipe(gulp.dest(PUBLIC_PATH.root))
        .pipe(notify("static web conpile done"));
});

gulp.task('html:clean', function(){
    return gulp.src(PUBLIC_PATH.root + '/*.html', { read: false })
        .pipe(clean())
        .pipe(notify({
            message: "<%= file.relative %> clean!"
        }));
});

//cache clean
gulp.task('clearCache', function() {
    cache.clearAll();
});

//claen
gulp.task('clean', ['html:clean', 'styles:clean', 'scripts:clean', 'fonts:clean', 'images:clean', 'clearCache']);


gulp.task('watch', function() {
    gulp.watch([
        SOURCE_PATH.view + '/**/*',
        SOURCE_PATH.js + '/**/*',
        SOURCE_PATH.sass + '/**/*',
        SOURCE_PATH.lib + '/**/*',
        '!'+ SOURCE_PATH.css + COMPASS_TMP_PATH +'/**/*' //prevent infinite loop reload
    ], ['html']);
    gulp.watch([SOURCE_PATH.image],['images']);
    gulp.watch([SOURCE_PATH.font],['fonts']);

    //livereload
    if (!environment.isProduction) {
        livereload.listen();
        gulp.watch([PUBLIC_PATH.root + '/**/*']).on('change', livereload.changed);
    }
});

//Run server and watch
gulp.task('server', ['images', 'fonts', 'html', 'watch'], function() {
    require('./server');
});


gulp.task('build', ['clean', 'images', 'fonts', 'html']);