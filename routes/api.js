var vcard;

exports.create = function(req, res){
	var model = req.app.db.model.User;

	var person = {
		nickname: req.query.nickname,
		name: req.query.tel,
		tel: req.query.name
	};

	var card = new model(person);
	card.save();

	res.end();
};

exports.read = function(req, res){
	var model = req.app.db.model.User;

	var vcard = model.find({}, function(err, vcard) {
		var users = [];

		vcard.forEach(function (user) {
			users.push({
				_id: user._id,
				Name: user.Name,
				Age: user.Age
			});
		});

		res.send({
			users: users
		});

		res.end();
	});
};

exports.readPostById = function(req, res){
	var model = req.app.db.model.Post;

	var vcard = model.find({
		uid: req.params.id
	}, function(err, posts) {
		res.send({
			posts: posts
		});

		res.end();
	});
};

exports.readOneByUserId = function(req, res){
	var model = req.app.db.model.User;
	var id = req.params.id;

	var vcard = model.findOne({_id: id}, function(err, user) {
		res.send({
			user: user
		});
		res.end();
	});
};

exports.updateOneByUserId = function(req, res){
	var model = req.app.db.model.User;
	var id = req.params.id;
	var user = req.body.user;

	model.update({_id: id}, { 
		Name: user.Name,
		Email: user.Email,
		Address: user.Address
	}, function(err, numAffected) {
		res.send({
			numAffected: numAffected
		});
		res.end();
	});
};

exports.readByAge = function(req, res){
	var model = req.app.db.model.User;
	var age = req.params.age;

	//var vcard = model.find({ Age: age }, function(err, vcard) {
	//	res.send({
	//		users: vcard
	//	});
	//	res.end();
	//});

	model.aggregate([
	  { $match: { Age: parseInt(age) } }
	])
	.exec(function(err, users) {
		res.send({
			users: users
		});
		res.end();
	});
};

exports.readByAgeRange = function(req, res){
	var model = req.app.db.model.User;
	var from = parseInt(req.params.from);
	var to = parseInt(req.params.to);

	model.aggregate([
	  { $match: { Age: {$gte: from} } },
	  { $match: { Age: {$lte: to} } }
	])
	.exec(function(err, users) {
		res.send({
			users: users
		});
		res.end();
	});
};

exports.update = function(req, res){
	var nickname = req.params.nickname;

	vcard.forEach(function (entry) {
		if (entry.nickname === nickname) {
			console.log('found!');

			entry.name =  req.query.name;
			entry.tel =  req.query.tel;
		}
	});

	res.end();
};

exports.delete = function(req, res){
	res.end();
};

exports.createPost = function(req, res){
  var model = req.app.db.model.Post;
  var uid = req.body.uid;
  var title = req.body.title;
  var content = req.body.content;
  var outcome = {
    errors: [],
    errfor: {},
    title: title,
    content: content
  };

  if (!title) {
	outcome.errfor.title = '請填寫 Title 欄位';
	outcome.errors.push('Title 是必填欄位');
  } 

  if (!content) {
	outcome.errfor.content = '請填寫 Content 欄位';
	outcome.errors.push('Content 是必填欄位');
  } 

  if (outcome.errors.length > 0)
  	return res.json(outcome);

  var post = {
    uid: uid,
    title: title,
    content: content
  };

  var postDocument = new model(post);
  postDocument.save();

  res.send({status: 'OK'});
};

exports.readPost = function(req, res){
  var model = req.app.db.model.Post;

  model
  	.find({})
  	.populate('uid')
  	.exec(function(err, posts) {
	  	res.send({
	  		posts: posts
	  	});
	  	res.end();
  	});
};

exports.mapByAge = function(req, res) {
  var model = req.app.db.model.User;

  model
	.mapReduce(
		function() { emit( this.Age, this.Name); },
		function(key, values) { 
			return values.toString();
		},
		{
			query: { Age: { $gt: 30 } },
			out: 'map_ages'
		}
    );
};

exports.upload = function(req, res) {

    var type = req.params.type;   // 'photo' or 'voice'
    var ext;

    switch (type) {
        case 'photo':
            ext = '.jpg';
            break;
        case 'voice':
            ext = '.mp3';
            break;
    }

    var filename = req.params.nickname + ext;
    var newPath = path.join(__dirname, '../frontend/uploads', filename);

    req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        var wstream = fs.createWriteStream(newPath);
        file.pipe(wstream);
    });

    req.busboy.on('end', function() {
        res.json({status: 'ok'});
        res.end();
    });
};
