#!/usr/bin/env node

var request = require('couchr');
var url = "http://admin:\"testing\"@localhost:6009/plugins/"
request.get(url+"plugin%2Fhoodie-plugin-oauthio", function (err, doc) {
  if (err) console.log(err);
  doc.config.oauthio_config.enabled = true;
  doc.config.oauthio_config.settings = {
      "url": "http://golearn-oauth-io-dev.herokuapp.com",
      "publicKey": "Cd0l_UHQndc-_tZwgA54k1z1Zb4",
      "secretKey": "Re7HgSu9SdBGPpe7_vWAJe3Nhbs"
  }
  request.put(url+"plugin%2Fhoodie-plugin-oauthio?rev="+doc._rev, doc, function (err2, doc2) {
    if (err2) console.log(err2);
    console.log('oauthio ok')
  })
})

