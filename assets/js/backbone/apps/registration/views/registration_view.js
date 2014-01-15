define([
  'jquery',
  'underscore',
  'backbone',
  'utilities',
  'text!registration_template',
  'modal_component',
  'async',
  'tag_show_view',
  'profile_model',
], function ($, _, Backbone, utils, RegistrationTemplate, ModalComponent, async, TagShowView, ProfileModel) {

  var RegistrationView = Backbone.View.extend({

    events: {
      'submit #registration-form'    : 'submit',
	  'click #agree-checkbox'	: 'activate'
    },

    initialize: function (options) {
      this.options = options;
	  this.model = new ProfileModel();
    },

    render: function () {
      var template = _.template(RegistrationTemplate);
      this.$el.html(template);
	  this.initializeSelect2();
	  this.initializeTags();
      return this;
    },
	
    initializeSelect2: function () {
      var self = this;
      var formatResult = function (object, container, query) {
        return object.name;
      };

      var modelJson = this.model.toJSON();
      $("#company").select2({
        placeholder: 'Select an OpDiv',
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
        placeholder: 'Enter State, Country',
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
	
    initializeTags: function() {
      if (this.tagView) { this.tagView.cleanup(); }
      this.tagView = new TagShowView({
        model: this.model,
        el: '.tag-wrapper',
        target: '',
        edit: this.edit,
        url: '/api/tag/findAllByUserId/'
      });
      this.tagView.render();
    },
	
	activate: function() {
	  $("#register-button").removeAttr("disabled");
	  $("#register-button").removeAttr("style");
	  
	},

    submit: function (e) {
      var self = this;
      if (e.preventDefault) e.preventDefault();
      var data = {
        username: this.$("#username").val(),
        password: this.$("#password").val(),
        name: this.$("#name").val(),
        agency: this.$("#agency").val(),
        location: this.$("#location").val(),
        json: true
      };
      $.ajax({
        url: '/api/auth/local',
        type: 'POST',
        data: data
      }).done(function (success) {				 
        // Set the user object and trigger the user login event
        window.cache.currentUser = success;
        window.cache.userEvents.trigger("user:login", success);
      }).fail(function (error) {
        var d = JSON.parse(error.responseText);
        self.$("#registration-error").html(d.message);
        self.$("#registration-error").show();
      });
	  Backbone.history.navigate('profile/edit', { trigger: true });
      this.options = options;
      this.data = options.data;
      this.edit = true;
      if (this.data.saved) {
        this.saved = true;
        this.data.saved = false;
      }
	  initialize.profileEdit();
	  initialize.profileSave();
	  initialize.profileSubmit(data);  	  
	  Backbone.history.navigate('profile/', { trigger: true }); 
    },
	
    profileEdit: function (e) {
      e.preventDefault();
      Backbone.history.navigate('profile/edit', { trigger: true });
    },

    profileSave: function (e) {
      e.preventDefault();
      $("#profile-form").submit();
    },

    profileSubmit: function (e) {
      e.preventDefault();
      if (!$("#username-button").hasClass('btn-success')) {
        alert("Please pick a valid username.");
        return;
      }
      $("#profile-save, #submit").button('loading');
      setTimeout(function() { $("#profile-save, #submit").attr("disabled", "disabled") }, 0);
      // var data = {
      //   name: $("#name").val(),
      //   username: $("#username").val(),
      //   title: $("#title").val(),
      //   bio: $("#bio").val()
      // };
      this.model.trigger("profile:save", data);
    },

    cleanup: function () {
      removeView(this);
    },
  });

  return RegistrationView;
});
