/**
 * Hoodie plugin template
 * An example plugin, this is where you put your frontend code (if any)
 */

/* global Hoodie */


Hoodie.extend(function (hoodie) {
  'use strict';

  hoodie.account.oauthio = {

    me: {},
    user: {},
    provider: 'g+',
    oauthio: null,

    getOAuthio: function (url) {
      var defer = window.jQuery.Deferred();
      hoodie.account.oauthio.getLocalConfig()
        .then(function (localConfig) {
          try {
            var result = OAuth.create(
              localConfig.provider,
              { oauth_token: localConfig.oauthio.access_token },
              {
                cors: true,
                url: url,
                query: {
                  access_token: localConfig.oauthio.access_token
                }
              }
            );

            defer.resolve(result);
          } catch (err) {
            defer.reject(err);
          }
        })
        .fail(defer.reject);
      return defer.promise();
    },

    getOAuthConfig: function () {
      // console.log('getOAuthConfig');
      var defer = window.jQuery.Deferred();
      hoodie.task.start('getoauthconfig', {})
        .done(defer.resolve)
        .fail(defer.reject);      
      return defer.promise();
    },

    oauth: function (task) {
      // console.log('oauth');
      OAuth.initialize(task.oAuthConfig.appKey);
      OAuth.setOAuthdURL(task.oAuthConfig.oAuthdURL);
      return OAuth.popup(hoodie.account.oauthio.provider);
    },

    getMe: function (oauth) {
      // console.log('me');
      hoodie.account.oauthio.oauthio = oauth;
      return oauth.me();
    },
    saveMe: function (me) {
      var defer = window.jQuery.Deferred();
      hoodie.store.add('oauth_config', {})
        .done(defer.resolve)
        .fail(defer.reject);      
      return defer.promise();
    },

    verifyUser: function (me) {
      // console.log('verifyUser');
      var defer = window.jQuery.Deferred();
      hoodie.account.oauthio.me = me;
      hoodie.task.start('verifyuser', {provider: hoodie.account.oauthio.provider, me: me})
        .done(defer.resolve)
        .fail(defer.reject);      
      return defer.promise();
    },

    signUpWith: function (task) {
      var defer = window.jQuery.Deferred();
      // console.log('signUpWith');
      if (!task.user) {
        hoodie.task.start('signupwith', {provider: hoodie.account.oauthio.provider, me: hoodie.account.oauthio.me})
          .done(defer.resolve)
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
      // console.log('signinHoodie');
      hoodie.account.oauthio.user.email = task.user.email;
      hoodie.account.oauthio.user.password = task.user.password;
      hoodie.account.signIn(task.user.email, task.user.password, { moveData : true })
          .done(defer.resolve)
          .fail(function () {
            hoodie.account.signUp(task.user.email, task.user.password)
              .done(function () {
                hoodie.account.signIn(task.user.email, task.user.password, { moveData : true })
                  .then(defer.resolve)
                  .fail(defer.reject);
              })
              .fail(defer.reject);
          });
      return defer.promise();
    },

    updateSignUpWith: function (user) {
      var defer = window.jQuery.Deferred();
      hoodie.task.start('updatesignupwith', {provider: hoodie.account.oauthio.provider, email: hoodie.account.username, hoodieId: hoodie.id()})
        .done(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    getLocalConfig: function () {
      var defer = window.jQuery.Deferred();
      hoodie.store.find('oauthconfig', 'userdata')
        .done(defer.resolve)
        .fail(function (err) {
            hoodie.store.add('oauthconfig', { id: 'userdata' })
              .done(defer.resolve)
              .fail(defer.reject);
          });
      return defer.promise();
    },

    setLocalConfig: function (obj) {
      var defer = window.jQuery.Deferred();
      obj.me = hoodie.account.oauthio.me.raw;
      obj.provider = hoodie.account.oauthio.provider;
      obj.user = hoodie.account.oauthio.user;
      obj.oauthio = hoodie.account.oauthio.oauthio;
      hoodie.store.save('oauthconfig', 'userdata', obj)
        .done(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    authenticate: function () {
      var defer = window.jQuery.Deferred();
      hoodie.account.oauthio.getLocalConfig()
        .then(function (oauthconfig) {
          if (oauthconfig.user) {
            hoodie.account.signIn(oauthconfig.user.email, oauthconfig.user.password, { moveData : true })
              .then(defer.resolve)
              .fail(defer.reject);
          } else {
            defer.reject('oauthio: please execute signInWith("provider");');
          }
        })
        .fail(defer.reject);
      return defer.promise();
    },

    isAuthenticate: function () {
      var defer = window.jQuery.Deferred();
      if (hoodie.account.username) {
        defer.resolve({});
      } else {
        //try autenticate with local info
        hoodie.account.oauthio.authenticate()
          .then(defer.resolve)
          .fail(defer.reject);
      }
      return defer.promise();
    },

    sendTrigger: function () {
      var defer = window.jQuery.Deferred();
      hoodie.trigger('signinoauthio', hoodie.account.username, hoodie.id());
      defer.resolve();
      return defer.promise();
    },

    signOut: function() {
      var defer = window.jQuery.Deferred();
      hoodie.account.signOut()
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    signInWith: function (provider, options) {
      var defer = window.jQuery.Deferred();
      // console.log('signInWith');
      hoodie.account.oauthio.provider = provider;
      hoodie.account.oauthio.signOut()
        .then(hoodie.account.oauthio.getOAuthConfig)
        .then(hoodie.account.oauthio.oauth)
        .then(hoodie.account.oauthio.getMe)
        .then(hoodie.account.oauthio.verifyUser)
        .then(hoodie.account.oauthio.signUpWith)
        .then(hoodie.account.oauthio.verifyAnonymousUser)
        .then(hoodie.account.oauthio.signinHoodie)
        .then(hoodie.account.oauthio.updateSignUpWith)
        .then(hoodie.account.oauthio.getLocalConfig)
        .then(hoodie.account.oauthio.setLocalConfig)
        .then(hoodie.account.oauthio.sendTrigger)

        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    }

  }

// listen to new tasks
  hoodie.task.on('start', function (newTask) {
    console.log('start ' + arguments[0].type, arguments)
  });

  // task aborted
  hoodie.task.on('abort', function (abortedTask) {
    console.log('abort ' + arguments[ 0].type, arguments)
  });

  // task could not be completed
  hoodie.task.on('error', function (errorMessage, task) {
    console.log('error ' + arguments[1].type, arguments)
  });

  // task completed successfully
  hoodie.task.on('success', function (completedTask) {
    console.log('success ' + arguments[0].type, arguments)
  });

});
