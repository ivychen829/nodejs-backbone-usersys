/**
* SETUP
**/
var app = app || {};

/**
* MODELS
**/
app.Users = Backbone.Model.extend({
  url: function() {
    return 'http://localhost:3000/1/user';
  },
  defaults: {
    errors: [],
    errfor: {},
    users: []
  }
});

app.UserInfo = Backbone.Model.extend({
  url: function() {
    return '/1/user/' + this.attributes.id;
  },
  id: '',
  defaults: {
    errors: [],
    errfor: {},
    user: {}
  }
});

app.UserCollection = Backbone.Collection.extend({
  model: app.UserInfo
});

/**
* VIEWS
**/
app.ListView = Backbone.View.extend({
  el: '#userList',
  template: _.template( $('#tmpl-user-list').html() ),
  events: {
    'click #btn-filter': 'click'
  },
  initialize: function() {
    var self = this;

    this.model = new app.Users();
    this.collections = new app.UserCollection();

    this.listenTo(this.model, 'sync', this.render);
    this.listenTo(this.model, 'change', this.render);
    this.model.fetch({
      success: function() {
        var users = self.model.get('users');

        users.sort(function (a, b) {
          if (a.Age > b.Age) return 1;
          else if (a.Age < b.Age) return -1;
          return 0;
        });
      }
    });
  },
  render: function() {
    this.$el.html(this.template( this.model.attributes ));

    this.$el.find('[data-tag=user]').each(function () {
      var me = $(this);
      var age = '' + me.data('age');

      me.addClass('age-' + age.slice(0, 1) + '0');
    });
  },
  click: function(e) {
    var me = $(e.target);
    var filter = me.data('filter');

    this.$el.find('[data-tag=user]').each(function () {
      $(this).addClass('hide');
    });

    this.$el.find('.' + filter).each(function () {
      $(this).removeClass('hide');
    });
  },
  listUser: function(e) {
    var id = $(e.target).data('user-id'); 
    var model = app.listView.collections.get(id);

    if (model) return app.userView.model.set('user', model.get('user'));

    model = new app.UserInfo();
    model.set('id', id);
    model.fetch({
      success: function() {
        app.userView.model.set('user', model.get('user'));
        app.listView.collections.push(model);
      }
    });
  }
});

app.UserView = Backbone.View.extend({
  template: _.template( $('#tmpl-user-info').html() ),
  events: {
    'click .btn-edit': 'edit',
    'click .btn-save': 'save'
  },
  initialize: function(id) {
    this.$el = $('<div id=' + id + '></div>');
    this.model = new app.UserInfo();

    this.listenTo(this.model, 'sync', this.render);
    this.listenTo(this.model, 'change', this.render);

    this.model.set('id', id);
    this.model.fetch();
  },
  render: function() {
    this.$el.html(this.template( this.model.attributes ));
    return this;
  },
  edit: function(e) {
    this.$el.find('.non-editable').addClass('hide');
    this.$el.find('.editable').removeClass('hide');
  },
  save: function() {
    this.model.save({
      id: this.$el.find('[name=id]').val(),
      user: {
        Name: this.$el.find('[name=name]').val(),
        Email: this.$el.find('[name=email]').val(),
        Address: this.$el.find('[name=address]').val()
      }
    });
  }
});

app.UserViewPanel = Backbone.View.extend({
  el: '#userInfo',
  views: [],
  initialize: function() {
  },
  renderChild: function(id) {
    var childView = this.views[id];

    // make all children hidden
    this.$el.children().addClass('hide');

    if (!childView) {
      // create a new child view and mount to current element
      this.views[id] = childView = new app.UserView(id);
      return this.$el.append( childView.render().$el );
    }

    this.$el.find('#' + id).removeClass('hide');
  }
});

/*
 * ROUTES
 */
app.UserRoutes = Backbone.Router.extend({
  routes: {
      ":id": "queryByUserId"
  },

  queryByUserId: function(id) {
    app.userViewPanel.renderChild(id);
  }
});

/**
* BOOTUP
**/
$(document).ready(function() {
  app.listView = new app.ListView();
  app.userViewPanel = new app.UserViewPanel();

  app.userRoutes = new app.UserRoutes();
  Backbone.history.start();
});