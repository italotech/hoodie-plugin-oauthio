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
      // console.log('getOAuthConfig');
      return hoodie.task.start('getoauthconfig', {});
    },

    oauth: function (task) {
      // console.log('oauth');
      OAuth.initialize(task.oAuthConfig.appKey);
      OAuth.setOAuthdURL(task.oAuthConfig.oAuthdURL);
      return OAuth.popup(hoodie.account.oauthio.provider);
    },

    getMe: function (oauth) {
      // console.log('me');
      return oauth.me();
    },

    verifyUser: function (me) {
      // console.log('verifyUser');
      hoodie.account.oauthio.me = me;
      return hoodie.task.start('verifyuser', {provider: hoodie.account.oauthio.provider, me: me});
    },

    signUpWith: function (task) {
      var defer = window.jQuery.Deferred();
      // console.log('signUpWith');
      if (!task.user) {
        hoodie.task.start('signupwith', {provider: hoodie.account.oauthio.provider, me: hoodie.account.oauthio.me})
          .then(defer.resolve)
          .fail(defer.reject);
      } else {
        defer.resolve(task);
      };
      return defer.promise();
    },

    verifyAnonymousUser: function (task) {
      var defer = window.jQuery.Deferred();
      // console.log('verifyAnonymousUser');
      if (hoodie.account.hasAnonymousAccount()) {
        hoodie.account.destroy()
          .then(function () {
            defer.resolve(task);
          })
          .fail(defer.reject);
      } else {
        defer.resolve(task);
      }
      return defer.promise();
    },

    signinHoodie: function (task) {
      var defer = window.jQuery.Deferred();
      hoodie.account.signIn(task.user.email, task.user.password)
          .then(defer.resolve)
          .fail(function () {
            hoodie.account.signUp(task.user.email, task.user.password)
              .then(function () {
                return hoodie.account.oauthio.signinHoodie(task);
              })
              .fail(defer.reject);
          });
      return defer.promise();
    },

    signInWith: function (provider, options) {
      var defer = window.jQuery.Deferred();
      // console.log('signInWith');
      hoodie.account.oauthio.provider = provider;
      hoodie.account.oauthio.getOAuthConfig()
        .then(hoodie.account.oauthio.oauth)
        .then(hoodie.account.oauthio.getMe)
        .then(hoodie.account.oauthio.verifyUser)
        .then(hoodie.account.oauthio.signUpWith)
        .then(hoodie.account.oauthio.verifyAnonymousUser)
        .then(hoodie.account.oauthio.signinHoodie)

        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    }

  }

});
