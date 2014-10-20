hoodie-plugin-oauthio
====================

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
