// 
// WINDOW.DEBUG
// Simple, easy and safe console.log wrapper with *line-numbers (*in chrome dev tools)
//  
(function(a){if(a.console){var b;a.oldConsole=a.console;b=function(){var c;try{throw Error();}catch(b){c=b.stack.substr(b.stack.indexOf("console.log")).split(/(\r\n|\n|\r)/gm)[2].trim().split(" "),a.oldConsole.log("%c >> "+c[c.length-1],"color: red;")}return""};a.console={log:function(){a.oldConsole.log(Array.prototype.slice.call(arguments),b())}};a.debug=a.console.log}else a.console={log:function(){}},a.debug=function(){}})(window);