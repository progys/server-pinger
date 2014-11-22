server-pinger
===================

About
---------
Chrome plugin for server monitoring. Enter the address and monitor your server health status.

How to use it?
----------------
Install chrome plugin, open the app and insert server URL and name. Servers are stored in chrome storage and their health status is reported periodically according to the checking interval (default 5 seconds). Checking interval can be changed as well as notification option. Server list can be synchronized between different chrome browsers.

How it works?
-----------------
Status checker will try to connect to server by using client side Web Socket technology. However, server does not need to support it as status will be reported anyway.

Why I created it ?
------------------
I created this plugin for my friend. He wanted to have simple way to check if his servers are alive.
For me it was an opportunity to have some real hands-on experience with AngularJS.

Technologies used
------------------
 AngularJS - all the app logic.
 Bootstrap - UI style.
 Angular-xeditable - inline editing functionality.
 WebSocket - pinging the server.
 Chrome App API - notifications and storage.