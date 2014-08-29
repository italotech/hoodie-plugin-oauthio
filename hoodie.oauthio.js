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

	hoodie.account.getStateToken = function () {
		return hoodie.task.start('getstatetoken');
	}

	hoodie.account.signInOauth = function (provider, code) {
		return hoodie.task.start('signinoauth', {
			provider: provider,
			code: code
		})
	}
	
});
