var OauthIoApi = require('./oauthio');
var Db = require('./db');
var _ = require('underscore');
var async = require('async');
var ExtendedDatabaseAPI = require('hoodie-utils-plugins').ExtendedDatabaseAPI;

module.exports = function (hoodie) {
  var oauthio = {};
  var usersDb = new ExtendedDatabaseAPI(hoodie, hoodie.database('_users'));
  var pluginDb = new Db(hoodie, 'plugins/hoodie-plugin-oauthio', usersDb);

  _.extend(oauthio,  new OauthIoApi(hoodie, pluginDb, usersDb));


  return oauthio;
};
