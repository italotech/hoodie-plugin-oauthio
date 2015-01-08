var removeUsers = function (u, done) {
  hoodie.account.signIn(u.username, u.password)
    .then(function() {
      hoodie.account.destroy()
        .always(function () {
            done();
        })
    })
    .fail(function () {
      done();
    })
}

var addUser = function (u, done) {
  hoodie.account.signUp(u.username, u.password)
    .always(function () {
      // signOut current user
      localStorage.clear();
      hoodie.account.signOut()
        .always(function () {
          done();
        });
    });
};

var loadUsers = function (done) {
  var users = window.fixtures['users'];

  localStorage.clear();
  hoodie.account.signOut()
    .always(function () {
      async.series([
        //async.apply(async.eachSeries, users, removeUsers),
        async.apply(async.eachSeries, users, addUser),
      ], done)
    });
};

var signinUser = function (user, pass, done) {
  hoodie.account.signOut()
    .always(function () {
      hoodie.account.signIn(user, pass)
        .always(done);
    });
};

