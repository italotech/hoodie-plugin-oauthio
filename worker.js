/**
 * Hoodie plugin socialmedia
 * Lightweight and easy socialmedia
 */

/**
 * Dependencies
 */
var OauthIo = require('./lib'),
  OAuth = require('oauthio'),
  session = require('express-session');


/**
 * OauthIo worker
 */

module.exports = function (hoodie, callback) {
  var oauthIo = new OauthIo(hoodie);

  var oauth_cofig = hoodie.config.get('oauthio_config'),
      pluginDb = hoodie.database(exports.dbname),
      oauthio = new OauthIo(hoodie, pluginDb);

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

  hoodie.task.on('getoauthconfig:add', oauthIo.getOauthConfig);
  hoodie.task.on('signupwith:add', oauthIo.signUpWith);
  hoodie.task.on('updatesignupwith:add', oauthIo.updateSignUpWith);
  hoodie.task.on('lookuphoodieid:add', oauthIo.lookupHoodieId);
  callback();
};

