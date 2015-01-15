/**
 * Hoodie plugin socialmedia
 * Lightweight and easy socialmedia
 */

/**
 * Dependencies
 */
var OauthIo = require('./lib'),
  OAuth = require('oauthio');


/**
 * OauthIo worker
 */

module.exports = function (hoodie, callback) {
  var oauthIo = new OauthIo(hoodie);
  var oauth_cofig = hoodie.config.get('oauthio_config');

  if (!oauth_cofig) {

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

    OAuth.setOAuthdUrl(oauth_cofig.settings.url, '/');
    OAuth.initialize(oauth_cofig.settings.publicKey, oauth_cofig.settings.secretKey);
  }

  hoodie.task.on('getoauthconfig:add', oauthIo.getOauthConfig);
  hoodie.task.on('signupwith:add', oauthIo.signUpWith);
  hoodie.task.on('updatesignupwith:add', oauthIo.updateSignUpWith);
  hoodie.task.on('lookuphoodieid:add', oauthIo.lookupHoodieId);
  
  callback();
};

