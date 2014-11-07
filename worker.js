/**
 * Hoodie plugin template
 * An example plugin worker, this is where you put your backend code (if any)
 */
var OAuth = require('oauthio'),
    session = require('express-session'),
    async = require('async'),
    passwd = require('hoodie-plugin-users/lib/password_reset'),
    _ = require('lodash'),
    debug = require('debug'),
    log = debug('app:log'),
    error = debug('app:error');
    oauthio = require('./lib/oauthio');

error.log = console.error.bind(console);

module.exports = function (hoodie, callback) {


  var oauth_cofig = hoodie.config.get('oauthio_config');
  exports.pluginDb = hoodie.database(exports.dbname);

  if (!oauth_cofig) {

    var session_object = session({secret: 'keyboard cat'});
    var default_oauthio_config = {
        'enabled': false,
        'settings': {
          'url': 'https://oauth.io',
          'publicKey': '',
          'secretKey': ''
        }
      };

    hoodie.config.set('oauthio_config', default_oauthio_config);
    oauth_cofig = hoodie.config.get('oauthio_config');
    //OAuth.setOAuthdURL(oauth_cofig.settings.url, '/');
    OAuth.setOAuthdUrl(oauth_cofig.settings.url, '/');
    OAuth.initialize(oauth_cofig.settings.publicKey, oauth_cofig.settings.secretKey);
  }

  hoodie.task.on('getoauthconfig:add', oauthio(hoodie).getOauthConfig);
  hoodie.task.on('verifyuser:add', oauthio(hoodie).verifyUser);
  hoodie.task.on('signupwith:add', oauthio(hoodie).signUpWith);
  hoodie.task.on('updatesignupwith:add', oauthio(hoodie).updateSignUpWith);

  // initialize the plugin
  async.series([
    async.apply(extendDb, hoodie),
    async.apply(exports.dbAdd, hoodie),
    async.apply(exports.dbIndex, hoodie),
  ],
  callback);

};

exports.dbname = 'plugins/hoodie-plugin-oauthio';

exports.dbAdd = function (hoodie, callback) {

  hoodie.database.add(exports.dbname, function (err) {

    if (err) {
      return callback(err);
    }

    return callback();

  });

};

exports.dbIndex = function (hoodie, callback) {
  var index = {
        map: function (doc) {
          if(doc.email) {
            emit(doc.email, doc._id);
          }
        }
      };

  exports.pluginDb.addIndex('by_email', index, function (err, data) {
    if (err) {
      return callback(err);
    }

    return callback();
  })
};


function extendDb(hoodie, cb) {
  var db = exports.pluginDb;
/**
   * CouchDB views created using `db.addIndex()` are all stored in the same
   * design document: `_design/views`.
   * See https://github.com/hoodiehq/hoodie.js/issues/70#issuecomment-20506841
   */

  var views_ddoc_id = '_design/views';
  var views_ddoc_url = db._resolve(views_ddoc_id);

  /**
   * Creates new design doc with CouchDB view on db
   */

  db.addIndex = function (name, mapReduce, callback) {
    if (!mapReduce || !_.isFunction(mapReduce.map)) {
      return callback(new Error('db.addIndex() expects mapReduce ' +
        'object to contain a map function.'));
    }

    hoodie.request('GET', views_ddoc_url, {}, function (err, ddoc, res) {
      if (res.statusCode === 404) {
        // not found, so we use new object.
        ddoc = {
          language: 'javascript',
          views: {}
        };
      } else if (err) {
        return callback(err);
      }

      // View functions need to be serialised/stringified.
      var serialised = _.reduce(mapReduce, function (memo, v, k) {
        memo[k] = _.isFunction(v) ? v.toString() : v;
        return memo;
      }, {});

      // If view code has not changed we don't need to do anything else.
      // NOTE: Not sure if this is the best way to deal with this. This
      // saves work and avoids unnecessarily overwriting the
      // `_design/views` document when no actual changes have been made to
      // the view code (map/reduce).
      if (_.isEqual(serialised, ddoc.views[name])) {
        return callback(null, {
          ok: true,
          id: ddoc._id,
          rev: ddoc._rev
        });
      }

      ddoc.views[name] = serialised;
      hoodie.request('PUT', views_ddoc_url, {data: ddoc}, callback);
    });
  };

  /**
   * Removes couchdb view from db
   */

  db.removeIndex = function (name, callback) {
    hoodie.request('GET', views_ddoc_url, {}, function (err, ddoc) {
      if (err) {
        return callback(err);
      }

      if (ddoc.views && ddoc.views[name]) {
        delete ddoc.views[name];
      }

      hoodie.request('PUT', views_ddoc_url, {data: ddoc}, callback);
    });
  };

  /**
   * Query a couchdb view on db
   *
   * Arguments:
   *
   * * `index` is the name of the view we want to query.
   *
   * * `params` is an object with view query parameters to be passed on when
   * sending request to CouchDB. There is a special `params.parse` property
   * that is not passed to CouchDB but used to know whether we should parse
   * the values in the results as proper documents (translating couchdb's
   * `_id` to hoodie's `id` and so on). If your view's map function emits
   * whole documents as values you will probably want to use `params.parse` so
   * that you get a nice array of docs as you would with `db.findAll()`.
   */

  db.query = function (index, params, callback) {
    // `params` is optional, when only two args passed second is callback.
    if (arguments.length === 2) {
      callback = params;
      params = null;
    }

    var view_url = db._resolve('_design/views/_view/' + index);

    // If params have been passed we build the query string.
    if (params) {
      var qs = _.reduce(params, function (memo, v, k) {
        if (k === 'parse') { return memo; }
        if (memo) { memo += '&'; }
        return memo + k + '=' + encodeURIComponent(JSON.stringify(v));
      }, '');
      if (qs) {
        view_url += '?' + qs;
      }
    }

    hoodie.request('GET', view_url, function (err, data) {
      if (err) {
        return callback(err);
      }
      var results = data.rows;
      // If `params.parse` was set we need to parse the value in each row
      // as a proper document.
      if (params && params.parse) {
        results = data.rows.map(function (r) {
          return options.parse(r.value);
        });
      }
      callback(null, results, _.omit(data, [ 'rows' ]));
    });
  };
  return cb();
};

