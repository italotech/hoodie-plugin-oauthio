var async = require('async'),
    passwd = require('hoodie-plugin-users/lib/password_reset'),
    utils = require('hoodie-utils-plugins')('oauthio:oauthio'),
    log = utils.debug();


module.exports = function (hoodie, pluginDb) {

  var _setAttrs = function (task, attr, cb) {
    if (!attr || !task[attr]) {
      return cb('Pls, fill the param: ' + attr);
    }
    cb();
  };

  var generatePassword = function (task, cb) {
    log('generatePassword', task);
    passwd.generatePassword(function (err, pass) {
      if (err) return cb(err);
      if (!task.me.password)
        task.me.password = pass;
      cb();
    });
  };

  var addProvider = function (task, cb) {
    log('addProvider', task);
    pluginDb.add(task.provider, task.me, function (err, _doc) {
      if (err) return cb(err);
      task.user = task.me;
      task.user._rev = _doc.rev;
      cb();
    });
  };

  var queryByUsername = function (task, cb) {
    log('queryByUsername', task);
    pluginDb.query('by_username', { key: task.username, include_docs: true }, function (err, rows) {
      if (err || !rows.length) return cb(err || new Error('not_found'));
      task.queryByUsername = {
        id: rows[0].doc._id.split('/').pop(),
        rev: rows[0].doc._rev
      };
      cb();
    });
  };

  var updateProvider = function (task, cb) {
    log('updateProvider', task);
    pluginDb.update(task.provider, task.queryByUsername.id, { rev: task.queryByUsername.rev, hoodieId: task.hoodieId }, function (err) {
      if (err && err.error && err.error !== 'not_found') {
        return cb(err);
      }
      cb();
    });
  };

  var _getOauthConfig = function (task, cb) {
    log('_getOauthConfig', task);
    try {
      var oauth_cofig = hoodie.config.get('oauthio_config');
      task.oAuthConfig = {
        appKey: oauth_cofig.settings.publicKey,
        oAuthdURL: oauth_cofig.settings.url
      };
      cb();
    } catch (err) {
      cb(err);
    }
  };

  var _findById = function (task, cb) {
    log('_findById', task);
    pluginDb.find(task.find.provider, task.find.id, function (err, _doc) {
      if (err && err.error && err.error !== 'not_found') {
        return cb(err);
      }
      task.user = _doc;
      cb();
    });
  };

  return {
    getOauthConfig: function (db, task) {
      log('getoauthconfig', task);

      async.series([
        async.apply(_getOauthConfig, task),
      ], utils.handleTask(hoodie, 'getOauthConfig', db, task));

    },
    signUpWith: function (db, task) {

      log('signupwith', task);

      async.series([
        async.apply(_setAttrs, task, 'me'),
        async.apply(generatePassword, task),
        async.apply(addProvider, task),
      ], utils.handleTask(hoodie, 'signupwith', db, task));

    },
    updateSignUpWith: function (db, task) {
      //https://github.com/hoodiehq/hoodie-plugins-api/issues/28
      log('updatesignupwith', task);
      
      async.series([
        async.apply(_setAttrs, task, 'hoodieId'),
        async.apply(queryByUsername, task),
        async.apply(updateProvider, task)
      ], utils.handleTask(hoodie, 'updatesignupwith', db, task));

    },
    lookupHoodieId: function (db, task) {
      //https://github.com/hoodiehq/hoodie-plugins-api/issues/28
      log('lookuphoodieid', task);
      
      async.series([
        async.apply(_setAttrs, task, 'find'),
        async.apply(_findById, task)
      ], utils.handleTask(hoodie, 'lookuphoodieid', db, task));

    },

  };

};
