hoodie-plugin-oathio
====================

```javascript
return hoodie.account.getStateToken()
  .then(function (dataTask) {
    console.log('user name ', hoodie.account.username);
    console.log('getStateToken', dataTask);
    return auth.getProvider(providerName, dataTask.stateToken);
  })
  .then(function (dataProvider) {
    console.log('user name ', hoodie.account.username);
    console.log('getProvider', dataProvider);
    return hoodie.account.signInOauth(providerName, dataProvider.code);
  })
  .then(function (dataOauth) {
    console.log('user name ', hoodie.account.username);
    console.log('signInOauth', dataOauth);              
    return (!dataOauth.me) ? 
            dataOauth.profile : 
            dataOauth.me();
  })
  .then(function (dataProfile) {
    console.log('user name ', hoodie.account.username);
    console.log('profile', dataProfile);              
    login = dataProfile.email;
    pass = dataProfile.password;
    return (!hoodie.account.username && hoodie.account.hasAnonymousAccount()) ?
      hoodie.account.destroy() :          
      hoodie.account.signUp(login, pass);          
  })
  .then(function (dataChangeUsername) {
    console.log('user name ', hoodie.account.username);
    console.log('changeUsername', dataChangeUsername);              
    return hoodie.account.signUp(login, pass);
  })
  .then(function (dataSignUp) {
    console.log('user name ', hoodie.account.username);
    console.log('signUp', dataSignUp);              
    return hoodie.account.signIn(login, pass);
  })        
  .then(okFn)
  .catch(function (err) {
    if (err.status === 409) { //conflict
      hoodie.account.signIn(login, pass)
        .then(okFn)
        .catch(errFn);
    } else {
      okFn.apply(this, [err]);    
    }
  });
```
