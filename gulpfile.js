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
    SOURCE_PATH = config.paths.src;
if (!environment.isProduction) {
    PUBLIC_PATH = config.paths.app;
}




gulp.task('scripts', function() {
    return gulp.src([
        SOURCE_PATH.js + '/**/*.*',
        'bower_components/jquery/dist/jquery.js'
    ])
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(environment.createJavascriptsStream())
        .pipe(notify())
        .pipe(gulp.dest(PUBLIC_PATH.js));
});

//images
gulp.task('images:clean', function() {
    return gulp.src(PUBLIC_PATH.image + '/**/*', {
        read: false
    })
        .pipe(clean())
        .pipe(notify({
            message: "<%= file.relative %> clean!"
        }));
});

gulp.task('images', function() {
    return gulp.src(SOURCE_PATH.image + '/**/*')
        .pipe(gulpifelse(config.imgCache,
            function() { //if cache
                console.log('cache');
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
    return gulp.src(PUBLIC_PATH.font + '/**/*', {
        read: false
    })
        .pipe(clean())
        .pipe(notify());
});

gulp.task('fonts', ['fonts:clean'], function() {
    return gulp.src(SOURCE_PATH.font + '/**/*')
        .pipe(gulp.dest(Config.paths.dist.fonts + '/'))
        .pipe(notify());
});


//
gulp.task('html', ['scripts'], function() {
    var stream = gulp.src(SOURCE_PATH.view + '/**/*.*')
        .pipe(environment.createHtmlsStream())
        .pipe(gulp.dest(PUBLIC_PATH.root));
    if (!environment.isProduction) {
        stream = stream.pipe(livereload());
    }
    return stream;
});



//cache
gulp.task('clearCache', function() {
    cache.clearAll();
});

//Run server and watch
gulp.task('server', ['html'], function() {
    gulp.watch([SOURCE_PATH.root + '/**/*']);
    require('./server');
});