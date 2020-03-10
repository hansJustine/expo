const administrator = process.env.ADMINISTRATOR || process.env.LOCALADMIN;
const middleware = {}
const state = process.env.STATE || process.env.LOCALSTATE;
require('dotenv').config();

const State = require('../models/websitestate');

middleware.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated())
        return next();
    else
        res.redirect('/login');
}

middleware.loggedInInaccessible = (req, res, next) => {
    if(req.isAuthenticated())
        return res.redirect('/');
    else
        return next();
}

middleware.isAdminLoggedIn = (req, res, next) => {
    if(req.user._id.equals(administrator) || req.user.admin)
        return next();
    else
        res.redirect('back');
}

middleware.redirectToAdminHub = (req, res, next) => {
    if(req.user._id.equals(administrator) || req.user.admin)
        return res.redirect('/adminhub');
    else
        return next();
}

middleware.redirectToRegistrar = (req, res, next) => {
    if(req.user.registrar)
        return res.redirect('/registrar');
    else
        return next();
}
middleware.isRegistrarLoggedIn = (req, res, next) => {
    if(req.user.registrar)
        return next();
    else
        res.redirect('back');
}

middleware.redirectToJudgeRoute = (req, res, next) => {
    if(req.user.judge)
        return res.redirect('back');
    else
        return next();
}

middleware.redirectToBoothRoute = (req, res, next) => {
    if(req.user.booth)
        return res.redirect('back');
    else
        return next();
}

middleware.modifyRestriction = (req, res, next) => {
    State.findById(state)
        .then(foundState => {
            if(!foundState.state)
                return next();
            else if(foundState.state)
                res.redirect('back');
        }).catch(err => console.log(err));
}

middleware.restrictVoting = (req, res, next) => {
    State.findById(state)
        .then(foundState => {
            if(!foundState.state){
                req.flash('error', "The voting is not yet started!")
                res.redirect('back');
            }else if(foundState.state){
                return next();
            }
        }).catch(err => console.log(err));
}

module.exports = middleware;