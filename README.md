hoodie-plugin-oauthio
====================

install https://oauth.io/docs/oauthd

configure the admin area of the plugin and

```javascript
  var provider = 'facebook';
  hoodie.account.oauthio.signInWith(provider)
      .then(function () {
        console.log('signInWith: ok', arguments);
        //$ionicLoading.hide();
      })
      .fail(function () {
        //$ionicLoading.hide();
        console.log('signInWith: err', arguments);
      });
  
```

in html add the oauth lib
```
    <script src="lib/hoodie/dist/hoodie.js"></script>
    <script src="lib/oauth-js/dist/oauth.js"></script>
    <script src="lib/hoodie-plugin-oauthio/hoodie.oauthio.js"></script>
```    
