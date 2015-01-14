var async = require('async'),
    ExtendedDatabaseAPI = require('hoodie-utils-plugins').ExtendedDatabaseAPI;

module.exports = function (hoodie, dbname) {

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
        if (doc.username) {
          emit(doc.username, doc._id);
        }
      }
    };

    db.addIndex('by_username', index, function (err) {
      if (err) {
        return callback(err);
      }

      return callback();
    });
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
