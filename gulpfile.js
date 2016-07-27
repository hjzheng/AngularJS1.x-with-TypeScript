var gulp = require('gulp');
var useref = require('gulp-useref');
var replace = require('gulp-replace');
var watch = require('gulp-watch');
var order = require('gulp-order');
var concat = require('gulp-concat');
var templateCache = require('gulp-angular-templatecache');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var tsify = require('tsify');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var browserSync = require('browser-sync');
var proxyMiddleware = require('http-proxy-middleware');
var config = {
    pages: ['src/app/*.html'],
    css: ['src/app/**/*.css'],
    cssOrder: [
        '**/main.css',
        '**/*.css'
	],
    template: 'src/app/**/*.html'
};

gulp.task('copyHtml', function() {
    return gulp.src(config.pages)
        .pipe(useref())
        .pipe(replace('<!--templates.js-->', '<script src="templates.js"></script>'))
        .pipe(gulp.dest('dist'));
});

gulp.task('buildCSS', ['copyHtml'], function() {
    return gulp.src(config.css)
        .pipe(order(config.cssOrder))
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({stream: true}));
})

gulp.task('buildJS', ['copyHtml'], function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/app/main.ts'],
        cache: {},
        packageCache: {}
    })
    .plugin(tsify)
    .transform("babelify")
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.reload({stream: true}));
});


gulp.task('watch', function() {
	watch('src/**/*.ts', function() {
		gulp.run('buildJS');
	});
    watch('src/**/*.css', function() {
		gulp.run('buildCSS');
	});
    watch('src/**/*.html', function() {
		gulp.run('copyHtml');
	});
});

gulp.task('template', function() {
	return gulp.src(config.template)
		.pipe(templateCache('templates.js', {'root': './src/app', 'module': 'app'}))
		.pipe(gulp.dest('dist'));
});

gulp.task('browserSync', function() {
	// add proxy for gui
	var middleware = proxyMiddleware(['/users'], {target: 'http://localhost:9001', changeOrigin: true});
	browserSync({
		server: {
			baseDir: 'dist',
			index: 'index.html',
			middleware: middleware
		}
	});
});

gulp.task('dev', ['buildJS', 'buildCSS', 'template', 'watch', 'browserSync']);