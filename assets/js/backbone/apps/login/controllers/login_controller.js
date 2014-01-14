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
		model: this.model,
		data: this.data,		      
        message: this.options.message
      }).render();
	 
    },

    search: function () {
      $(".comment-content").midasAutocomplete({
        backboneEvents: true,
        // If we are using backbone here, then a lot of these
        // misc. AJAX options we are passing are unecessary.  So we should somehow
        // manage that in an elegant way.
        backbone: false,
        apiEndpoint: '/api/ac/inline',
        // the query param expects one api endpoint IE:
        // /nested/endpoint?QUERYPARAM=$(".search").val()
        // So it is not something that you can chain params onto.
        // It expects you to send the data back as input data through that query param
        // one character at a time.
        queryParam: 'q',
        type: 'POST',
        contentType: 'json',

        // The plugin will accept any trigger key'd in here, and then
        // use that to start the search process.  if it doesn't exist it will not search.
        trigger: "@",
        searchResultsClass: ".search-result-wrapper",

        success: function (data) {

        }
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
