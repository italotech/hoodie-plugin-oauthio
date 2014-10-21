/**
 * Hoodie plugin template
 * An example plugin worker, this is where you put your backend code (if any)
 */
var OAuth = require('oauthio'),
    session = require('express-session'),
    async = require('async'),
    passwd = require('hoodie-plugin-users/lib/password_reset');

module.exports = function (hoodie, callback) {
  var oauth_cofig = hoodie.config.get('oauthio_config');
  var pluginDb = hoodie.database(exports.dbname);

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
      pluginDb.find(task.provider, doc.id, function (err, _doc) {
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
        pluginDb.add(task.provider, doc, function (err, _doc) {
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

  // initialize the plugin
  async.series([
    async.apply(exports.dbAdd, hoodie),
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


