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
      defer.notify('getOAuthio', arguments, false);
      return defer.promise();
    },

    getOAuthConfig: function () {
      // console.log('getOAuthConfig');
      var defer = window.jQuery.Deferred();
      hoodie.task.start('getoauthconfig', {})
        .done(defer.resolve)
        .fail(defer.reject);
      defer.notify('getOAuthConfig', arguments, false);
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
      if (!!me.raw)
        me = me.raw;
      me.username = me.email;
      defer.resolve(me);
      defer.notify('setUserName', arguments, false);
      return defer.promise();
    },

    verifyUser: function (me) {
      // console.log('verifyUser');
      var defer = window.jQuery.Deferred();
      hoodie.account.oauthio.me = me;
      hoodie.account.oauthio.lookupHoodieId(hoodie.account.oauthio.provider, hoodie.account.oauthio.me.id)
        .done(defer.resolve)
        .fail(defer.reject);
      defer.notify('verifyUser', arguments, false);
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
      }
      defer.notify('signUpWith', arguments, false);
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
      defer.notify('verifyAnonymousUser', arguments, false);
      return defer.promise();
    },

    signinHoodie: function (task) {
      var defer = window.jQuery.Deferred();
      // console.log('signinHoodie');
      hoodie.account.oauthio.user.username = task.user.username;
      hoodie.account.oauthio.user.password = task.user.password;
      hoodie.account.signIn(task.user.username, task.user.password, { moveData : true })
          .done(defer.resolve)
          .fail(function () {
            hoodie.account.signUp(task.user.username, task.user.password)
              .done(function () {
                hoodie.account.signIn(task.user.username, task.user.password, { moveData : true })
                  .then(defer.resolve)
                  .fail(defer.reject);
              })
              .fail(defer.reject);
          });
      defer.notify('signinHoodie', arguments, false);
      return defer.promise();
    },

    updateSignUpWith: function () {
      var defer = window.jQuery.Deferred();
      hoodie.task.start('updatesignupwith', {provider: hoodie.account.oauthio.provider, username: hoodie.account.username, hoodieId: hoodie.id()})
        .done(defer.resolve)
        .fail(defer.reject);
      defer.notify('updateSignUpWith', arguments, false);
      return defer.promise();
    },

    getLocalConfig: function () {
      var defer = window.jQuery.Deferred();
      hoodie.store.find('oauthconfig', 'userdata')
        .done(defer.resolve)
        .catch(function () {
            hoodie.store.add('oauthconfig', { id: 'userdata' })
              .done(defer.resolve)
              .catch(defer.reject);
          });
      defer.notify('getLocalConfig', arguments, false);
      return defer.promise();
    },

    setLocalConfig: function (obj) {
      var defer = window.jQuery.Deferred();

      obj.me = hoodie.account.oauthio.me;
      obj.provider = hoodie.account.oauthio.provider;
      obj.user = hoodie.account.oauthio.user;
      obj.oauthio = hoodie.account.oauthio.oauthio;
      hoodie.store.save('oauthconfig', 'userdata', obj)
        .done(defer.resolve)
        .catch(defer.reject);

      defer.notify('setLocalConfig', arguments, false);
      return defer.promise();
    },

    authenticate: function () {
      var defer = window.jQuery.Deferred();
      hoodie.account.oauthio.getLocalConfig()
        .then(function (oauthconfig) {
          if (oauthconfig.user) {
            hoodie.account.signIn(oauthconfig.user.username, oauthconfig.user.password, { moveData : true })
              .then(defer.resolve)
              .fail(defer.reject);
          } else {
            defer.reject('oauthio: please execute signInWith("provider");');
          }
        })
        .fail(defer.reject);
      defer.notify('authenticate', arguments, false);
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
      defer.notify('isAuthenticate', arguments, false);
      return defer.promise();
    },

    sendTrigger: function (userdata) {
      var defer = window.jQuery.Deferred();
      hoodie.trigger('signinoauthio', hoodie.account.username, hoodie.id(), userdata);
      defer.notify('sendTrigger', arguments, false);
      defer.resolve(userdata);
      return defer.promise();
    },

    signOut: function () {
      var defer = window.jQuery.Deferred();
      hoodie.account.signOut()
        .then(defer.resolve)
        .fail(defer.reject);
      defer.notify('signOut', arguments, false);
      return defer.promise();
    },

    signInWith: function (provider) {
      var defer = window.jQuery.Deferred();
      // console.log('signInWith');
      hoodie.account.oauthio.provider = provider;

      debugPromisseGstart('signInWith', console.groupCollapsed)
        .then(hoodie.account.oauthio.signOut)
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
        .progress(out)
        .then(defer.resolve)
        .fail(defer.reject)
        .then(debugPromisseGend);
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
        .then(hoodie.account.oauthio.signOut)
        .then(function () {
          var defer = window.jQuery.Deferred();
          hoodie.account.oauthio.verifyUser(me)
            .then(defer.resolve)
            .fail(defer.reject);
          return defer.promise();
        })
        .then(hoodie.account.oauthio.signUpWith)
        .then(hoodie.account.oauthio.verifyAnonymousUser)
        .then(hoodie.account.oauthio.signinHoodie)
        .then(hoodie.account.oauthio.updateSignUpWith)
        .then(hoodie.account.oauthio.getLocalConfig)
        .then(hoodie.account.oauthio.setLocalConfig)
        .then(hoodie.account.oauthio.sendTrigger)
        .progress(out)
        .then(defer.resolve)
        .fail(defer.reject)
        .then(debugPromisseGend);
      defer.notify('signIn', arguments, false);
      return defer.promise();
    },

    lookupHoodieId: function (provider, id) {
      var defer = window.jQuery.Deferred();
      hoodie.task.start('lookuphoodieid', {find: {provider: provider, id: id}})
        .done(defer.resolve)
        .fail(defer.reject);
      defer.notify('lookupHoodieId', arguments, false);
      return defer.promise();
    }
  };

// listen to new tasks

  var debugPromisseGstart = function (text, method) {
    var defer = window.jQuery.Deferred();
    window.debug && console.groupCollapsed(text);
    defer.resolve({});
    return defer.promise();
  };

  var debugPromisseGend = function (text, method) {
    var defer = window.jQuery.Deferred();
    window.debug && console.groupEnd();
    defer.resolve({});
    return defer.promise();
  };

  function out(name, obj, task) {
    if (!!window.debug) {
      var group = (task) ? 'task: ' + task + '('+name+')': 'method: '+name;

      console.groupCollapsed(group);
      arguments[2] && console.table(arguments[2]);
      console.groupEnd();
    }
  }

  hoodie.task.on('start', function () {
    out('start ', arguments[0], arguments[0].type);
  });

  // task aborted
  hoodie.task.on('abort', function () {
    out('abort ', arguments[0], arguments[0].type);
  });

  // task could not be completed
  hoodie.task.on('error', function () {
    out('error ', arguments[1], arguments[1].type);
  });

  // task completed successfully
  hoodie.task.on('success', function () {
    out('success', arguments[0], arguments[0].type);
  });

});
