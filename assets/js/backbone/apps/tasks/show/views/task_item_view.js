define([
  'jquery',
  'bootstrap',
  'underscore',
  'backbone',
  'utilities',
  'json!ui_config',
  'async',
  'marked',
  'jquery_timeago',
  'base_view',
  'text!task_show_template'
], function ($, Bootstrap, _, Backbone, utils, UIConfig, async, marked, TimeAgo, BaseView, TaskShowTemplate) {

  var TaskItemView = BaseView.extend({

    initialize: function (options) {
      var self = this;
      this.options = options;
      this.model.trigger("task:model:fetch", options.id);
      this.listenTo(this.model, "task:model:fetch:success", function (model) {
        self.model = model;
        self.initializeTags(self);
      });
    },

    getTagData: function (self, cb) {
      $.ajax({
        url: '/api/tag/findAllByTaskId/' + self.options.id,
        async: false,
        success: function (data) {
          self.tags = [];
          for (var i = 0; i < data.length; i += 1) {
            self.tags.push(data[i]);
          }
          // Build object for render
          self.data = {
            user: window.cache.currentUser,
            model: self.model.toJSON(),
            tags: self.tags
          };
          self.data['madlibTags'] = organizeTags(self.tags);
          // convert description from markdown to html
          self.data.model.descriptionHtml = marked(self.data.model.description);
          self.model.trigger('task:tag:data', self.tags, self.data['madlibTags']);
          return cb();
        }
      });

    },

    render: function (self) {
      self.getTagData(self, function () {
        self.data.ui = UIConfig;
        var compiledTemplate = _.template(TaskShowTemplate, self.data);
        self.$el.html(compiledTemplate);
        $("time.timeago").timeago();
        self.updateTaskEmail();
        self.model.trigger('task:show:render:done');
      });
    },

    updateTaskEmail: function() {
      var self = this;
      var subject = $.t('share.subject', 'Check Out') + ' "' + self.model.attributes.title + '"';
      $.ajax({
        url: '/api/email/makeURL?email=contactUserAboutTask' +
        '&subject=' + subject +
        '&opportunityTitle=' + self.model.attributes.title +
        '&opportunityLink=' + window.location.protocol + "//" + window.location.host + "" + window.location.pathname +
        '&opportunityDescription=' + (self.model.attributes.description || '') +
        '&opportunityMadlibTags=' + JSON.stringify(self.data['madlibTags']),
        type: 'GET'
      }).done( function (data) {
        self.$('#email').attr('href', data);
      });

    },

    initializeTags: function (self) {
      var types = ["task-skills-required", "task-time-required", "task-people", "task-length", "task-time-estimate"];

      self.tagSources = {};

      var requestAllTagsByType = function (type, cb) {
        $.ajax({
          url: '/api/ac/tag?type=' + type + '&list',
          type: 'GET',
          async: false,
          success: function (data) {
            // Dynamically create an associative
            // array based on that for the pointer to the list itself to be iterated through
            // on the front-end.
            self.tagSources[type] = data;
            return cb();
          }
        });
      }

      async.each(types, requestAllTagsByType, function (err) {
        self.model.trigger('task:tag:types', self.tagSources);
        self.render(self);
      });
    },

    cleanup: function() {
      removeView(this);
    }
  });

  return TaskItemView;
});
