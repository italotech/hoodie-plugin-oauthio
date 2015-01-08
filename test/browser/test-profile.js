suite('profiles', function () {
  this.timeout(15000);

  suiteSetup(loadUsers);


  test('signIn hommer', function (done) {
    hoodie.account.signIn('Hommer', '123')
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

  test('hommer should getProfile', function (done) {
    hoodie.socialmedia.getProfile()
      .fail(done)
      .then(function (task) {
        this.hommerProfile = task.profileObject;
        assert.ok(!!task.profileObject, 'getProfile with sucess');
        done();
      }.bind(this));
  });

  test('hommer should getProfile from Lisa', function (done) {
    hoodie.socialmedia.getProfile('Lisa')
      .fail(done)
      .then(function (task) {
        assert.ok(!!task.profileObject, 'getProfile with sucess');
        done();
      });
  });

  test('hommer should updateProfile', function (done) {
    var hommerProfile = this.hommerProfile;
    hommerProfile.FirstName = 'Hommer';
    hommerProfile.LastName = 'Simpson';
    hoodie.socialmedia.updateProfile(hommerProfile)
      .fail(done)
      .then(function (task) {
        hoodie.socialmedia.getProfile()
          .fail(done)
          .then(function (task) {
            assert.ok(task.profileObject.LastName === 'Simpson', 'updateProfile with sucess');
            done();
          })
      });
  });

});
