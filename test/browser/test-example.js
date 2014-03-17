suite('example', function () {

  setup(function (done) {
    // phantomjs seems to keep session data between runs,
    // so clear before running tests
    localStorage.clear();
    hoodie.account.signOut().done(function () {
      done();
    });
  });

  test('say hello', function (done) {
    this.timeout(10000);
    var task = hoodie.hello('world');
    task.fail(function (err) {
      assert.ok(false, err.message);
    });
    task.done(function (doc) {
      assert.equal(doc.msg, 'Hello, world');
      done();
    });
  });

});
