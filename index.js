var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var models = require('./models');
var Task = models.Task;
var User = models.User;
var express = require('express');
var session = require('express-session');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: { 
  			maxAge:36000
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
app.get('/', function(req,res){
	res.redirect('/tasks');
});
app.get('/login', function(req,res){
	res.sendFile(__dirname +'/public/login.html');

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
app.get('/api/getData', function(req,res){
	if (!req.isAuthenticated()){
		res.redirect('/login');
	} else {
		Task.
			find({'creator': req.user._id}).
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
app.get('/api/getUsers', function(req,res){
	if (!req.isAuthenticated()){
		res.redirect('/login');
	} else {
		User.
			find({}).
			exec(function(err, story){
				if (!err){
					console.log(story);
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
app.post('/api/newTask', function (req,res){
	var nTask = new models.Task({
		title: req.body.title,
		body: req.body.body,
		creator: req.user._id,
		assignees: req.body.assignees,
		status: req.body.status,
		tasktype:req.body.tasktype,
		created_ts:+ new Date(),
		updated_ts:+ new Date()
});
	nTask.save(function(err, story){
		if (err) throw err;
		else {
			console.log(story);
			res.json('OK');
		}
	});
		
});