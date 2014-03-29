module.exports = function (/* hoodie */) {

  return {
    'server.api.plugin-request': function (/* request, reply */) {
      // console.log('debug hook called');

      // Use `hoodie` like you would in worker.js to access the
      // main data store

      // return true
    }
  };
};
