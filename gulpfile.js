const project_folder = 'dist';
const src_folder = '#src'; 


const path = {
  build: {
    html: project_folder + '/',
    css: project_folder + '/css/',
    js: project_folder + '/js/',
    img: project_folder + '/img/',
    fonts: project_folder + '/fonts/',
  },
  src: {
    html: [src_folder + '/*.html', '!' + src_folder + '/_*.html'],
    css: src_folder + '/scss/style.scss',
    js: src_folder + '/js/script.js',
    img: src_folder + '/img/**/*.{svg, png, jpg, gif, ico, webp}',
    fonts: src_folder + '/fonts/*.{ttf, otf}', //добавить otf
  },
  watch: {
    html: src_folder + '/**/*.html',
    css: src_folder + '/scss/**/*.scss',
    js: src_folder + '/js/**/*.js',
    img: src_folder + '/img/**/*.{jpg, png, svg, gif, ico, webp}',
  },
  clean: './' + project_folder + '/',
};
const { src, dest } = require('gulp');
const gulp = require('gulp');
const browsersync = require('browser-sync').create();
const fileinclude = require('gulp-file-include');
const del = require('del');
const scss = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const group_media = require('gulp-group-css-media-queries');
const clean_css = require('gulp-clean-css');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');



function browserSync() {
  browsersync.init({
    server: {
      baseDir: './' + project_folder + '/',
    },
    port: 3000,
    notify: false,
  });
}
function html() {
  return src( path.src.html )
    .pipe( fileinclude() )
    .pipe( dest(path.build.html) )
    .pipe( browsersync.stream() );
}
function css() {
  return src( path.src.css )
    .pipe(
      scss({
        outputStyle: 'expanded', 
      })
    )
    .pipe( group_media() )
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 5 versions'],
        cascade: true,
      })
    )
    .pipe( dest(path.build.css) )
    .pipe( clean_css() )
    .pipe(
      rename({
        extname: '.min.css',
      })
    )
    .pipe( dest(path.build.css) )
    .pipe( browsersync.stream() );
}
function js() {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(
      rename({
        extname: '.min.js',
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}
function images() {
  return src(path.src.img)
    .pipe( dest(path.build.img) )
    .pipe( src(path.src.img) )
    .pipe(
      imagemin({
        interlaced: true,
        progressive: true,
        optimizationLevel: 3, //0-7
        svgoPlugins: [{ removeViewBox: false }],
      })
    )
    .pipe( dest(path.build.img) )
    .pipe (browsersync.stream() );
}


function fonts() {
    return src(path.src.fonts)
            .pipe( dest(path.build.fonts) )
}


function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
}
function clean() {
  return del(path.clean);
}
const build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts));
const watch = gulp.parallel(build, watchFiles, browserSync);

exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
