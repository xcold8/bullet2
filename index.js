var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var models = require('./models');
var Task = models.Task;
var User = models.User;
var Comm = models.Comm;
var express = require('express');
var session = require('express-session');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'nveurvdcr1',
  resave: true,
  saveUninitialized: true,
  cookie: { 
  			maxAge: 30 * 24 * 60 * 60 * 1000
  }
}));
app.use(express.static(path.join(__dirname, 'public')));
var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ email: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
      	console.log('Incorrect username');
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (password !== user.password) {
      	console.log('Incorrect password');
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

require('handlebars');
app.use(passport.initialize());
app.use(passport.session());
app.listen(3000, function (){
	console.log('Listening on port 3000');
});

function checkPermission(access_level,logged_user,task_assignees){
	if (access_level === 'assignee'){
		var i;
		var uid_string = logged_user._id.toString();
		var assigned_string = task_assignees[0]._id.toString();
		for (i=0;i < task_assignees.length; i++){
			if (uid_string == assigned_string){
				return true;
			}
				return false;
			}
		return false;
	} 
	else if (access_level === 'creator') {
		var k;
		var c_uid_string = logged_user._id.toString();
		var creator_string = task_assignees[0]._id;
		for (k=0;k < task_assignees.length; k++){
			if (c_uid_string == creator_string){
				return true;
			}
				return false;
			}
			return false;
	}

}

app.get('/', function(req,res){
	res.redirect('/tasks');
});
app.get('/login', function(req,res){
	if (req.isAuthenticated()){
		res.redirect('/tasks');
	} else {
		res.sendFile(__dirname +'/public/login.html');
	}
});
app.get('/tasks',function (req, res){
		if (!req.isAuthenticated()){
			res.redirect('/login');
		} else {
			res.sendFile(__dirname +'/public/bullet.html');
		}
		
});
app.post('/loginauth', passport.authenticate('local', {
    failureRedirect:'/'
}), function (req, res){
    res.redirect('/tasks');
    //res.sendStatus(200);
   
    //res.redirect('/'+req.user.name+'/'+req.user.lastname);
});
app.get('/api/getAssignedData', function(req,res){
	console.log(req.user);
	if (!req.isAuthenticated()){
		res.json({error: "not_logged_in"});
	} 
	else {
		Task.
			find({'assignees': req.user._id }).
			populate('creator').
			populate('assignees').
			exec(function(err, story){
				if (!err){
					res.json({task: story});
				}
				else {
					console.log('err occured while tried to populate');
				}
			});

	}
});
app.get('/api/getCreatedData', function(req,res){
	if (!req.isAuthenticated()){
		res.redirect('/login');
	} else {
		Task.
			find({ 'creator': req.user._id }).
			populate('creator').
			populate('assignees').
			exec(function(err, story){
				if (!err){
					console.log({task: story});
					res.json({task: story});
				}
				else {
					console.log('err occured while tried to populate');
				}
			});

		}
});
app.get('/api/getDash', function(req,res){
	if (!req.isAuthenticated()){
		res.redirect('login');
	}
	else {
		var dashboard = ({
		open: 0,
		rejected:0,
		accepted:0,
		ongoing: 0
	});
		Task.
			find({'assignees':[{'_id': req.user._id}]}).
			find({'status':'new'}).
			exec(function(err, story){
				if (err) throw err;
				else {
					dashboard.open = story.length;
					
				}
			});
			Task.find({'assignees':[{'_id': req.user._id}], 'status':'started'}).
			exec(function(err, story){
				dashboard.ongoing = story.length;	
			});
			Task.find({'assignees':[{'_id': req.user._id}], 'status':'rejected'}).
			exec(function(err, story){
				dashboard.rejected = story.length;	
			});
			Task.find({'assignees':[{'_id': req.user._id}], 'status':'accepted'}).
			exec(function(err, story){
				dashboard.accepted = story.length;	
				res.json({dashboard: dashboard});
			});		
	}

});


app.get('/api/getUsers', function(req,res){
	if (!req.isAuthenticated()){
		res.redirect('/login');
	} 
	else {
		User.
			find({}).
			exec(function(err, story){
				if (!err){
					res.json(story);
				}
				else {
					console.log('err occured while tried to get story from db '+err);
				}
			});

		}
});
app.get('/acc/logout', function(req, res){
	req.logout(req.user._id);
	console.log(req.isAuthenticated());
	res.redirect('/login');
});
app.get('/newTask', function(req, res){
	if (!req.isAuthenticated()){
		res.redirect('/login');
	}
	else {
		res.sendFile(__dirname +'/public/newtask.html');	}

});
app.post('/api/newTask', function (req,res){
	var nComment = new models.Comm({
		creator: req.user._id,
		title: req.body.comments.title,
		created_ts: req.body.comments.created_ts,
	});
	nComment.save(function(err, firstComment){
		if (err) throw err;
		else {
				var nTask = new models.Task({
				title: req.body.title,
				creator: req.user._id,
				assignees: req.body.assignees,
				status: req.body.status,
				tasktype:req.body.tasktype,
				comments: [firstComment],
				created_ts:+ new Date(),
				updated_ts:+ new Date()
			});
				nTask.save(function(err, story){
					if (err) throw err;
					else {
						res.json(story._id);
					}
				});

				
		}
	});
});
app.get('/task/:id', function(req,res){
	if (!req.isAuthenticated()){
		res.redirect('/login');
	}
	else {
		Task.findById(req.params.id, function(err, result){
			if (!result){
				console.log('Could not get query, reason: '+err);
				res.redirect('/404');
			}
			else if (result){
				res.sendFile(__dirname+'/public/taskfeed.html');
			}
		});
	}
});
app.get('/api/task/:id', function(req, res){
	Task.findById(req.params.id).
		populate('creator').
		populate('assignees').
		populate({
			path: "comments",
			populate: {
				path: "creator",
				model: "User"
			}
		})
		.exec(function(err, story){
			if (!err){
				var isMatched = checkPermission('assignee' ,req.user, story.assignees);
				var isCreator = checkPermission('creator',req.user, [{_id: story.creator._id.toString()}]);
					var data = {
						task: story,
						current_user: req.user,
						is_assignee: isMatched,
						is_creator: isCreator
					};
					res.json(data);
		
			}
			else {
				console.log('err occured when tried to get story from db');
			}
		});
});
app.get('/404', function (req, res){
	res.send('Page does not exist');
});
app.post('/api/newComment', function(req, res){
	var nComment = new models.Comm({
		creator: req.user._id,
		title: req.body.title,
		created_ts: + new Date()
	});
	nComment.save(function(err, comment){
		if (err) throw err;
		else {
			Task.findById(req.body.task_id, function(err, task){
				if (err) throw err;
				else {
					task.comments.push(comment._id);
					task.save(function(err, story){
						if (err) throw err;
						else {
							Comm.findById(comment._id).
							populate('creator').
							exec(function(err, result){
								if (err) throw err;
								else {
									
									var cdata = {
										comment: result,
										current_user: req.user
									};
									res.json(cdata);
								}
							});
						}
					});
				}
			});
		}
	});
});