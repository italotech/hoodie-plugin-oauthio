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

  hoodie.account.verifyUser = function (me) {
    console.log('verifyUser');
    hoodie.account.oauthio.me = me;
    return hoodie.task.start('verifyuser', {provider: hoodie.account.oauthio.provider, me: me});
  }

  hoodie.account.oauth = function (task) {
    console.log('oauth');
    OAuth.initialize(task.oAuthConfig.appKey);
    OAuth.setOAuthdURL(task.oAuthConfig.oAuthdURL);
    return OAuth.popup(hoodie.account.oauthio.provider)
      .done(function (oauth) {
        console.log('oauth sucess');
        return oauth.me();
      })
      .fail(function (err) {
        console.log('oauth fail', err);
      });
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
      .then(hoodie.account.verifyUser)
      .then(hoodie.account.signUpWith)
      .fail(function (err) {
        console.log('ERRPR:', err);
      });
  }

  hoodie.account.signInWith_problem = function (provider, options) {
    console.log('signInWith');
    var _me;
    return hoodie.account.getOAuthConfig()
      .then(function (task) {
        return hoodie.account.oauth(provider, task.oAuthConfig.appKey, task.oAuthConfig.oAuthdURL);
      })
      .then(function (me) {
        _me = me;
        return hoodie.account.verifyUser(provider, me);
      })
      .then(function (task) {
        console.log('---------' + task.user + '-- -----------');
        if (!task.user) {
          hoodie.account.signUpWith(provider, _me);
        }
          //return hoodie.sig
      })
      .fail(function (err) {
        console.log('ERRPR:', err);
      });
  }

  hoodie.account.signInWith_sample = function (provider) {
    var login, pass,
        errFn = function (err) {
          console.log('sIn fail', err);
          auth.setConnected(false);
          auth.clearCache();
          hoodie.account.signOut();
        },
        okFn = function (dataSignIn) {
          console.log('user name ', hoodie.account.username);
          auth.setConnected(true, providerName);
        };

    return hoodie.account.getStateToken()
      .then(function (dataTask) {
        console.log('user name ', hoodie.account.username);
        console.log('getStateToken', dataTask);
        return auth.getProvider(providerName, dataTask.stateToken);
      })
      .then(function (dataProvider) {
        console.log('user name ', hoodie.account.username);
        console.log('getProvider', dataProvider);
        return hoodie.account.signInOauth(providerName, dataProvider.code);
      })
      .then(function (dataOauth) {
        console.log('user name ', hoodie.account.username);
        console.log('signInOauth', dataOauth);
        return (!dataOauth.me) ?
                dataOauth.profile :
                dataOauth.me();
      })
      .then(function (dataProfile) {
        console.log('user name ', hoodie.account.username);
        console.log('profile', dataProfile);
        login = dataProfile.email;
        pass = dataProfile.password;
        return (!hoodie.account.username && hoodie.account.hasAnonymousAccount()) ?
          hoodie.account.destroy() :
          hoodie.account.signUp(login, pass);
      })
      .then(function (dataChangeUsername) {
        console.log('user name ', hoodie.account.username);
        console.log('changeUsername', dataChangeUsername);
        return hoodie.account.signUp(login, pass);
      })
      .then(function (dataSignUp) {
        console.log('user name ', hoodie.account.username);
        console.log('signUp', dataSignUp);
        return hoodie.account.signIn(login, pass);
      })
      .then(okFn)
      .fail(function (err) {
        if (err.status === 409) { //conflict
          hoodie.account.signIn(login, pass)
            .then(okFn)
            .fail(errFn);
        } else {
          okFn.apply(this, [err]);
        }
      });
  }

	hoodie.account.getStateToken = function (cb) {
		return hoodie.task.start('getstatetoken');
	}

	hoodie.account.signInOauth = function (provider, code) {
    return hoodie.task.start('signinoauth', {
      provider: provider,
      code: code
    })
  }

  hoodie.account.signIn2Oauth = function (provider) {
    return hoodie.task.start('signin2oauth', {
      provider: provider
    })
  }

  hoodie.account.signUp2Oauth = function (provider) {
    return hoodie.task.start('signup2oauth', {
      provider: provider
    })
  }

});
