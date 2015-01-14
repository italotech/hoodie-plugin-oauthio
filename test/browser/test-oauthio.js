suite('network', function () {
  this.timeout(15000);

  var provider = 'facebook';


  test('signInWith fb', function (done) {
    hoodie.account.oauthio.signInWith(provider)
      .fail(function (err) {
        done();
        assert.ok(false, err.message);
      })
      .done(function () {
        assert.equal(
          hoodie.account.username,
          'gabriel.mancini@gmail.com',
          'should be logged in after signup'
        );
        done();
      });
  });

  test('signup hommer', function (done) {
    hoodie.account.oauthio.signIn('Hommer', '123', {bla: 'bla'})
      .fail(function (err) {
        done();
        assert.ok(false, err.message);
      })
      .done(function () {
        assert.equal(
          hoodie.account.username,
          'homer',
          'should be logged in after signup'
        );
        done();
      });
  });

  test('signIn hommer', function (done) {
    hoodie.account.oauthio.signIn('Hommer', '123')
      .fail(function (err) {
        done();
        assert.ok(false, err.message);
      })
      .done(function () {
        assert.equal(
          hoodie.account.username,
          'hommer',
          'should be logged in after signup'
        );
        done();
      });
  });


});

