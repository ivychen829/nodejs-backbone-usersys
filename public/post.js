/**
* SETUP
**/
var app = app || {};

/**
* MODELS
**/
app.Posts = Backbone.Model.extend({
  url: function() {
    return '/1/post';
  },
  defaults: {
    errors: [],
    errfor: {},
    posts: []
  }
});

/**
* VIEWS
**/
app.ListView = Backbone.View.extend({
	el: '#postList',
  template: _.template( $('#tmpl-post-list').html() ),
  events: {
  },
  initialize: function() {
    this.model = new app.Posts();
    this.listenTo(this.model, 'sync', this.render);
    this.listenTo(this.model, 'change', this.render);
    this.model.fetch();
  },
  render: function() {
    this.$el.html(this.template( this.model.attributes ));
  }
});

/**
* BOOTUP
**/
$(document).ready(function() {
  app.listView = new app.ListView();
});