const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const flash = require("connect-flash");
const cookieParser = require('cookie-parser');
const toastr = require('express-toastr');
const LocalStrategy = require('passport-local');
const methodOverride = require('method-override');
const Voter = require('./models/voter');

//Routes
const boothRoutes = require('./routes/booths');
const awardRoutes = require('./routes/awards')
const voteRoutes = require('./routes/vote');
const voteBoothRoutes = require('./routes/voteBooth');
const indexRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');


const uri = process.env.DATABASE || 'mongodb://localhost/trial2';
const port = process.env.PORT || 3000;


mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false, useCreateIndex:true })
    .then(() => console.log('You are connected to the database!'))
    .catch(err => console.log(err));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname + "/public"));
app.use(flash());
app.use(toastr());
app.use(cookieParser('secret'));
app.set("view engine", "ejs");

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "topSecret",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"))
passport.use(new LocalStrategy(Voter.authenticate()));
passport.serializeUser(Voter.serializeUser());
passport.deserializeUser(Voter.deserializeUser());

// This will be called on every route
app.use(function(req, res, next){
    // "res.locals" allows the req.user be available in every template
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.toasts = req.toastr.render();
    next();
});

app.use(indexRoutes);
app.use('/award', awardRoutes);
app.use('/adminhub', adminRoutes);
app.use('/booth', boothRoutes);
app.use(voteBoothRoutes);
app.use('/award/vote', voteRoutes);

app.get('*', (req, res) => {
    res.render('pageNotFound')
});


app.listen(port, () => { console.log(`The server is listening to port ${port}`) });