server-pinger
===================

About
---------
Enter the address and monitor your server health status.

How to use it?
----------------
Open the page and insert server URL and name. Servers are stored in browser local storage and their health status is reported periodically according to the checking interval (default 5 seconds). Checking interval can be changed.

How it works?
-----------------
Status checker will try to connect to server by using client side Web Socket technology. However, server does not need to support it as status will be reported anyway.

Why I created it ?
------------------
I created this page for my friend - he wanted to have very simple page to see if its servers are alive.
For me it was an opportunity to have some real hands-on experience with AngularJS.