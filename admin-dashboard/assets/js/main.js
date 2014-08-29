/*
 * Some portions adapted from https://github.com/hoodiehq/hoodie-plugin-social
 * Other remaining work Copyright 2014 GoAppes
 */
 
$(function () {

    var getConfig = _.partial(couchr.get, '/_api/plugins/'+encodeURIComponent('plugin/hoodie-plugin-oauthio'));
    var setConfig = _.partial(couchr.put, '/_api/plugins/'+encodeURIComponent('plugin/hoodie-plugin-oauthio'));

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
