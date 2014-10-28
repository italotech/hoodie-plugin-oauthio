/**
 * Hoodie plugin template
 * An example plugin worker, this is where you put your backend code (if any)
 */
var OAuth = require('oauthio'),
    session = require('express-session'),
    async = require('async'),
    passwd = require('hoodie-plugin-users/lib/password_reset'),
    _ = require('lodash');

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

  hoodie.task.on('getoauthconfig:add', function (db, task) {
    // console.log('getoauthconfig', task);

    try {
      oauth_cofig = hoodie.config.get('oauthio_config');
      task.oAuthConfig = {
        appKey: oauth_cofig.settings.publicKey,
        oAuthdURL: oauth_cofig.settings.url
      };
      // console.log(task);
      hoodie.task.success(db, task);
    } catch (err) {
      // console.log('auth try error', err);
      hoodie.task.error(db, task, err);
    }

  });

  hoodie.task.on('verifyuser:add', function (db, task) {

    // console.log('verifyuser', task);
    var doc = task.me.raw;
    try {
      exports.pluginDb.find(task.provider, doc.id, function (err, _doc) {
        task.user = _doc;
        if (err && err.error && err.error !== 'not_found') {
          //console.login('err',arguments);
          hoodie.task.error(db, task, err);
        } else {
//          console.log('verifyuser sucess',task);
          hoodie.task.success(db, task);
        }
      });
    } catch (err) {
      // console.log('auth try error', err);
      hoodie.task.error(db, task, err);
    }
  });

  hoodie.task.on('signupwith:add', function (db, task) {

    // console.log('signupwith', task);
    var doc = task.me.raw;
    try {
      passwd.generatePassword(function (err, pass) {
        if (err) {
          hoodie.task.error(db, task, err);
        }
        doc.password = pass;
        exports.pluginDb.add(task.provider, doc, function (err, _doc) {
          task.user = doc;
          task.user._rev = _doc.rev;
          if (err && err.error && err.error !== 'not_found') {
          //console.login('err',arguments);
            hoodie.task.error(db, task, err);
          } else {
//            console.log('signupwith sucess', task);
            hoodie.task.success(db, task);
          }
        });
      });
    } catch (err) {
      // console.log('auth try error', err);
      hoodie.task.error(db, task, err);
    }
  });

  hoodie.task.on('updatesignupwith:add', function (db, task) {

    // console.log('signupwith', task);
    try {
      exports.pluginDb.query('by_email', {key: task.email}, function (err, rows) {
        if (err || !rows.length) hoodie.task.error(db, task, err);
        exports.pluginDb.update(task.provider, rows[0].id.match(/([0-9]+)/)[1], { hoodieId: task.hoodieId }, function (err, _doc) {
          if (err) {
          //console.login('err',arguments);
            hoodie.task.error(db, task, err);
          } else {
//            console.log('signupwith sucess', task);
            hoodie.task.success(db, task);
          }
        });

      });

    } catch (err) {
      // console.log('auth try error', err);
      hoodie.task.error(db, task, err);
    }
  });

  // initialize the plugin
  async.series([
    async.apply(extendDb, hoodie),
    async.apply(exports.dbAdd, hoodie),
    async.apply(exports.dbIndex, hoodie),

    // async.apply(hoodie.database(exports.dbname).addPermission,
    //   'oauthio-user-writes',
    //   exports.validate_doc_update
    // ),
    // async.apply(exports.ensureCreatorFilter, exports.dbname, hoodie),
    // async.apply(hoodie.database(exports.dbname).grantPublicWriteAccess),
    // async.apply(exports.catchUp, exports.dbname, hoodie)
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
