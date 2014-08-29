/**
 * Hoodie plugin template
 * An example plugin worker, this is where you put your backend code (if any)
 */
//var appName = require('../../package.json').name;
//var compareVersion = require('compare-version');
//var hoodieServerVer = require('../hoodie-server/package.json').version;
var OAuth = require('oauthio'),
		session = require('express-session'),
		passwordHash = require('password-hash');

module.exports = function (hoodie, callback) {
	var oauth_cofig = hoodie.config.get('oauthio_config');
	var session_object = session({secret: 'keyboard cat'});

  if (!oauth_cofig) hoodie.config.set('oauthio_config', {"enabled":false,"settings":{"url":"https://oauth.io","publicKey":"","secretKey":""}});

	//OAuth.setOAuthdURL(oauth_cofig.settings.url, '/');
	OAuth.setOAuthdUrl(oauth_cofig.settings.url, '/');
	OAuth.initialize(oauth_cofig.settings.publicKey, oauth_cofig.settings.secretKey);

  hoodie.task.on('getstatetoken:add', function(db, task) {
  	// console.log('getstatetoken', task);

		try {
			task.stateToken = OAuth.generateStateToken(session_object);
			hoodie.task.success(db, task);
		} catch (err) {
			console.log('auth try error', err);
			hoodie.task.error(db, task, err);
		};
  	
  })

  hoodie.task.on('signinoauth:add', function(db, task) {
  	// console.log('signinoauth', task);

		var options = {
			code: task.code
		};
		try {
			OAuth.auth(task.provider, session_object, options)
				.then(function (auth) {
					return auth.me();
				})
				.then(function (profile) {
					console.log('auth', profile);
					//TODO fix the password
					profile.password = profile.id + oauth_cofig.settings.secretKey;
					task.profile = profile;
					hoodie.task.success(db, task);
				})
				.fail(function (error) {
					console.log('auth error', error);
					hoodie.task.error(db, task, error);
				});
		} catch (err) {
			console.log('auth try error', err);
			hoodie.task.error(db, task, err);
		};
		
		// var add = hoodie.account.add//('oath', task );
		// console.log('add', add);

			// .then(function (sUp) {
			// 	console.log('sUp', sUp);
  	// 		hoodie.task.success(db, task);
			// })
			// .fail(function (err) {
			// 	console.log('sUp fail', err);              
			// 	hoodie.task.error(db, task, err);
			// });
  	
  })

	// authServer.get('/callback', function(req, res, next) {
	// 	if (auths[req.session.ref]['id'] == undefined) {
	// 		//if there's no email provided by the provider (like twitter), we will create our own id
	// 		var id = (req.user.emails == undefined) ? req.user.displayName.replace(' ','_').toLowerCase()+'_'+req.user.id : req.user.emails[0].value;
	// 	} else {
	// 		var id = auths[req.session.ref]['id'];
	// 	}
		
	// 	//check if we have a couch user and act accordingly
	// 	hoodie.account.find('user', id, function(err, data){
	// 		var updateVals = {};
			
	// 		if (!err) {
	// 			if (auths[req.session.ref]['method'] == 'login' && !auths[req.session.ref]['authenticated']) {
	// 				auths[req.session.ref]['provider'] = req.query.provider;
	// 				auths[req.session.ref]['id'] = id;
	// 				auths[req.session.ref]['full_profile'] = req.user;
				
	// 				auths[req.session.ref]['authenticated'] = true;
				
	// 				//set the auth time value (used for cleanup)
	// 				auths[req.session.ref]['auth_time'] = new Date().getTime();
					
	// 				//temporarily change the users password - this is where the magic happens!
	// 				auths[req.session.ref]['temp_pass'] = Math.random().toString(36).slice(2,11);
					
	// 				//update password
	// 				updateVals['password'] = auths[req.session.ref]['temp_pass'];
	// 			}
				
	// 			//always update connections
	// 			var connections = (data.connections) ? data.connections : {};
	// 			connections[req.query.provider] = auths[req.session.ref]['connections'][req.query.provider]; //first update from the stored connections
	// 			auths[req.session.ref]['connections'] = connections; //then feed the complete obeject back to the authObject
	// 			updateVals['connections'] = connections; //and make sure we store the latest
								
	// 			//update values
	// 			hoodie.account.update('user', id, updateVals, function(err, data){ console.log(data); });
				
	// 			//mark as complete
	// 			auths[req.session.ref]['complete'] = true;
				
	// 			//give the user some visual feedback
	// 			res.send('<html><head><script src="http://fgnass.github.io/spin.js/dist/spin.min.js"></script></head><body onload="/*self.close();*/" style="margin:0; padding:0; width:100%; height: 100%; display: table;"><div style="display:table-cell; text-align:center; vertical-align: middle;"><div id="spin" style="display:inline-block;"></div></div><script>var spinner=new Spinner().spin(); document.getElementById("spin").appendChild(spinner.el);</script></body></html>');
	// 		} else {
	// 			//assume the error is because the couch user is not there and just create one
	// 			var uuid = Math.random().toString(36).slice(2,9);
	// 			var timeStamp = new Date();
	// 			var userdoc = {
	// 				id: id,
	// 				password: Math.random().toString(36).slice(2,11),
	// 				createdAt: timeStamp,
	// 				updatedAt: timeStamp,
	// 				signedUpAt: timeStamp,
	// 				database: 'user/'+uuid,
	// 				name: 'user/'+id
	// 			};
				
	// 			//set ownerHash/hoodieId
	// 			if (compareVersion(hoodieServerVer, '0.8.15') >= 0) {
	// 				userdoc['hoodieId'] = uuid;
	// 			} else {
	// 				userdoc['ownerHash'] = uuid;
	// 			}
				
	// 			hoodie.account.add('user', userdoc, function(err, data){
	// 				//cycle back through so we can catch the fully created user
	// 				if (!err) res.redirect(host+'/'+req.query.provider+'/callback');
	// 			});
	// 		}
	// 	});
	// });

  // plugin initialization complete
  callback();

};
