define([
  'jquery',
  'underscore',
  'backbone',
  'i18n',
  'utilities',
  'text!about_template'
], function ($, _, Backbone, i18n, utils, AboutTemplate) {

  var AboutView = Backbone.View.extend({

    events: {
      'click .login'	: 'goLogin'
    },

    initialize: function(options) {
      this.options = options;
    },

    render: function () {
      var self = this;
      var options = {
        user: window.cache.currentUser
      };
      var compiledTemplate = _.template(AboutTemplate, options);
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
