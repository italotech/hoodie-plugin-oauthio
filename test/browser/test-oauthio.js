suite('network', function () {
  this.timeout(15000);

  var provider = 'facebook';

  suiteSetup(function (done) {
    hoodie.account.signOut()
      .then(done);
  })

  test('isAuthenticate empty localStorage', function (done) {
    hoodie.account.oauthio.isAuthenticate()
      .fail(function (err) {
        done();
        assert.ok(true, err);
      })
      .then(function () {
        done();
        assert.ok(false, 'should be error');
      });
  });


  test('signInWith fb', function (done) {
    hoodie.account.oauthio.signInWith(provider)
      .fail(function (err) {
        done();
        assert.ok(false, err);
      })
      .then(function () {
        done();
        assert.equal(
          hoodie.account.username,
          'gabriel.mancini@gmail.com',
          'should be logged in after signup'
        );
      });
  });


  test('isAuthenticate fb', function (done) {
    hoodie.account.oauthio.isAuthenticate()
      .fail(function (err) {
        done();
        assert.ok(false, err);
      })
      .then(function () {
        done();
        assert.equal(
          hoodie.account.username,
          'gabriel.mancini@gmail.com',
          'should be logged in after signup'
        );
      });
  });

  test('logout isAuthenticate', function (done) {
    hoodie.account.signOut()
      .then(function () {
        hoodie.account.oauthio.isAuthenticate()
          .fail(function (err) {
            done();
            assert.ok(false, err);
          })
          .then(function () {
            done();
            assert.equal(
              hoodie.account.username,
              'gabriel.mancini@gmail.com',
              'should be logged in after signup'
            );
          });        
      })
      .fail(function (err) {
        done();
        assert.ok(false, err);
      })
  });

  test('signup hommer', function (done) {
    hoodie.account.signOut()
      .then(function () {
        hoodie.account.oauthio.signIn('Hommer', '123', {bla: 'bla'})
          .fail(function (err) {
            done();
            assert.ok(false, err);
          })
          .then(function () {
            done();
            assert.equal(
              hoodie.account.username,
              'homer',
              'should be logged in after signup'
            );
          });
      })
      .fail(function (err) {
        done();
        assert.ok(false, err);
      })
  });

  test('signIn hommer', function (done) {
    hoodie.account.signOut()
      .then(function () {
        hoodie.account.oauthio.signIn('Hommer', '123')
          .fail(function (err) {
            done();
            assert.ok(false, err);
          })
          .then(function () {
            done();
            assert.equal(
              hoodie.account.username,
              'hommer',
              'should be logged in after signup'
            );
          });
      })
      .fail(function (err) {
        done();
        assert.ok(false, err);
      })
  });

  test('isAuthenticate local', function (done) {
    hoodie.account.oauthio.isAuthenticate()
      .fail(function (err) {
        assert.ok(false, err);
        done();
      })
      .then(function () {
        done();
        assert.equal(
          hoodie.account.username,
          'hommer',
          'should be logged in after signup'
        );
      });
  });

});

