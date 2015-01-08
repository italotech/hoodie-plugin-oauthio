suite('network', function () {
  this.timeout(15000);

  var provider = 'facebook';

  test('signIn hommer', function (done) {
    hoodie.account.oauthio.signInWith(provider)
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

