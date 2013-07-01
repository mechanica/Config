'use strict';
/*jshint node: true, laxcomma: true*/

var _ = require('lodash')
  , fs = require('fs')
  , os = require('os')
  , yaml = require('js-yaml');

var configOrder = [
  'default',
  process.env.HOST || process.env.HOSTNAME || os.hostname(),
  process.env.NODE_ENV
];

var watch = process.env.MECH_WATCH;

function mergeConfigs(dst, src) {
  _.each(src || {}, function (value, key) {

    // if destination exists & already has `~override` flag, keep it intact
    if (_.isObject(dst[key]) && dst[key]['~override']) {
      return;
    }
    
    // if source has `~override` flag - override whole value in destination
    if (value && value['~override']) {
      dst[key] = value;
      return;
    }

    // if both nodes are objects - merge recursively
    if (_.isObject(value) && _.isObject(dst[key])) {
      mergeConfigs(dst[key], value);
      return;
    }

    // destination node does not exist - create
    // or both nodes are of different types - override.
    dst[key] = value;
    return;
  });

  return dst;
}

function Config () {
  var config = {}
    , that = this;
  
  (function parse () {
    var oldConfig = config;
    
    config = {};
    
    _.each(_.map(configOrder, function (file) {
      return './config/' + file + '.yml';
    }), function (file) {
      if (fs.existsSync(file)) {
        var contents = fs.readFileSync(file, 'utf8');
        var current = yaml.safeLoad(contents, { filename: file });
        mergeConfigs(config, current);
        if (watch) {
          fs.unwatchFile(file);
          fs.watchFile(file, { persistent: false, interval: 1000 }, function () {
            parse();
          });
        }
      }
    });
    
    _.each(_.difference(_.keys(oldConfig), _.keys(config)), function (key) {
      delete that[key];
    });
    
    _.each(config, _.bind(function (value, key) {
      that.__defineGetter__(key, function () {
        return value;
      });
    }, that));
  }());
  
}

global.NODE_CONFIG = global.NODE_CONFIG || new Config();

module.exports = global.NODE_CONFIG;