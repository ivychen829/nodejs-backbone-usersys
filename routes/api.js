var vcard;

exports.create = function(req, res){
	var model = req.app.db.model;

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
	var model = req.app.db.model;

	var vcard = model.find({}, function(err, vcard) {
		res.send({
			users: vcard
		});
		res.end();
	});
};

exports.readByAge = function(req, res){
	var model = req.app.db.model;
	var age = req.params.age;

	var vcard = model.find({ Age: age }, function(err, vcard) {
		res.send({
			users: vcard
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
