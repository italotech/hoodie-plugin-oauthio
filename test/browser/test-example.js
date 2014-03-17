suite('example', function () {

  test('do stuff', function (done) {
    this.timeout(60000);

    hoodie.account.signUp('user', 'pass')
      .fail(function (err) {
        assert.ok(false, err.message);
      })
      .done(function () {
        console.log('saying hello');
        var task = hoodie.hello('world');
        task.fail(function (err) {
          console.log('saying hello failed');
          assert.ok(false, err.message);
        });
        task.done(function (doc) {
          console.log('saying hello done');
          test.equal(doc.msg, 'Hello, world');
          done();
        });
      });
    });

});
