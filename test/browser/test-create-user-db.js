suite('create user db', function () {

  var newUsername = function() {
    var idx = 0;
    return function() {
      return 'dbtest' + idx++;
    }
  }();

  setup(function (done) {
    // phantomjs seems to keep session data between runs,
    // so clear before running tests
    localStorage.clear();
    hoodie.account.signOut().done(function () {
      done();
    });
  });

  test('user database added on signUp', function (done) {
    this.timeout(10000);
    hoodie.account.signUp(newUsername(), 'password')
      .then(function () {
        return $.getJSON('/_api/_all_dbs');
      })
      .fail(function (err) {
        assert.ok(false, err.message);
      })
      .done(function (data) {
        assert.notEqual(data.indexOf('user/' + hoodie.id()), -1);
        done();
      });
  });

  test('user db is writable by user', function (done) {
    this.timeout(10000);
    hoodie.account.signUp(newUsername(), 'password')
      .fail(function (err) {
        assert.ok(false, err.message);
      })
      .done(function () {
        hoodie.store.add('example', {title: 'foo'})
          .fail(function (err) {
            assert.ok(false, err.message);
          })
          .done(function (doc) {
            setTimeout(function () {
              $.getJSON('/_api/user%2F' + hoodie.id() + '/example%2F' + doc.id)
                .fail(function (err) {
                  assert.ok(false, JSON.stringify(err));
                })
                .done(function (data) {
                  assert.equal(data.title, 'foo');
                  done();
                });
            }, 3000);
          });
      });
  });

  test('user db is not readable by anonymous users', function (done) {
    this.timeout(10000);
    hoodie.account.signUp(newUsername(), 'password')
      .fail(function (err) {
        assert.ok(false, err.message);
      })
      .done(function () {
        var otherId = hoodie.id();
        hoodie.account.signOut().done(function (doc) {
          $.getJSON('/_api/user%2F' + otherId)
            .fail(function (err) {
              assert.equal(err.status, 401, 'expects unauthorized');
              done();
            })
            .done(function (data) {
              assert.ok(false, 'should be unauthorized');
            });
        });
      });
  });

  test('user db is not readable by other users', function (done) {
    this.timeout(10000);
    var firstId;
    var username = newUsername();
    var otherUsername = newUsername();
    hoodie.account.signUp(username, 'password')
      .then(function () {
        firstId = hoodie.id();
        return hoodie.account.signOut();
      })
      .then(function () {
        return hoodie.account.signUp(otherUsername, 'password');
      })
      .fail(function (err) {
        assert.ok(false, err.message);
      })
      .done(function () {
        assert.equal(hoodie.account.username, otherUsername);
        $.getJSON('/_api/user%2F' + firstId)
          .fail(function (err) {
            assert.equal(err.status, 401, 'expects unauthorized');
            done();
          })
          .done(function (data) {
            assert.ok(false, 'should be unauthorized');
          });
      });
  });

  // test additional databases
  test('additional databases not added on signUp when not configured', function (done) {
    this.timeout(10000);
    hoodie.account.signUp(newUsername(), 'password')
      .then(function () {
        return $.getJSON('/_api/_all_dbs');
      })
      .fail(function (err) {
        assert.ok(false, err.message);
      })
      .done(function (data) {
        assert.equal(data.indexOf('user/' + hoodie.id() + '-photos'), -1);
        done();
      });
  });

  function enableAdditionalDbs(dbs, callback) {
    $.ajax({
      url: '/_api/app/config',
      type: 'GET',
      headers: {
        'Authorization': 'Basic ' + btoa('admin:testing')
      },
      dataType: 'json'
    })
      .fail(function(err) {
        assert.ok(false, err.message);
      })
      .done(function(doc) {
        doc.config.additional_user_dbs = dbs;
        $.ajax({
          url: '/_api/app/config',
          type: 'PUT',
          contentType: 'application/json',
          processData: false,
          data: JSON.stringify(doc),
          headers: {
            'Authorization': 'Basic ' + btoa('admin:testing')
          }
        }).fail(function(err) {
          assert.ok(false, err.message);
        }).done(function() {
          callback();
        });
      });
  }

  test('one additional database added on signUp when configured', function (done) {
    this.timeout(10000);

    enableAdditionalDbs(['photos'], function() {
      hoodie.account.signUp(newUsername(), 'password')
        .then(function () {
          return $.getJSON('/_api/_all_dbs');
        })
        .fail(function (err) {
          assert.ok(false, err.message);
        })
        .done(function (data) {
          assert.notEqual(data.indexOf('user/' + hoodie.id() + '-photos'), -1);
          done();
        });
    });
  });

  test('two additional databases added on signUp when configured', function (done) {
    this.timeout(10000);
    enableAdditionalDbs(['photos', 'horses'], function() {
      hoodie.account.signUp(newUsername(), 'password')
        .then(function () {
          return $.getJSON('/_api/_all_dbs');
        })
        .fail(function (err) {
          assert.ok(false, err.message);
        })
        .done(function (data) {
          assert.notEqual(data.indexOf('user/' + hoodie.id() + '-photos'), -1);
          assert.notEqual(data.indexOf('user/' + hoodie.id() + '-horses'), -1);
          done();
        });
    });
  });

  test('additional db is writable by user', function (done) {
    this.timeout(10000);
    enableAdditionalDbs(['photos'], function() {
      hoodie.account.signUp(newUsername(), 'password')
        .fail(function (err) {
          assert.ok(false, err.message);
        })
        .done(function () {
          setTimeout(function() {
            var db = hoodie.open('user/' + hoodie.id() + '-photos');
            db.add('example', {title: 'foo'})
              .fail(function (err) {
                assert.ok(false, err.message);
              })
              .done(function (doc) {
                setTimeout(function () {
                  var url = '/_api/user%2F' + hoodie.id() + '-photos/' + encodeURIComponent(doc.id);
                  $.getJSON(url)
                    .fail(function (err) {
                      assert.ok(false, JSON.stringify(err));
                    })
                    .done(function (data) {
                      assert.equal(data.title, 'foo');
                      done();
                    });
                }, 3000);
              });
          }, 5000);
        });
    });
  });

  test('additional databases are not readable by other users', function (done) {
    this.timeout(10000);
    var firstId;
    var username = newUsername();
    var otherUsername = newUsername();
    enableAdditionalDbs(['photos', 'horses'], function() {
      hoodie.account.signUp(username, 'password')
        .then(function () {
          firstId = hoodie.id();
          return hoodie.account.signOut();
        })
        .then(function () {
          return hoodie.account.signUp(otherUsername, 'password');
        })
        .fail(function (err) {
          assert.ok(false, err.message);
        })
        .done(function () {
          assert.equal(hoodie.account.username, otherUsername);
          $.getJSON('/_api/user%2F' + firstId + '-photos')
            .fail(function (err) {
              assert.equal(err.status, 401, 'expects unauthorized');
              $.getJSON('/_api/user%2F' + firstId + '-horses')
                .fail(function (err) {
                  assert.equal(err.status, 401, 'expects unauthorized');
                  done();
                })
                .done(function (data) {
                  assert.ok(false, 'should be unauthorized');
                });
            })
            .done(function (data) {
              assert.ok(false, 'should be unauthorized');
            });
        });
    });
  });

  test('additional databases are not readable by anonymous users', function (done) {
    this.timeout(10000);
    enableAdditionalDbs(['photos', 'horses'], function() {
      hoodie.account.signUp(newUsername(), 'password')
        .fail(function (err) {
          assert.ok(false, err.message);
        })
        .done(function () {
          var otherId = hoodie.id();
          hoodie.account.signOut().done(function (doc) {
            $.getJSON('/_api/user%2F' + otherId + '-photos')
              .fail(function (err) {
                assert.equal(err.status, 401, 'expects unauthorized');
                $.getJSON('/_api/user%2F' + otherId + '-horses')
                  .fail(function (err) {
                    assert.equal(err.status, 401, 'expects unauthorized');
                    done();
                  })
                  .done(function (data) {
                    assert.ok(false, 'should be unauthorized');
                  });
              })
              .done(function (data) {
                assert.ok(false, 'should be unauthorized');
              });
          });
        });
    });
  });

});
