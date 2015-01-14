// 
// WINDOW.DEBUG
// Simple, easy and safe console.log wrapper with *line-numbers (*in chrome dev tools)
//  
(function ( window, undefined ) {
	'use strict';
	//If console object exists: webkit browsers, firebug, etc.
	if ( window.console ) {

		var lineNumber;
		//Store the current console object to use it later.
		window.oldConsole = window.console;

		//Log the line number throwing an Error and parsing the result.
		lineNumber = function () {
			var lines;
			try {
				throw new Error();
			} catch(e) {
				lines = e.stack.substr( e.stack.indexOf( 'console.log' ) ).split( /(\r\n|\n|\r)/gm )[2].trim().split(' ');
				window.oldConsole.log( '%c >> ' + lines[ lines.length - 1 ] , 'color: red;' );
			}
			return '';
		};

		//Override the console object.
		window.console = {
			log: function () {
				window.oldConsole.log( Array.prototype.slice.call(arguments), lineNumber() );
			}
		};

		//Create a very short alias with all the functionality.
		window.debug = window.console.log;

	} else { //If console object does not exist.

		//Degrade console object ( or write your own fallback code )
		window.console = { log: function() {} };
		window.debug = function () {return;};
	}

})( window );