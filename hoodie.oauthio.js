/**
 * Hoodie plugin template
 * An example plugin, this is where you put your frontend code (if any)
 */

/* global Hoodie */

Hoodie.extend(function (hoodie) {
  'use strict';

  // extend the hoodie.js API
  hoodie.hello = function (name) {
    return hoodie.task.start('hello', {
      name: name
    });
  };

});
