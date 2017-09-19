var path = require('path');
var fs = require('file-system');
var moment = require('moment');
var cookieParser = require('cookie-parser');
var nodemailer = require('nodemailer');
var hbs = require('nodemailer-express-handlebars');
var hbs_options = {
     viewEngine: {
         extname: '.hbs',
         layoutsDir: 'public/views/email/',
         defaultLayout : 'template',
         partialsDir : 'public/views/partials/',
     },
     viewPath: 'public/views/email/',
     extName: '.hbs'
};
var glTransport = require('nodemailer-smtp-transport');
var g_mail = {
		service:'gmail',
		auth: {
			user: 'bulletsystemv2@gmail.com',
			pass: 'Gettingjiggywithit'
		}
};
var mailer = nodemailer.createTransport(glTransport(g_mail));
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

var handlebars = require('handlebars');

app.use(passport.initialize());
app.use(passport.session());
app.listen(3000, function (){
	console.log('Listening on port 3000');
});
mailer.use('compile', hbs(hbs_options));


function checkPermission(access_level,logged_user,task_assignees){
	if (access_level === 'assignee'){
		var i;
		var uid_string = logged_user._id.toString();
		for (i=0;i < task_assignees.length; i++){
			if (uid_string == task_assignees[i]._id){
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
//Sending an email
var idx = 0;
function sendMail(task, hbs_temp){

	if (idx >= task.assignees.length){
		idx = 0;
		return;
	}
	else {
		if (hbs_temp == 'assignee'){
			console.log('Sending an email to assignee');
			mailer.sendMail({
		     from: 'bulletsystemv2@gmail.com',
		     to: task.assignees[idx].email,
		     subject: 'Bullet WorkDesk - Hello '+task.assignees[idx].first_name+' '+'You have been assigned for a ticket',
		     template: 'assignee',
		     context: {
		     	assignees:{
		     		first_name: task.assignees[idx].first_name,
		     	},
		        creator: {
		        	first_name: task.creator.first_name,
		        }, 
		     }
		 	}, function (error, response) {
		    	if (error) throw error;
		     	mailer.close();
		 	});
		}
		else if (hbs_temp == 'finish'){
			console.log('Sending finished notification');
			mailer.sendMail({
		     from: 'bulletsystemv2@gmail.com',
		     to: task.creator.email,
		     subject: 'Bullet WorkDesk - All done '+task.creator.first_name+'. '+task.assignees[idx].first_name+' has finished to work on his ticket',
		     template: 'finish',
		     context: {
		     	assignees:{
		     		first_name: task.assignees[idx].first_name,
		     	},
		        creator: {
		        	first_name: task.creator.first_name,
		        }, 
		     }
		 	}, function (error, response) {
		    	if (error) throw error;
		     	mailer.close();
		 	});
		}
		else if (hbs_temp == 'reject'){
			console.log('Sending rejected notification');
			mailer.sendMail({
		     from: 'bulletsystemv2@gmail.com',
		     to: task.assignees[idx].email,
		     subject: 'Bullet WorkDesk - Bummer '+task.assignees[idx].first_name+'. '+task.creator.first_name+' has rejected a ticket',
		     template: 'reject',
		     context: {
		     	assignees:{
		     		first_name: task.assignees[idx].first_name,
		     	},
		        creator: {
		        	first_name: task.creator.first_name,
		        }, 
		     }
		 	}, function (error, response) {
		    	if (error) throw error;
		     	mailer.close();
		 	});
		}
		else if (hbs_temp == 'accept'){
			console.log('Sending accepted notification');
			mailer.sendMail({
		     from: 'bulletsystemv2@gmail.com',
		     to: task.assignees[idx].email,
		     subject: 'Bullet WorkDesk - Kuddos '+task.assignees[idx].first_name+'. '+task.creator.first_name+' has accepted a ticket',
		     template: 'accept',
		     context: {
		     	assignees:{
		     		first_name: task.assignees[idx].first_name,
		     	},
		        creator: {
		        	first_name: task.creator.first_name,
		        }, 
		     }
		 	}, function (error, response) {
		    	if (error) throw error;
		     	mailer.close();
		 	});
		}
	}
	idx++;
	sendMail(task, hbs_temp);
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
			find({'creator': req.user._id }).
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
						Task.findById(story._id).
						populate('creator').
						populate('assignees').
						exec(function(err, task){
							if (err) throw err;
							else {
								sendMail(task, 'assignee');
							}
						});
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
		.lean() 
		.exec(function(err, story){
			if (!err){
					var isMatched = checkPermission('assignee' ,req.user, story.assignees);
					var isCreator = checkPermission('creator',req.user, [{_id: story.creator._id.toString()}]);
					var data = {
						task: story,
						current_user: req.user,
						is_assignee: isMatched,
						is_creator: isCreator,
						created_ago: moment(story.created_ts).startOf('day').fromNow()
					};

					
					for (var i=0; i<data.task.comments.length; i++) {
						var comment = data.task.comments[i];
						comment.created_ago = moment(comment.created_ts).startOf('day').fromNow();
					}
				

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
app.post('/api/task/:id/action', function(req, res){
	if (!req.isAuthenticated()){
		res.redirect('/login');
	}
	else {

		var _ok = function(new_status){
			res.json({status: "OK", new_task_status: new_status});
		};

		var _fail = function(err){
			res.json({status: "FAIL", error: err || "Internal error"});
		};


		Task.findById(req.params.id).
		populate('creator').
		populate('assignees').
		populate({
			path: "comments",
			populate: {
				path: "creator",
				model: "User"
			}
		}).
		//lean().
		exec(function(err, task){

			var isCreator = checkPermission('creator', req.user, [{_id: task.creator._id.toString()}]);
			var isAssignee = checkPermission('assignee', req.user, task.assignees);

			if (!isAssignee && !isCreator){
				_fail("access_denied");
			}
			else {
				var action = req.body.action,
					creator_allowed_actions = ["accept", "reject"],
					assignee_allowed_actions = ["start", "finish", "unfinish", "restart"],
					has_permission = true;

				if (isCreator && isAssignee) {
					if (creator_allowed_actions.indexOf(action) == -1 && assignee_allowed_actions.indexOf(action) == -1) {
						has_permission = false;
					}
				}
				else if (isCreator) {
					if (creator_allowed_actions.indexOf(action) == -1) {
						has_permission = false;
					}
				}
				else if (isAssignee) {
					if (assignee_allowed_actions.indexOf(action) == -1) {
						has_permission = false;
					}
				}

				if (has_permission) {
					var new_status = null;
					if (action == "accept"){
						new_status = "accepted";
						sendMail(task, 'accept');
					} 
					else if (action == "reject") {
						new_status = "rejected";
						sendMail(task, 'reject');
					}
					else if (action == "start"){
						new_status = "started";
					} 
					else if (action == "finish"){
						new_status = "finished";
						sendMail(task, 'finish');
					} 
					else if (action == "unfinish") new_status = "started";
					else if (action == "restart") new_status = "started";

					if (new_status === null) {
						_fail("unknown_action");
					}
					else {
						task.status = new_status;
						task.save(function(err){
							if (err) {
								_fail(err);
							}
							else {
								_ok(new_status);
							}
						});
					}
				}
				else {
					_fail("bad_action");
				}
			}
		});
	}
});
app.get('/test', function(req, res){
	res.sendFile(__dirname +'/public/test.html');

});
app.post('/api/task/:id/updateAssignees', function (req,res){
	if (!req.isAuthenticated()){
		res.redirect('/login');
	}
	else {
		Task.findById(req.params.id).
		populate('creator').
		exec(function(err, task){
			if (err) throw err;
			else {
				var _ok = function(new_assignees){
				res.json({status: "OK", new_assignees_status: new_assignees});
				};
				var _fail = function(err){
				res.json({status: "FAIL", error: err || "Internal error"});
				};
				var update_permission = true;
				var isCreator = checkPermission('creator', req.user, [{_id: task.creator._id.toString()}]);
				var isAssignee = checkPermission('assignee', req.user, task.assignees);
				if (!isCreator && !isAssignee){
					_fail('access denied');
				}
				else if (isAssignee){
					update_permission = false;
				}
				else if (isCreator){
					update_permission = true;
				}
				else if (isCreator && isAssignee){
					update_permission = true;
				}

				if (update_permission){
					task.assignees = req.body.new_assignees;
					task.save();
					_ok('success: '+task.assignees);
				}
			}
		});
	}
});


			// var action = req.body.action;
			// if (!isAssignee && !isCreator){
			// 	res.json({error: "You are not elgible to make changes to this task"});
			// }
			// if (isAssignee || isCreator) {
			// 	var updated_t = new Task(task);
			// 	if (action === 'start' && isAssignee){
			// 		task.status = 'started';
			// 		Task.findOneAndUpdate(req.params.id, task, {upsert: true}, function(err, updated_t_db){
			// 			if (err) throw err;
			// 			return res.status(200).send(updated_t_db);
			// 		});
			// 	}
			// 	else {
			// 		if (action === 'start' && !isAssignee){
			// 			console.log('Error: you are not assigned for this task, therefore status will not change to: started');
			// 		}
			// 	}
			// 	if (action === 'finish' && isAssignee){
			// 		console.log('3 finished');
			// 		task.status = 'finished';
			// 		Task.findOneAndUpdate(req.params.id, task, {upsert: true}, function(err, updated_t_db){
			// 			if (err) throw err;
			// 			return res.status(200).send('successfully saved');
			// 		});
			// 	}
			// 	else {
			// 		if (action === 'finished' && !isAssignee){
			// 			console.log('Error: you are not assigned for this task, therefore status will not change to: finished');
			// 		}
			// 	}
			// 	if (action === 'unfinish' && isAssignee){
			// 		console.log('4 unfinish');
			// 		task.status = 'started';
			// 		Task.findOneAndUpdate(req.params.id, task, {upsert: true}, function(err, updated_t_db){
			// 			if (err) throw err;
			// 			return res.status(200).send('successfully saved');
			// 		});
			// 	}
			// 	else {
			// 		if (action === 'unfinish' && !isAssignee){
			// 			console.log('Error: you are not assigned for this task, therefore status will not change to: unfinish');
			// 		}
			// 	}
			// 	if (action === 'accept' && isCreator){
			// 		console.log('5 accepted');
			// 		task.status = 'accepted';
			// 		Task.findOneAndUpdate(req.params.id, task, {upsert: true}, function(err, updated_t_db){
			// 			if (err) return res.send(500, { error: err });
			// 			return res.status(200).send('successfully saved');
			// 		});
			// 	}
			// 	else {
			// 		if (action === 'accept' && !isCreator){
			// 			console.log('Error: you are not the creator for this task, therefore status will not change to: accepted');
			// 		}
			// 	}
			// 	if (action === 'reject' && isCreator){
			// 		console.log('6 rejected');
			// 		task.status = 'rejected';
			// 		Task.findOneAndUpdate(req.params.id, task, {upsert: true}, function(err, updated_t_db){
			// 			if (err) throw err;
			// 			return res.status(200).send('successfully saved');
			// 		});
			// 	}
			// 	else {
			// 		if (action === 'reject' && !isCreator)
			// 		console.log('Error: you are not assigned for this task, therefore status will not change to: rejected ');
			// 	}
			// 	if (action === 'restart' && isAssignee){
			// 		console.log('7 restart');
					


			// 		console.log("GAL start");
			// 		Task.findById(req.params.id, function(err, obj){
			// 			if (err) {
			// 				console.log("ERROR: " + err);
			// 				throw err;
			// 			}
			// 			else {
			// 				obj.status = "started";
			// 				obj.save(function(err){
			// 					if (err) {
			// 						console.log("ERROR saving");
			// 						throw err;
			// 					}
			// 					else {
			// 						console.log("Saved!");
			// 						return res.status(200);
			// 					}
			// 				});
			// 			}
			// 		});
			// 		console.log("GAL end");

			// 		// task.status = 'started';
			// 		// Task.findOneAndUpdate(req.params.id, task, {upse
			// 		// 	rt: true}, function (err, updated_t_db){
			// 		// 	if (err) throw err;
			// 		// 	return res.status(200).json(updated_t_db);
			// 		// });
			// 	}
			// 	else {
			// 		if (action === 'restart' && !isAssignee){
			// 			var e_item = ({
			// 				current_task_status: task.status,
			// 				action_requested: action,
			// 				is_creator: isCreator,
			// 				is_assignee: isAssignee
			// 			});
			// 			return res.json(e_item);
			// 		}
			// 	}
			// } 
			// else {
			// 	console.log('error occured, printing related info');
			// 	var e_item_sec = ({
			// 		current_task_status: task.status,
			// 		action_requested: action,
			// 		is_creator: isCreator,
			// 		is_assignee: isAssignee
			// 	});
			// 	return res.json(e_item_sec);
			// }