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
    provider: 'local',
    oauthio: null,

    getOAuthio: function (url) {
      var defer = window.jQuery.Deferred();
      defer.notify('getOAuthio', arguments, false);
      hoodie.account.oauthio.getLocalConfig()
        .then(function (localConfig) {
          try {
            var result = window.OAuth.create(
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
      defer.notify('getOAuthConfig', arguments, false);
      hoodie.task.start('getoauthconfig', {})
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    oauth: function (task) {
      // console.log('oauth');
      window.OAuth.initialize(task.oAuthConfig.appKey);
      window.OAuth.setOAuthdURL(task.oAuthConfig.oAuthdURL);
      return window.OAuth.popup(hoodie.account.oauthio.provider);
    },

    getMe: function (oauth) {
      // console.log('me');
      hoodie.account.oauthio.oauthio = oauth;
      return oauth.me();
    },

    setUserName: function (me) {
      var defer = window.jQuery.Deferred();
      defer.notify('setUserName', arguments, false);
      if (!!me.raw)
        me = me.raw;
      me.username = me.email;
      defer.resolve(me);
      return defer.promise();
    },

    verifyUser: function (me) {
      var defer = window.jQuery.Deferred();
      defer.notify('verifyUser', arguments, false);
      hoodie.account.oauthio.me = me;
      hoodie.account.oauthio.lookupHoodieId(hoodie.account.oauthio.provider, hoodie.account.oauthio.me.id)
        .then(function (task) {
          if (task.user)
            hoodie.account.oauthio.me = task.user;
          defer.resolve(task);
        })
        .fail(defer.reject);
      return defer.promise();
    },

    signUpWith: function (task) {
      var defer = window.jQuery.Deferred();
      defer.notify('signUpWith', arguments, false);
      if (!task.user) {
        hoodie.task.start('signupwith', {provider: hoodie.account.oauthio.provider, me: hoodie.account.oauthio.me})
          .then(defer.resolve)
          .fail(defer.reject);
      } else {
        defer.resolve(task);
      }
      return defer.promise();
    },

    verifyAnonymousUser: function (task) {
      var defer = window.jQuery.Deferred();
      defer.notify('verifyAnonymousUser', arguments, false);
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
      defer.notify('signinHoodie', arguments, false);
      hoodie.account.oauthio.user.username = task.user.username;
      hoodie.account.oauthio.user.password = task.user.password;
      hoodie.account.signIn(task.user.username, task.user.password, { moveData : true })
          .then(defer.resolve)
          .fail(function () {
            hoodie.account.signUp(task.user.username, task.user.password)
              .then(function () {
                hoodie.account.signIn(task.user.username, task.user.password, { moveData : true })
                  .then(defer.resolve)
                  .fail(defer.reject);
              })
              .fail(defer.reject);
          });
      return defer.promise();
    },

    updateSignUpWith: function () {
      var defer = window.jQuery.Deferred();
      defer.notify('updateSignUpWith', arguments, false);
      hoodie.task.start('updatesignupwith', {provider: hoodie.account.oauthio.provider, username: hoodie.account.username, hoodieId: hoodie.id()})
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    getLocalConfig: function () {
      var defer = window.jQuery.Deferred();
      defer.notify('getLocalConfig', arguments, false);
      hoodie.store.find('oauthconfig', 'userdata')
        .then(defer.resolve)
        .fail(function () {
            hoodie.store.add('oauthconfig', { id: 'userdata' })
              .then(defer.resolve)
              .fail(defer.reject);
          });
      return defer.promise();
    },

    setLocalConfig: function (obj) {
      var defer = window.jQuery.Deferred();
      defer.notify('setLocalConfig', arguments, false);

      obj.me = hoodie.account.oauthio.me;
      obj.provider = hoodie.account.oauthio.provider;
      obj.user = hoodie.account.oauthio.user;
      obj.oauthio = hoodie.account.oauthio.oauthio;
      hoodie.store.save('oauthconfig', 'userdata', obj)
        .then(defer.resolve)
        .fail(defer.reject);

      return defer.promise();
    },

    authenticate: function () {
      var defer = window.jQuery.Deferred();
      defer.notify('authenticate', arguments, false);
      hoodie.account.oauthio.getLocalConfig()
        .then(function (oauthconfig) {
          if (oauthconfig.user) {
            hoodie.account.signIn(oauthconfig.user.username, oauthconfig.user.password)
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
      defer.notify('isAuthenticate', arguments, false);
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

    sendTrigger: function (userdata) {
      var defer = window.jQuery.Deferred();
      defer.notify('sendTrigger', arguments, false);
      hoodie.trigger('signinoauthio', hoodie.account.username, hoodie.id(), userdata);
      defer.resolve(hoodie.account.username, hoodie.id(), userdata);
      return defer.promise();
    },

    signOut: function () {
      var defer = window.jQuery.Deferred();
      defer.notify('signOut', arguments, false);
      hoodie.account.signOut()
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    lookupHoodieId: function (provider, id) {
      var defer = window.jQuery.Deferred();
      defer.notify('lookupHoodieId', arguments, false);
      hoodie.task.start('lookuphoodieid', {find: {provider: provider, id: id}})
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    signInWith: function (provider) {
      var defer = window.jQuery.Deferred();
      // console.log('signInWith');
      hoodie.account.oauthio.provider = provider;

      debugPromisseGstart('signInWith', console.groupCollapsed)
        .then(hoodie.account.oauthio.getOAuthConfig)
        .then(hoodie.account.oauthio.oauth)
        .then(hoodie.account.oauthio.getMe)
        .then(hoodie.account.oauthio.setUserName)
        .then(hoodie.account.oauthio.verifyUser)
        .then(hoodie.account.oauthio.signUpWith)
        .then(hoodie.account.oauthio.verifyAnonymousUser)
        .then(hoodie.account.oauthio.signinHoodie)
        .then(hoodie.account.oauthio.updateSignUpWith)
        .then(hoodie.account.oauthio.getLocalConfig)
        .then(hoodie.account.oauthio.setLocalConfig)
        .then(hoodie.account.oauthio.sendTrigger)
        .then(debugPromisseGend)
        .progress(out)
        .then(defer.resolve)
        .fail(defer.reject);
      defer.notify('signInWith', arguments, false);
      return defer.promise();
    },

    signIn: function (username, password, me) {
      var defer = window.jQuery.Deferred();
      if (!me)
        me = {};
      me.id = username.toLowerCase();
      me.username = username.toLowerCase();
      me.password = password;
      
      hoodie.account.oauthio.provider = 'local';
      // console.log('signInWith');
      debugPromisseGstart('signIn', console.groupCollapsed)
        .then(function () {
          return hoodie.account.oauthio.verifyUser(me);
        })
        .then(hoodie.account.oauthio.signUpWith)
        .then(hoodie.account.oauthio.verifyAnonymousUser)
        .then(hoodie.account.oauthio.signinHoodie)
        .then(hoodie.account.oauthio.updateSignUpWith)
        .then(hoodie.account.oauthio.getLocalConfig)
        .then(hoodie.account.oauthio.setLocalConfig)
        .then(hoodie.account.oauthio.sendTrigger)
        .then(debugPromisseGend)
        .progress(out)
        .then(defer.resolve)
        .fail(defer.reject);
      defer.notify('signIn', arguments, false);
      return defer.promise();
    },

  };

// listen to new tasks

  var debugPromisseGstart = function (text) {
    var defer = window.jQuery.Deferred();
    (window.debug === 'oauthio') && console.groupCollapsed(text);
    defer.resolve({});
    return defer.promise();
  };

  var debugPromisseGend = function () {
    var defer = window.jQuery.Deferred();
    (window.debug === 'oauthio') && console.groupEnd();
    defer.resolve({});
    return defer.promise();
  };

  function out(name, obj, task) {
    if (window.debug === 'oauthio') {
      var group = (task) ? 'task: ' + task + '(' + name + ')': 'method: ' + name;

      console.groupCollapsed(group);
      if (!!obj)
        console.table(obj);
      console.groupEnd();
    }
  }
  
  if (window.debug === 'oauthio') {
    hoodie.task.on('start', function () {
      out('start', arguments[0], arguments[0].type);
    });

    // task aborted
    hoodie.task.on('abort', function () {
      out('abort', arguments[0], arguments[0].type);
    });

    // task could not be completed
    hoodie.task.on('error', function () {
      out('error', arguments[1], arguments[1].type);
    });

    // task completed successfully
    hoodie.task.on('success', function () {
      out('success', arguments[0], arguments[0].type);
    });
  }
});
