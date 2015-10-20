var map = require('map-stream')
  , path = require('path')
  , fs = require('fs')
  , Tag = require('./tag')
  , TagSet = require('../utils/tagSet')
  , config = require('../utils/config')()
  , _ = require('../utils/components');

/**
 * tpl
 * @returns {Stream}
 */
function tpl() {
  return map(function (file, fn) {
    var string = file.contents.toString()
      , name = _.getComName(file.path)
      , childTags = new TagSet()
      , css = []
      , res = [(new Tag(string, file.path, { onexist: function (tag) {
        childTags.add(tag) &&
          css.push(
            _.fix(
              fs.readFileSync(path.join(config.src, _.getDepCSS(tag)), 'utf-8'),
              tag
            ).replace(/\n/g, '\\n')
             .replace(/\r/g, '')
             .replace(/'/g, "\\'")
          );
      } })).tpl];

    res.unshift(
      'define(function () {',
      'var res = '
    );

    css.push(
      _.fix(
        fs.readFileSync(path.join(config.src, _.getDepCSS(name)), 'utf-8'),
        name
      ).replace(/\n/g, '\\n')
       .replace(/\r/g, '')
       .replace(/'/g, "\\'")
    );

    res.push(
      css.length ? "res.css = '" + css.join('\\n') + "';" : undefined,
      'return res;',
      '});'
    );

    file.contents = new Buffer(res.join('\n'));
    fn(null, file);
  });
}

module.exports = tpl;

