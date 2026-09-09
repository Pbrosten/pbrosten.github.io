'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var fs = require('fs');

var GALLERY_DIR = './img/gallery';
var GALLERY_START = '<!-- gallery:start -->';
var GALLERY_END = '<!-- gallery:end -->';
var IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;
var INDENT = '                ';

// compile scss to css
gulp.task('sass', function () {
    return gulp.src('./sass/styles.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(rename({basename: 'styles.min'}))
        .pipe(gulp.dest('./css'));
});

// watch changes in scss files and run sass task
gulp.task('sass:watch', function () {
    gulp.watch('./sass/**/*.scss', ['sass']);
});

// minify js
gulp.task('minify-js', function () {
    return gulp.src('./js/scripts.js')
        .pipe(uglify())
        .pipe(rename({basename: 'scripts.min'}))
        .pipe(gulp.dest('./js'));
});

// Both language pages carry the same photo list; cat/ needs a ../ on every src.
var GALLERY_PAGES = [
    {file: './index.html', prefix: 'img/gallery/'},
    {file: './cat/index.html', prefix: '../img/gallery/'}
];

// Rebuild the gallery <img> list in both index.html files from whatever is in img/gallery/.
// A static site cannot list a directory at runtime, so the filenames have to be baked into
// the HTML. Run this after adding or removing photos; it rewrites everything between the
// gallery:start / gallery:end markers, so don't hand-edit inside them.
gulp.task('gallery', function (done) {
    var files;
    try {
        files = fs.readdirSync(GALLERY_DIR);
    } catch (e) {
        done(new Error('cannot read ' + GALLERY_DIR + ': ' + e.message));
        return;
    }
    files = files.filter(function (f) {
        return IMAGE_EXT.test(f);
    }).sort(function (a, b) {
        // numeric:true so viena-10 sorts after viena-9, not after viena-1
        return a.localeCompare(b, 'en', {numeric: true});
    });

    for (var i = 0; i < GALLERY_PAGES.length; i++) {
        var page = GALLERY_PAGES[i];
        var html = fs.readFileSync(page.file, 'utf8');
        var start = html.indexOf(GALLERY_START);
        var end = html.indexOf(GALLERY_END);
        if (start < 0 || end < 0 || end < start) {
            done(new Error('gallery markers missing or out of order in ' + page.file));
            return;
        }

        var tags = files.map(function (f) {
            // Alt text from the filename: "costa-brava-1.jpg" -> "Costa brava 1". Better than
            // twenty identical alts, and it costs nothing to keep accurate.
            var alt = f.replace(IMAGE_EXT, '').replace(/[-_]+/g, ' ');
            alt = alt.charAt(0).toUpperCase() + alt.slice(1);
            return INDENT + '<img src="' + page.prefix + f + '" alt="' + alt + '" loading="lazy">';
        }).join('\n');

        fs.writeFileSync(page.file,
            html.slice(0, start + GALLERY_START.length) + '\n' +
            (tags ? tags + '\n' : '') + INDENT +
            html.slice(end));
    }

    console.log('gallery: ' + files.length + ' photo(s) from ' + GALLERY_DIR +
        ' into ' + GALLERY_PAGES.length + ' page(s)');
    done();
});

// default task
gulp.task('default', gulp.series('sass', 'minify-js', 'gallery'));