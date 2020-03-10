const express = require('express');
const router = express.Router({mergeParams: true});
const generate = require('color-generator');
require('dotenv').config();
const administrator = process.env.ADMINISTRATOR || process.env.LOCALADMIN;


//Models
const Vote = require('../models/vote');
const Booth = require('../models/booth');
const Voter = require('../models/voter');

//Middleware
const middleware = require("../middleware");

//SHOW EDIT FORM
router.get("/:boothId/edit", middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    Booth.findById(req.params.boothId, (err, foundBooth) =>{
        if(err){
            console.log(err);
        }
        res.render("booth/edit", {booth: foundBooth});
    });
});
//UPDATE BOOTH
router.put("/:boothId", middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    var updateBooth = {
        boothName: req.body.boothName,
        information: req.body.information,
        subInformation: req.body.subInformation,
        image: req.body.image,
    };
    Booth.findByIdAndUpdate(req.params.boothId, updateBooth)
        .then(updatedBooth => res.redirect('/adminhub/booths'))
        .catch(err => console.log(err));
});
//DELETE BOOTH AND VOTES 
router.delete("/:boothId", middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    Booth.findById(req.params.boothId)
        .then(foundBooth => {
            Vote.deleteMany({booth: {id: foundBooth._id}})
                .then(result => {
                    Voter.deleteOne({boothId: foundBooth._id})
                        .then(result => {
                            console.log(result);
                            foundBooth.remove()
                                .then(result => res.redirect('back'))
                                .catch(err => console.log(err));
                        }).catch(err => console.log(err))
                })
                .catch(err => console.log(err));
        })        
        .catch(err => console.log(err));
});

module.exports = router;