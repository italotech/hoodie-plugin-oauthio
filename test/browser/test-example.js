suite('example', function () {

  setup(function (done) {
    // phantomjs seems to keep session data between runs,
    // so clear before running tests
    localStorage.clear();
    hoodie.account.signOut().done(function () {
      done();
    });
  });

/*
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
  .catch(function (err) {
    if (err.status === 409) { //conflict
      hoodie.account.signIn(login, pass)
        .then(okFn)
        .catch(errFn);
    } else {
      okFn.apply(this, [err]);
    }
  });
*/

  // test('say hello', function (done) {
  //   var task = hoodie.hello('world');
  //   task.fail(function (err) {
  //     assert.ok(false, err.message);
  //   });
  //   task.done(function (doc) {
  //     assert.equal(doc.msg, 'Hello, world');
  //     done();
  //   });
  // });

test('signUp', function (done) {
    this.timeout(10000);
    hoodie.account.signUp('testuser', 'password')
      .fail(function (err) {
        assert.ok(false, err.message);
      })
      .done(function () {
        assert.equal(
          hoodie.account.username,
          'testuser',
          'should be logged in after signup'
        );
        done();
      });
  });

  test('signIn', function (done) {
    this.timeout(10000);
    assert.ok(!hoodie.account.username, 'start logged out');
    hoodie.account.signIn('testuser', 'password')
      .fail(function (err) {
        assert.ok(false, err.message);
      })
      .done(function () {
        assert.equal(hoodie.account.username, 'testuser');
        done();
      })
  });

  test('getToken', function (done) {
    this.timeout(10000);
    var task = hoodie.account.getStateToken();
    task.fail(function (err) {
      assert.ok(false, err.message);
    });
    task.done(function (doc) {
      assert.equal(doc.msg, 'Hello, world');
      done();
    });
  });

});
