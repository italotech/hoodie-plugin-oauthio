var debug = require('debug'),
    log = debug('app:log'),
    error = debug('app:error');

error.log = console.error.bind(console);

module.exports = function (hoodie) {

  handleTask = function(methodname, db, task) {
    return function (err) {
      if (err) {
        error(methodname, err);
        hoodie.task.error(db, task, err);
      } else {
        log(methodname + ' sucess', task);
        hoodie.task.success(db, task);
      }
    }
  };

  generatePassword = function(task, cb) {
    passwd.generatePassword(function (err, pass) {
      if (err) return cb(err);
      task.me.raw.password = pass;
      cb();
    })
  }

  addProvider = function(task, cb) {
    exports.pluginDb.add(task.provider, task.me.raw, function (err, _doc) {
      if (err) return cb(err);
      task.user = task.me.raw;
      task.user._rev = _doc.rev;
      cb();
    });
  };

  queryByEmail = function(task, cb) {
    return exports.pluginDb.query('by_email', {key: task.email}, function (err, rows) {
      if (err || !rows.length) return cb(err || new Error("not_found"));
      task.pluginId = rows[0].id.split('/').pop()
      cb();
    });
  };

  updateProvider = function(task, cb) {
    exports.pluginDb.update(task.provider, task.pluginId, { hoodieId: task.hoodieId }, function (err, _doc) {
      if (err && err.error && err.error !== 'not_found') {
        console.log(' EOOR ', err);
        return cb(err);
      }
      cb();
    });
  };

  return {
    getOauthConfig: function(db, task) {
      log('getoauthconfig', task);

      try {
        oauth_cofig = hoodie.config.get('oauthio_config');
        task.oAuthConfig = {
          appKey: oauth_cofig.settings.publicKey,
          oAuthdURL: oauth_cofig.settings.url
        };
        log('getoauthconfig sucess',task);
        hoodie.task.success(db, task);
      } catch (err) {
        error('getoauthconfig', err);
        hoodie.task.error(db, task, err);
      }

    },
    verifyUser: function(db, task) {

      log('verifyuser', task);
      var doc = task.me.raw;
      exports.pluginDb.find(task.provider, doc.id, function (err, _doc) {
        if (err && err.error && err.error !== 'not_found') {
          error('verifyuser', err);
          hoodie.task.error(db, task, err);
        }
        task.user = _doc;
        log('verifyuser sucess',task);
        hoodie.task.success(db, task);
      });

    },
    signUpWith: function(db, task) {

      log('signupwith', task);

      async.series([
        async.apply(generatePassword, task),
        async.apply(addProvider, task),
      ], handleTask('signupwith', db, task) );

    },
    updateSignUpWith: function(db, task) {

      log('updatesignupwith', task);
      async.series([
        async.apply(queryByEmail, task),
        async.apply(updateProvider, task)
      ], handleTask('updatesignupwith', db, task) );
    }

  };

};
