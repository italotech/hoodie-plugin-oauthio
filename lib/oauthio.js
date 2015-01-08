var async = require('async'),
    passwd = require('hoodie-plugin-users/lib/password_reset'),
    debug = require('debug'),
    log = debug('app:log'),    
    log2 = debug('app:log2'),
    error = debug('app:error'),
    util = require('util'),
    moment = require('moment');

error.log = console.error.bind(console);

module.exports = function (hoodie, pluginDb) {

  //var pluginDb = hoodie.database(dbname);

  var handleTask = function (methodname, db, task) {
    return function (err) {
      if (err) {
        //err = util.inspect(err, {showHidden: true, depth: null});
        error(methodname, err);
        hoodie.task.error(db, task, err.error || { err: err });
      } else {
        log(methodname + ' sucess', task);
        hoodie.task.success(db, task);
      }
    };
  };

  var generatePassword = function (task, cb) {
    passwd.generatePassword(function (err, pass) {
      if (err) return cb(err);
      task.me.raw.password = pass;
      cb();
    });
  };

  var addProvider = function (task, cb) {
    pluginDb.add(task.provider, task.me.raw, function (err, _doc) {
      if (err) return cb(err);
      task.user = task.me.raw;
      task.user._rev = _doc.rev;
      cb();
    });
  };

  var queryByEmail = function (task, cb) {
    log2('updatesignupwith->queryByEmail', task);
    pluginDb.query('by_email', {key: task.email, include_docs:true}, function (err, rows) {
      if (err || !rows.length) return cb(err || new Error('not_found'));
      task.queryByEmail = {
        id: rows[0].doc._id.split('/').pop(),
        rev: rows[0].doc._rev
      };
      cb();
    });
  };

  var updateProvider = function (task, cb) {
    log2('updatesignupwith->updateProvider', task);    
    pluginDb.update(task.provider, task.queryByEmail.id, { rev: task.queryByEmail.rev, hoodieId: task.hoodieId }, function (err) {
      if (err && err.error && err.error !== 'not_found') {
        return cb(err);
      }
      task.queryByEmail = undefined;
      cb();
    });
  };

  return {
    getOauthConfig: function (db, task) {
      log('getoauthconfig', task);
      try {
        var oauth_cofig = hoodie.config.get('oauthio_config');
        task.oAuthConfig = {
          appKey: oauth_cofig.settings.publicKey,
          oAuthdURL: oauth_cofig.settings.url
        };
        log('getoauthconfig sucess', task);
        hoodie.task.success(db, task);
      } catch (err) {
        error('getoauthconfig', err);
        hoodie.task.error(db, task, err);
      }

    },
    verifyUser: function (db, task) {

      log('verifyuser', task);
      var doc = task.me.raw;
      pluginDb.find(task.provider, doc.id, function (err, _doc) {
        if (err && err.error && err.error !== 'not_found') {
          error('verifyuser', err);
          hoodie.task.error(db, task, err);
        }
        task.user = _doc;
        log('verifyuser sucess', task);
        hoodie.task.success(db, task);
      });

    },
    signUpWith: function (db, task) {

      log('signupwith', task);

      async.series([
        async.apply(generatePassword, task),
        async.apply(addProvider, task),
      ], handleTask('signupwith', db, task));

    },
    updateSignUpWith: function (db, task) {
      //https://github.com/hoodiehq/hoodie-plugins-api/issues/28
      log2('updatesignupwith', task);
      
      async.series([
        async.apply(queryByEmail, task),
        async.apply(updateProvider, task)
      ], handleTask('updatesignupwith', db, task));

    }

  };

};
