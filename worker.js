/**
 * Hoodie plugin template
 * An example plugin worker, this is where you put your backend code (if any)
 */

module.exports = function (hoodie, callback) {
  'use strict';

  // setup task handlers
  hoodie.tasks.on('hello:add', function (db, task) {
    console.log(['GOT TASK', db, task]);
    task.msg = 'Hello, ' + task.name;
    hoodie.task.success(db, task);
  });

  // plugin initialization complete
  console.log(['INIT DONE']);
  callback();

};
