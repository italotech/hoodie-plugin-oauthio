//window = require('webpage');


suite('signup oauthio', function () {

  setup(function (done) {
    // values = require('./init_tests')();

    // OAuth.debug = true;
    // phantomjs seems to keep session data between runs,
    // so clear before running tests
    localStorage.clear();
    hoodie.account.signOut().done(function () {
      // log in as admin
      $.ajax({
        type: 'POST',
        url: '/_api/_session',
        contentType: 'application/json',
        data: JSON.stringify({name: 'admin', password: 'testing'}, null, 4),
        processData: false
      })
      .fail(function (err) {
        assert.ok(false, err.message);
      })
      .done(function () {

        $.getJSON('/_api/plugins/plugin%2Fhoodie-plugin-oauthio')
          .fail(function (err) {
            assert.ok(false, err.message);
          })
          .done(function (doc) {
            doc.config.oauthio_config.enabled = true;
            doc.config.oauthio_config.settings = {
                "url": "http://golearn-oauth-io-dev.herokuapp.com",
                "publicKey": "ASh-VUngcZ_eybmcEXjLgXGA_Do",
                "secretKey": "KcC6EP0GnJ0B9eDEck2kUdm1FMg"
            }
            $.ajax({
                url: '/_api/plugins/plugin%2Fhoodie-plugin-oauthio',
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
                done();
              });
          })
      });
    });
  });

  test('signInWith', function (done) {
    this.timeout(10000);
    hoodie.account.oauthio.signInWith('facebook')
      .fail(function (err) {
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


});
