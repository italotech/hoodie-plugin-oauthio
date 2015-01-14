window.debug
=====

Simple, easy and safe console.log wrapper with *line-numbers (*in chrome dev tools).


Usage
=====

Just use debug() instead of console.log()


How does it work?
=====

First it will wrap a console.log if the console object exists, then it will throw an Error to get the line-number since the wrapped console.log will always show its line-number in the console.
If there is no console object it will silently degrade and will not throw any error. ( For oldIE testing etc )
Read the comments in the code to find more information.

**Please DO NOT use this wrapper in a production environment since it is not performance focused**
