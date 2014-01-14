define([
  'jquery',
  'underscore',
  'backbone',
  'bootstrap',
  'utilities',
  'base_controller',
  'login_view',
  'login_config',
  'modal_component',
  'registration_view',
  'profile_model'
], function ($, _, Backbone, Bootstrap, utils, BaseController, LoginView, Login, ModalComponent, RegistrationView, ProfileModel) {

  Application.Login = BaseController.extend({

    events: {
      "click .login-register"    : "showRegister"
    },

    initialize: function ( options ) {
      var self = this;
      this.options = options;
      this.initializeView();
    },

    initializeView: function () {
      var self = this;
      if (this.loginView) {
        this.loginView.cleanup();
        this.modalComponent.cleanup();
      }

      this.modalComponent = new ModalComponent({
        el: this.el,
        id: "login",
        modalTitle: "Login or Register"
      }).render();

      this.loginView = new LoginView({
        el: ".modal-template",
        login: Login,
        message: this.options.message
      }).render();
      $("#login").modal('show');

      self.listenTo(window.cache.userEvents, "user:login", function (user) {
        // hide the modal
        self.stopListening(window.cache.userEvents);
        // window.cache.userEvents.stopListening();
        $('#login').bind('hidden.bs.modal', function() {
          // reload the page after login
          Backbone.history.loadUrl();
          window.cache.userEvents.trigger("user:login:success", user);
          self.cleanup();
        }).modal('hide');
      });
    },


    showRegister: function (e) {
      if (e.preventDefault) e.preventDefault();

      if (this.loginView) this.loginView.cleanup();
      if (this.modalComponent) this.modalComponent.cleanup();

      this.modalComponent = new ModalComponent({
        el: "#container",
        id: "login-register",
        modalTitle: "Register"
      }).render();

      this.loginView = new RegistrationView({
        el: ".modal-template",
        message: this.options.message
      }).render();
	  this.initializeProfileModelInstance();

    },

    initializeProfileModelInstance: function () {
      var self = this;

      if (this.model) this.model.remove();
      this.model = new ProfileModel();
        var modelJson = this.model.toJSON();
        for (i in modelJson.tags) {
          if (modelJson.tags[i].tag.type == 'agency') {
            self.model.agency = modelJson.tags[i].tag;
            self.model.agency['tagId'] = modelJson.tags[i].id;
          }
          else if (modelJson.tags[i].tag.type == 'location') {
            self.model.location = modelJson.tags[i].tag;
            self.model.location['tagId'] = modelJson.tags[i].id;
          }
        }
    },

    // ---------------------
    //= UTILITY METHODS
    // ---------------------
    cleanup: function() {
      // don't do anything
      if (this.loginView) { this.loginView.cleanup(); }
      if (this.modalComponent) { this.modalComponent.cleanup(); }
      removeView(this);
    }

  });

  return Application.Login;
})
