var async = require('async');
var ExtendedDatabaseAPI = require('hoodie-utils-plugins').ExtendedDatabaseAPI;

module.exports = function (hoodie, dbname, usersDb) {

  /**
   * PubSub _dbname
   */

  var db = new ExtendedDatabaseAPI(hoodie, hoodie.database(dbname));
  /**
   * PubSub dbAdd
   */

  var dbAdd = function (hoodie, callback) {
    hoodie.database.add(dbname, function (err) {
      callback(err);
    });
  };


  var addLookUpByEmail = function (hoodie, callback) {
    var index = {
          map: function (doc) {
            if(doc.email) {
              emit(doc.email, doc._id);
            }
          }
        };

    db.addIndex('by_email', index, function (err, data) {
      if (err) {
        return callback(err);
      }

      return callback();
    })
  };

  async.series([
    async.apply(dbAdd, hoodie),
    async.apply(addLookUpByEmail, hoodie),
  ],
  function (err) {
    if (err) {
      console.error(
        'setup db error() error:\n' + (err.stack || err.message || err.toString())
      );
    }
  });

  return db;
};
