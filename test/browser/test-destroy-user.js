suite('delete user db on account.destroy', function () {

  setup(function (done) {
    // phantomjs seems to keep session data between runs,
    // so clear before running tests
    localStorage.clear();
    hoodie.account.signOut().done(function () {
      done();
    });
  });

  test('user db is removed', function (done) {
    this.timeout(10000);
    hoodie.account.signUp('destroytest1', 'password')
      .fail(function (err) {
        assert.ok(false, err.message);
      })
      .done(function () {
        var dburl = '/_api/user%2F' + hoodie.id();
        $.getJSON(dburl)
          .fail(function (err) {
            assert.ok(false, JSON.stringify(err));
          })
          .done(function (data) {
            assert.ok(data.db_name, 'get db info');
            hoodie.account.destroy()
              .fail(function (err) {
                assert.ok(false, '' + err);
              })
              .done(function () {
                setTimeout(function () {
                  $.ajax({
                    type: 'GET',
                    url: dburl,
                    dataType: 'json',
                    complete: function (req) {
                      // db should have been deleted
                      assert.equal(req.status, 404);
                      done();
                    }
                  });
                }, 1000);
              });
          });
      });
  });

});
