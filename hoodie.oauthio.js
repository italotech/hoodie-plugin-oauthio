/**
 * Hoodie plugin template
 * An example plugin, this is where you put your frontend code (if any)
 */

/* global Hoodie */


Hoodie.extend(function (hoodie) {
  'use strict';

  hoodie.account.oauthio = {

    me: {},

    provider: 'g+',

    getOAuthConfig: function () {
      var defer = window.jQuery.Deferred();
      console.log('getOAuthConfig');
      hoodie.task.start('getoauthconfig', {})
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    oauth: function (task) {
      var defer = window.jQuery.Deferred();
      console.log('oauth');
      OAuth.initialize(task.oAuthConfig.appKey);
      OAuth.setOAuthdURL(task.oAuthConfig.oAuthdURL);
      OAuth.popup(hoodie.account.oauthio.provider)
        .done(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    getMe: function (oauth) {
      var defer = window.jQuery.Deferred();
      console.log('me');
      oauth.me()
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    verifyUser: function (me) {
      var defer = window.jQuery.Deferred();
      console.log('verifyUser');
      hoodie.account.oauthio.me = me;
      hoodie.task.start('verifyuser', {provider: hoodie.account.oauthio.provider, me: me})
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    signUpWith: function(task) {
      var defer = window.jQuery.Deferred();
      console.log('signUpWith');
      if (!task.user) {
        hoodie.task.start('signupwith', {provider: hoodie.account.oauthio.provider, me: hoodie.account.oauthio.me})
          .then(defer.resolve)
          .fail(defer.reject);
      } else {
        defer.reject('encontrou o corno');
      };
      return defer.promise();
    },

    signInWith: function (provider, options) {
      var defer = window.jQuery.Deferred();
      console.log('signInWith');
      hoodie.account.oauthio.provider = provider;
      hoodie.account.oauthio.getOAuthConfig()
        .then(hoodie.account.oauthio.oauth)
        .then(hoodie.account.oauthio.getMe)
        .then(hoodie.account.oauthio.verifyUser)
        .then(hoodie.account.oauthio.signUpWith)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    }

  }

});
