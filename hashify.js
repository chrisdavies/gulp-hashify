var through = require('through2');
var File = require('vinyl');

function hashify (fileName) {
  if (!fileName) {
    throw new PluginError('gulp-hashify', 'Missing file option for gulp-hashify');
  }

  var views = {};
  var hasViews = false;

  function bufferContents(file, enc, cb) {
    // Ignore empty files
    if (file.isNull()) {
      cb();
      return;
    }

    // No support for streams, unfortunately
    if (file.isStream()) {
      this.emit('error', new PluginError('gulp-hashify',  'Streaming not supported'));
      cb();
      return;
    }

    // Add the current file to our hash of views
    var viewName = file.relative.slice(0, file.relative.lastIndexOf('.'));
    views[viewName] = file.contents.toString('utf8', 0, file.contents.length);

    hasViews = true;

    cb();
  }

  function endStream(cb) {
    // If we don't have any views, get out of here!
    if (!hasViews) {
      cb();
      return;
    }

    // Generate the views js file contents
    var jsScript = 'var views = ' +
      JSON.stringify(views) +
      ';\nif (typeof module !== "undefined" && module.exports) { module.exports = views; }';

    // Push the views js file into the stream
    this.push(new File({
      path: fileName,
      contents: new Buffer(jsScript)
    }));

    cb();
  }

  return through.obj(bufferContents, endStream);
};

module.exports = hashify;