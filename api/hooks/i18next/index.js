module.exports = function (sails) {

  /**
   * Sails hook to add i18next functionality on the
   * server side, matching the i18next-client module
   * on the client side.
   */

  /**
   * Module dependencies.
   */

  var _ = require('lodash'),
      Hook = require('sails/lib/index'),
      i18next = require('i18next');


  /**
   * Expose hook definition
   */

  return {

    // Default options for server side only.
    // May be overridden in config/settings/i18next.js
    defaults : {
      i18next : {
        resGetPath : '/assets/locales/__lng__/__ns__.json'
      }
    },

    routes: {

      before: {

        //Make the i18next module available to all response objects.
        '/*': i18next.handle,

        //Capture the keys and default text for missing keys POSTed
        //from the client. Route is hard-coded to simplify configuration.
        //This should be sufficient since we only want to use this
        //capability during development to easily seed the translation
        //files with more keys.
        'post /locales/add/:lng/:ns' : function(req,res,next) {
          //Only save keys if running in the development environment.
          if (process.env.NODE_ENV == 'development') {

            var lng = req.param('lng');
            var ns = req.param('ns');

            sails.log("Adding to language ", lng, " namespace ", ns);
            for (var key in req.body) {
              sails.log("Adding key '", key, "' value: ", req.body[key]);
              i18next.sync.postMissing(lng, ns, key, req.body[key]);
            }

            res.send('ok');
          }
          return next();
        }
      }
    },

    initialize: function (cb) {

      var initOptions = {};

      // Only include options that are explicitly set.
      if (i18next in sails.config) {
        if (config in sails.config.i18next) {
          if (cookieDomain in sails.config.i18next.config) {
            initOptions.cookieDomain = sails.config.i18next.config.cookieDomain;
          }
          if (cookieName in sails.config.i18next.config) {
            initOptions.cookieName = sails.config.i18next.config.cookieName;
          }
          if (dynamicLoad in sails.config.i18next.config) {
            initOptions.dynamicLoad = sails.config.i18next.config.dynamicLoad;
          }
          if (fallbackLng in sails.config.i18next.config) {
            initOptions.fallbackLng = sails.config.i18next.config.fallbackLng;
          }
          if (lng in sails.config.i18next.config) {
            initOptions.lng = sails.config.i18next.config.lng;
          }
          if (load in sails.config.i18next.config) {
            initOptions.load = sails.config.i18next.config.load;
          }
          if (ns in sails.config.i18next.config) {
            initOptions.ns = sails.config.i18next.config.ns;
          }
          if (useCookie in sails.config.i18next.config) {
            initOptions.useCookie = sails.config.i18next.config.useCookie;
          }
        }
        if (debug in sails.config.i18next) {
          initOptions.debug = sails.config.i18next.debug;
        }
        if (detectLngFromHeaders in sails.config.i18next) {
          initOptions.detectLngFromHeaders =
            sails.config.i18next.detectLngFromHeaders;
        }
        if (detectLngFromPath in sails.config.i18next) {
          initOptions.detectLngFromPath =
            sails.config.i18next.detectLngFromPath;
        }
        if (detectLngQS in sails.config.i18next.config) {
          initOptions.detectLngQS = sails.config.i18next.config.detectLngQS;
        }
        if (resGetPath in sails.config.i18next) {
          // Assume the absolute path is compiled from the application path
          // and the path specified in the settings for the server side.
          // Note: This path is typically derived from the resGetPath
          // specified for the client, since that path is relative to the
          // home URL for the application.
          // To Do: Check for existence of the file at the specified path,
          // falling back to a relative path if needed.
          initOptions.resGetPath =
            sails.config.appPath + sails.config.i18next.resGetPath;
        }
        if (saveMissing in sails.config.i18next) {
          initOptions.saveMissing = sails.config.i18next.saveMissing;
        }
        if (supportedLngs in sails.config.i18next) {
          initOptions.supportedLngs = sails.config.i18next.supportedLngs;
        }
      }

      //Force the path for storing missing keys, only if we're
      //running in the development environment.
      if (process.env.NODE_ENV == 'development') {
        initOptions.resSetPath = sails.config.appPath +
          '/assets/locales/add/__lng__/__ns__.json';
      }
      i18next.init(initOptions);

      return cb();
    }

  };
};
