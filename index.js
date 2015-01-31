var s3 = require('metalsmith-s3');
var metadata = require('metalsmith-metadata');
var date = require('metalsmith-build-date');
var assets = require('metalsmith-assets');
var sass = require('metalsmith-sass');
var ignore = require('metalsmith-ignore');
var markdown = require('metalsmith-markdown');
var mmd = require('metalsmith-multimarkdown');
var permalinks = require('metalsmith-permalinks');
var redirect = require('metalsmith-redirect');
var collections = require('metalsmith-collections');
var feed = require('metalsmith-feed');
var snippet = require('metalsmith-snippet');
var excerpts = require('metalsmith-excerpts');
var templates = require('metalsmith-templates');
var Metalsmith = require('metalsmith');
var util = require('util');

/**
 * Build.
 */


exports.Builder = function(event, context) {
	console.log("starting nonlinear.zone build...");
	var files = [];
	var metalsmith = Metalsmith(__dirname)
		.use(s3({
			action: 'copy',
			bucket: 'nonlinear.zone.draft',
			from: 'nonlinear.zone.src',
			prefix: ['assets', 'images', 'js']
		}))
		.use(s3({
			action: 'read',
			bucket: 'nonlinear.zone.src',
			ignore: ['images/', 'assets/', 'js/']
		}))
		.use(metadata({
			site: '_config.yaml'
		}))
		.use(date())
		.use(sass({
			outputStyle: "expanded",
			outputDir: "css/",
			includePaths: ["src/_sass/"]
		}))
		.use(ignore([
			'_includes/*',
			'_layouts/*'
		]))
		.use(markdown())
		.use(permalinks({
			pattern: ':date/:title',
			date: 'YYYY/MM/DD',
			relative: false
		}))
		.use(collections({
			all: {},
			posts: {
				sortBy: 'date',
				reverse: true
			},
			menu: {
				sortBy: 'order'
			}
		}))
		.use(redirect({
			'/2014/12/18/nonlinear-beginnings.html': '/2014/12/18/nonlinear-beginnings',
			'/2015/01/06/2015-a-new-year.html': '/2015/01/06/2015-a-new-year',
			'/2015/01/06/why-i-want-to-write.html': '/2015/01/06/why-i-want-to-write',
			'/2015/01/07/writing-environment.html': '/2015/01/07/writing-environment',
			'/2015/01/09/writing-patterns-and-behavior.html': '/2015/01/09/writing-patterns-and-behavior',
			'/2015/01/10/updated-about.html': '/2015/01/10/updated-about',
			'/2015/01/11/s3-analytics-s3stat-com.html': '/2015/01/11/s3-analytics-s3stat-com',
			'/2015/01/12/goals-for-blogging-in-2015.html': '/2015/01/12/goals-for-blogging-in-2015',
			'/2015/01/13/just-write.html': '/2015/01/13/just-write',
			'/2015/01/14/reflections-on-the-10-day-blogging-workshop.html': '/2015/01/14/reflections-on-the-10-day-blogging-workshop',
			'/2015/01/18/reforming-packrat.html': '/2015/01/18/reforming-packrat',
			'/about.html': '/about',
			'/colophon.html': '/colophon'
		}))
		.use(feed({
			collection: 'posts',
			destination: 'feed.xml'
		}))
		.use(excerpts())
		.use(snippet({
			maxLength: 160,
			suffix: '...'
		}))
		.use(templates({
			engine: 'swig',
			directory: 'src/_layouts',
		}))
		.use(s3({
			action: 'write',
			bucket: 'nonlinear.zone.draft'
		}))
		.run(files, function(err, files) {
			if (err) throw err;
			context.done(null, "nonlinear.zone build done!");
		});
};
