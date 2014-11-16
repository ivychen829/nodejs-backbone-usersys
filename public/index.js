/**
* SETUP
**/
var app = app || {};

/**
* MODELS
**/
app.Users = Backbone.Model.extend({
  url: function() {
    return '/1/user';
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
    'click #btn-filter': 'click',
    'click [data-tag=user]': 'listUser'
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
  el: '#userInfo',
  template: _.template( $('#tmpl-user-info').html() ),
  events: {
    'click .btn-edit': 'edit',
    'click .btn-save': 'save'
  },
  initialize: function() {
    var self = this;

    this.model = new app.UserInfo();
    this.listenTo(this.model, 'sync', this.render);
    this.listenTo(this.model, 'change', this.render);
  },
  render: function() {
    this.$el.html(this.template( this.model.attributes ));
  },
  edit: function() {
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

/**
* BOOTUP
**/
$(document).ready(function() {
  app.listView = new app.ListView();
  app.userView = new app.UserView();
});