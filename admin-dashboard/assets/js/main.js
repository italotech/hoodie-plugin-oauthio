/*
 * Some portions adapted from https://github.com/hoodiehq/hoodie-plugin-social
 * Other remaining work Copyright 2014 GoAppes
 */

$(function () {

    var hoodieAdmin = top.hoodieAdmin;

    function getConfig(callback) {
      hoodieAdmin.request('GET', '/plugins/'+encodeURIComponent('plugin/hoodie-plugin-oauthio'))
        .fail(function(error) { callback(error); })
        .done(function(response) { callback(null, response); })
    }
    function setConfig(doc, callback) {
      hoodieAdmin.request('PUT', '/plugins/'+encodeURIComponent('plugin/hoodie-plugin-oauthio'), {
        data: JSON.stringify(doc)
      })
        .fail(function(error) { callback(error); })
        .done(function(response) { callback(null, response); })
    }

    function updateConfig(obj, callback) {
        getConfig(function (err, doc) {
            if (err) {
                return callback(err);
            }
            doc.config = _.extend(doc.config, obj);
            setConfig(doc, callback);
        });
    }


    // set initial form values
    getConfig(function (err, doc) {
        if (err) {
          console.log(err)
            return alert(err);
        }

        //set oauthio values
        $('[name=oauthioEnabledSelect]').find("option[value='" + doc.config.oauthio_config.enabled + "']").attr("selected","selected").change();
        $('[name=oauthioUrl]').val(doc.config.oauthio_config.settings.url);
        $('[name=oauthioPublicKey]').val(doc.config.oauthio_config.settings.publicKey);
        $('[name=oauthioSecretKey]').val(doc.config.oauthio_config.settings.secretKey);

    });

    //listen for submit button
    $('#submitBtn').on('click', function() {
        $('form').first().submit();
    });

    // save config on submit
    $('.form-horizontal').submit(function (ev) {
        ev.preventDefault();
        var cfg = {
           oauthio_config: {
               enabled: ($('[name=oauthioEnabledSelect]').val() === 'true'),
               settings: {
               		url: $('[name=oauthioUrl]').val(),
                   	publicKey: $('[name=oauthioPublicKey]').val(),
                   	secretKey: $('[name=oauthioSecretKey]').val()
               }
           }
        };
        updateConfig(cfg, function (err) {
            if (err) {
            	console.log(err)
                return alert(err);
            }
            else {
                alert('Config saved');
            }
        });
        return false;
    });

});
