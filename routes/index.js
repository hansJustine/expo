const express = require('express');
const passport = require('passport');
const router = express.Router({mergeParams: true});
const nodemailer = require('nodemailer');
const randomize = require('randomatic');
const QRCode = require('qrcode');
const { createCanvas, getImageData, loadImage } = require('canvas');
const canvas = createCanvas(200, 200);
const ctx = canvas.getContext('2d');
require('dotenv').config();
const administrator = process.env.ADMINISTRATOR || process.env.LOCALADMIN;


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: process.env.EMAIL,
           pass: process.env.PASS
       }
   });


//Models
const Vote = require('../models/vote');
const Booth = require('../models/booth');
const Award = require('../models/award');
const Voter = require('../models/voter');
const State = require('../models/websitestate');
const QrCodeModel = require('../models/qrcode');

//Middleware
const middleware = require("../middleware");

//Root Route
router.get('/', middleware.isLoggedIn, middleware.redirectToRegistrar, middleware.redirectToAdminHub, (req, res) => {
    const user = req.user;
    const ifAdmin = req.user._id.equals(administrator) || req.user.admin;
    Award.find()
        .then(allAwards => {
            res.render('index', {awards: allAwards, ifAdmin: ifAdmin, user: user});
        })
        .catch(err => console.log(err));
});


router.get('/registrar', middleware.isLoggedIn, middleware.isRegistrarLoggedIn, (req, res) => {
    QrCodeModel.find()
        .then(qrcodes => res.render('registrar', {qrcodes: qrcodes}))
        .catch(err => console.log(err))
});
router.get('/registrar/:guestId/edit', middleware.isLoggedIn, middleware.isRegistrarLoggedIn, (req, res) => {
    QrCodeModel.findById(req.params.guestId)
        .then(qrcode => {
            res.render('editGuestInfo', {qrcode})
        })
});
router.put('/registrar/:guestId', middleware.isLoggedIn, middleware.isRegistrarLoggedIn, (req, res) => {
    var updateGuest = {
        firstName: req.body.firstName,
        surname: req.body.surname,
        middleInitial: req.body.mi,
        email: req.body.email,
        contactNumber: req.body.contactNumber,
        relationshipToTheStudent: req.body.relationship
    };
    QrCodeModel.findByIdAndUpdate(req.params.guestId, updateGuest)
        .then(result => {
            req.flash('success', "You've successfully edited the guest's information.");
            res.redirect('/registrar');
        }).catch(err => {
            req.flash('error', err.message);
            res.redirect('back');
        })
});
// REGISTER ADMIN
// router.get("/signup", middleware.loggedInInaccessible, (req, res) => {
//     res.render("register");
// });

// router.post("/signup", middleware.loggedInInaccessible, (req, res) => {
//     var newVoter = new Voter({username: req.body.username, booth: false, judge: false, admin: true, registrar: false});
//     Voter.register(newVoter, req.body.password)
//         .then(voter => {
//             req.flash('success', 'Hello Admin!');
//             res.redirect('back');
//         })
//         .catch(err => {
//             req.flash('error', err.message);
//             res.redirect('back');
//         });
          
// });

//LOGIN
router.get("/login", middleware.loggedInInaccessible, (req, res) => {
    res.render("login");
});
router.post("/login", middleware.loggedInInaccessible, passport.authenticate("local", 
    {
        successRedirect: "/",
        successFlash: "You are logged in successfully!",
        failureRedirect: "/login",
        failureFlash: true
    }), function(req, res){
    
});

//LOGOUT
router.get("/logout", middleware.isLoggedIn, (req, res) => {
    req.logout();
    res.redirect("/");
});


module.exports = router;