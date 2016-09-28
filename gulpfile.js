var gulp = require('gulp');
var del = require('del');
var plugins = require('gulp-load-plugins')();
var chalk = require('chalk');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var tsify = require('tsify');
var buffer = require('vinyl-buffer');
var browserSync = require('browser-sync');
var proxyMiddleware = require('http-proxy-middleware');
var config = {
    pages: ['src/*.html'],
    css: ['src/app/**/*.css'],
    cssOrder: [
        '**/main.css',
        '**/*.css'
	],
    template: 'src/app/**/*.html'
};

gulp.task('clean', function() {
	return del.sync(['dist']);
});

gulp.task('copyHtml', function() {
    return gulp.src(config.pages)
        .pipe(plugins.useref())
        .pipe(plugins.replace('<!--templates.js-->', '<script src="templates.js"></script>'))
        .pipe(gulp.dest('dist'));
});

gulp.task('buildCSS', ['copyHtml'], function() {
    return gulp.src(config.css)
        .pipe(plugins.order(config.cssOrder))
        .pipe(plugins.concat('bundle.css'))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({stream: true}));
});

function map_error(err) {
    if (err.fileName) {
        // regular error
        plugins.util.log(chalk.red(err.name)
            + ': '
            + chalk.yellow(err.fileName.replace(__dirname + '/src/js/', ''))
            + ': '
            + 'Line '
            + chalk.magenta(err.lineNumber)
            + ' & '
            + 'Column '
            + chalk.magenta(err.columnNumber || err.column)
            + ': '
            + chalk.blue(err.description))
    } else {
        // browserify error..
        plugins.util.log(chalk.red(err.name)
            + ': '
            + chalk.yellow(err.message))
    }

    this.emit('end');
}

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
    .bundle().on("error", map_error)
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(plugins.sourcemaps.init({loadMaps: true}))
    .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.reload({stream: true}));
});


gulp.task('watch', function() {
	plugins.watch('src/**/*.ts', function() {
		gulp.run('buildJS');
	});
    plugins.watch('src/**/*.css', function() {
		gulp.run('buildCSS');
	});
    plugins.watch('src/*.html', function() {
		gulp.run('copyHtml');
	});
	plugins.watch('src/app/*.html', function() {
		gulp.run('template');
	});
});

gulp.task('template', function() {
	return gulp.src(config.template)
		.pipe(plugins.angularTemplatecache('templates.js', {'root': './src/app', 'module': 'app'}))
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

gulp.task('dev', ['clean', 'buildJS', 'buildCSS', 'template', 'watch', 'browserSync']);

gulp.task('build', ['clean', 'buildJS', 'buildCSS', 'template']);
