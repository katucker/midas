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
  'profile_model',
  'text!alert_template',
  'autocomplete',
  'tag_show_view'
], function ($, _, Backbone, Bootstrap, utils, BaseController, LoginView, Login, ModalComponent, RegistrationView, ProfileModel, AlertTemplate, autocomplete, TagShowView) {

  Application.Login = BaseController.extend({
    model: null,
    events: {
      "click .login-register"    : "showRegister",
	  "keyup .comment-content"          : "search"
    },

    initialize: function ( options ) {
      var self = this;
      this.options = options;
      this.initializeView();
	  this.initializeTags();
	  this.initializeSelect2();
    },

    showRegister: function (e) {
      if (e.preventDefault) e.preventDefault();

      if (this.loginView) this.loginView.cleanup();
      if (this.modalComponent) this.modalComponent.cleanup();
	  this.initializeTags();
	  this.initializeSelect2();

      this.modalComponent = new ModalComponent({
        el: "#container",
        id: "login-register",
        modalTitle: "Register",
		model: this.model,
		data: this.data
      }).render();

      this.loginView = new RegistrationView({
        el: ".modal-template",
		model: this.model,
		data: this.data,		      
        message: this.options.message
      }).render();
	 
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
	
    initializeTags: function() {
      if (this.tagView) { this.tagView.cleanup(); }
      this.tagView = new TagShowView({
        model: this.model,
        el: '.tag-wrapper',
        target: 'profile',
        edit: this.edit,
        url: '/api/tag/findAllByUserId/'
      });
      this.tagView.render();
    },
	
    initializeSelect2: function () {
      var self = this;
      var formatResult = function (object, container, query) {
        return object.name;
      };

      var modelJson = this.model.toJSON();
      $("#company").select2({
        placeholder: 'Select an Agency',
        formatResult: formatResult,
        formatSelection: formatResult,
        minimumInputLength: 2,
        ajax: {
          url: '/api/ac/tag',
          dataType: 'json',
          data: function (term) {
            return {
              type: 'agency',
              q: term
            };
          },
          results: function (data) {
            return { results: data };
          }
        }
      });
      if (modelJson.agency) {
        $("#company").select2('data', modelJson.agency.tag);
      }
      $("#company").on('change', function (e) {
        self.model.trigger("profile:input:changed", e);
      });
      $("#location").select2({
        placeholder: 'Select a Location',
        formatResult: formatResult,
        formatSelection: formatResult,
        minimumInputLength: 1,
        data: [ location ],
        ajax: {
          url: '/api/ac/tag',
          dataType: 'json',
          data: function (term) {
            return {
              type: 'location',
              q: term
            };
          },
          results: function (data) {
            return { results: data };
          }
        }
      });
      if (modelJson.location) {
        $("#location").select2('data', modelJson.location.tag);
      }
      $("#location").on('change', function (e) {
        self.model.trigger("profile:input:changed", e);
      });
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
