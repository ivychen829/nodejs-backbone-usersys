/**
* SETUP
**/
var app = app || {};

/**
* MODELS
**/
app.Users = Backbone.Model.extend({
  url: '/1/user',
  defaults: {
    errors: [],
    errfor: {},
    users: []
  }
});

/**
* VIEWS
**/
app.ListView = Backbone.View.extend({
	el: '#userList',
  template: _.template( $('#tmpl-user-list').html() ),
  events: {
  },
  initialize: function() {
    this.model = new app.Users();
    this.listenTo(this.model, 'sync', this.render);
    this.listenTo(this.model, 'change', this.render);
    this.model.fetch();
  },
  render: function() {
    this.$el.html(this.template( this.model.attributes ));
  },
});

/**
* BOOTUP
**/
$(document).ready(function() {
  app.listView = new app.ListView();
});