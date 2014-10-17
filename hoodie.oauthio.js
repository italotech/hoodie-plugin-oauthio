/**
 * Hoodie plugin template
 * An example plugin, this is where you put your frontend code (if any)
 */

/* global Hoodie */


Hoodie.extend(function (hoodie) {
  'use strict';

	hoodie.oauthio = {
		config: function (provider, connected) {
			return hoodie.task.start('oauthioconfig', {
				provider: provider,
				connected: connected
			});
		},
		login: function (user) {
			return hoodie.task.start('oauthiologin', {
				user: user
			});
		},
	};

  hoodie.account.oauthio = {
    me: {},
    provider: 'facebook'
  }

  hoodie.account.getOAuthConfig = function () {
    console.log('getOAuthConfig');
    return hoodie.task.start('getoauthconfig', {});
  }

  hoodie.account.oauth = function (task) {
    console.log('oauth');
    OAuth.initialize(task.oAuthConfig.appKey);
    OAuth.setOAuthdURL(task.oAuthConfig.oAuthdURL);
    return OAuth.popup(hoodie.account.oauthio.provider);
  }

  hoodie.account.me = function (oauth) {
    console.log('me');
    return oauth.me();
  }

  hoodie.account.verifyUser = function (me) {
    console.log('verifyUser');
    hoodie.account.oauthio.me = me;
    return hoodie.task.start('verifyuser', {provider: hoodie.account.oauthio.provider, me: me});
  }

  hoodie.account.signUpWith = function(task) {
    console.log('signUpWith');
    if (!task.user) {
      return hoodie.task.start('signupwith', {provider: hoodie.account.oauthio.provider, me: hoodie.account.oauthio.me});
    };
  }

  hoodie.account.signInWith = function (provider, options) {
    console.log('signInWith');
    hoodie.account.oauthio.provider = provider;
    return hoodie.account.getOAuthConfig()
      .then(hoodie.account.oauth)
      .then(hoodie.account.me)
      .then(hoodie.account.verifyUser)
      .then(hoodie.account.signUpWith);
  }

});
