define([
  'jquery',
  'bootstrap',
  'underscore',
  'jquery_iframe',
  'jquery_fileupload',
  'jquery_timeago',
  'backbone',
  'utilities',
  'async',
  'popovers',
  'text!attachment_item_template',
  'text!attachment_show_template'
], function ($, Bootstrap, _, jqIframe, jqFU, TimeAgo, Backbone, utils, async,
  Popovers, AITemplate, ASTemplate) {

  var popovers = new Popovers();

  var AttachmentShowView = Backbone.View.extend({

    events: {
      'click .file-delete'                : 'deleteAttachment',
      "mouseenter .project-people-div"    : popovers.popoverPeopleOn,
      "click .project-people-div"         : popovers.popoverClick,
    },

    initialize: function (options) {
      this.options = options;
      this.data = options.data;
      this.action = options.action;
      this.edit = false;
      if (this.options.action) {
        if (this.options.action == 'edit') {
          this.edit = true;
        }
      }
    },

    initializeFiles: function () {
      var self = this;
      $.ajax({
        url: '/api/attachment/findAllBy' + this.options.target + 'Id/' + this.options.id
      }).done(function (data) {
        if (data && (data.length > 0)) {
          $(".attachment-none").hide();
        }
        _.each(data, function (f) {
          var template = self.renderAttachment(f);
          $(".attachment-tbody").append(template);
        });
        $("time.timeago").timeago();
        popovers.popoverPeopleInit(".project-people-div");
      });
    },

    initializeFileUpload: function () {
      var self = this;


      $('#attachment-fileupload').fileupload({
        url: "/api/file/create",
        dataType: 'text',
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
        add: function (e, data) {
          self.$('.attachment-fileupload > .progress').show();
          data.submit();
        },
        progressall: function (e, data) {
          var progress = parseInt(data.loaded / data.total * 100, 10);
          self.$('.attachment-fileupload .progress-bar').css(
            'width',
            progress + '%'
          );
        },
        done: function (e, data) {
          // for IE8/9 that use iframe
          if (data.dataType == 'iframe text') {
            var result = JSON.parse(data.result);
          }
          // for modern XHR browsers
          else {
            var result = JSON.parse($(data.result).text());
          }

          // store id in the database with the file
          var aData = {
            fileId: result[0].id
          };
          aData[self.options.target + 'Id'] = self.options.id;
          $.ajax({
            url: '/api/attachment',
            type: 'POST',
            data: JSON.stringify(aData),
            dataType: 'json',
            contentType: 'application/json'
          }).done(function (attachment) {
            self.$('.attachment-fileupload > .progress').hide();
            self.renderNewAttachment(result[0], attachment);
          });
        },
        fail: function (e, data) {
          // notify the user that the upload failed
          var message = data.errorThrown;
          self.$('.attachment-fileupload > .progress').hide();
          if (data.jqXHR.status == 413) {
            message = "The uploaded file exceeds the maximum file size.";
          }
          self.$(".file-upload-alert > span").html(message)
          self.$(".file-upload-alert").show();
        }
      });

    },

    render: function () {
      data = {
        user: window.cache.currentUser
      };
      var template = _.template(ASTemplate, data);
      this.$el.html(template);
      this.initializeFileUpload();
      this.initializeFiles();
      return this;
    },

    renderAttachment: function (attachment) {
      var data = {
        a: attachment,
        user: window.cache.currentUser,
        owner: this.options.owner
      };
      var templ = _.template(AITemplate, data);
      return templ;
    },

    renderNewAttachment: function (file, attachment) {
      attachment.file = file;
      var templ = this.renderAttachment(attachment);
      $(".attachment-none").hide();
      // put new at the top of the list rather than the bottom
      $(".attachment-tbody").prepend(templ);
      $("time.timeago").timeago();
      popovers.popoverPeopleInit(".project-people-div");
    },

    deleteAttachment: function (e) {
      if (e.preventDefault) { e.preventDefault(); }
      $.ajax({
        url: '/api/attachment/' + $(e.currentTarget).data('id'),
        type: 'DELETE',
        success: function (d) {
          // remove from the DOM
          var len = $($(e.currentTarget).parents('tbody')[0]).children().length;
          $(e.currentTarget).parents('tr')[0].remove();
          if (len == 2) {
            $(".attachment-none").show();
          }
        }
      });
    },

    cleanup: function () {
      removeView(this);
    }

  });

  return AttachmentShowView;

});
