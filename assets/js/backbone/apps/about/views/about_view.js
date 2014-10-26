define([
  'jquery',
  'underscore',
  'backbone',
  'i18n',
  'json!ui_config',
  'utilities',
  'text!about_template'
], function ($, _, Backbone, i18n, UIConfig, utils, AboutTemplate) {

  var AboutView = Backbone.View.extend({

    events: {
      'click .login'	: 'goLogin'
    },

    initialize: function(options) {
      this.options = options;
    },

    render: function () {
      var self = this;
      var data = {
        user: window.cache.currentUser
      };
      data.ui = UIConfig;
      var compiledTemplate = _.template(AboutTemplate, data);
      this.$el.html(compiledTemplate);
      this.$el.i18n();
    },

    goLogin: function (e) {
      if (e.preventDefault) e.preventDefault();
      window.cache.userEvents.trigger("user:request:login",'');
    },

    cleanup: function () {	  
      removeView(this);
	  this.$el.html();
    }

  });

  return AboutView;
});
