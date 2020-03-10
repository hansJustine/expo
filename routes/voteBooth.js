const express = require('express');
const router = express.Router({mergeParams: true});
const httpMsgs = require('http-msgs');
require('dotenv').config();
const administrator = process.env.ADMINISTRATOR || process.env.LOCALADMIN;

//Models
const Vote = require('../models/vote');
const Booth = require('../models/booth');
const Voter = require('../models/voter');
const Award = require('../models/award');
const State = require('../models/websitestate');
const QrCodeModel = require('../models/qrcode');

//Middleware
const middleware = require('../middleware');

router.get('/vote/:awardId', middleware.isLoggedIn, middleware.redirectToAdminHub, middleware.redirectToJudgeRoute, middleware.restrictVoting, (req, res) => {
    Booth.findById(req.user.boothId)
        .then(foundBooth => {
            Award.findById(req.params.awardId)
                .then(foundAward =>  {
                    res.render('boothShow', {booth: foundBooth, award: foundAward});             
                }).catch(err => console.log(err));
        }).catch(err => console.log(err));
});

router.post('/vote', middleware.isLoggedIn, middleware.redirectToAdminHub, middleware.redirectToJudgeRoute, middleware.restrictVoting, (req, res) => {
    Booth.findById(req.user.boothId)
        .then(foundBooth => {
            QrCodeModel.findOne({code: req.body.code})
                .then(foundCode => {
                    // FOR BOOTH if(req.body.code === foundBooth.code)
                    if(req.body.code === foundCode.code && !foundCode.isUsed){
                        var vote = 0;
                        const boothId = req.user.boothId;
                        const newVote = new Vote({
                            voteCount: ++vote,
                            judgeVote: false,
                            voter: {
                                id: req.user._id,
                                username: req.user.username
                            },
                            booth: { id: boothId },
                            award: { id: req.body.awardId }
                        });
                        newVote.save()
                            .then(vote => {
                                Award.findById(req.body.awardId)
                                    .then(foundAward => {
                                        foundAward.booth.push(boothId);
                                        foundAward.voter.push(req.user._id);
                                        foundAward.save()
                                            .then(savedAward => {
                                                const boothVote = {
                                                    voteId: vote._id,
                                                    awardId: foundAward._id,
                                                    voteCount: vote.voteCount
                                                }
                                                Booth.findById(boothId)
                                                    .then(foundBooth => {
                                                        foundBooth.vote.push(boothVote);
                                                        foundBooth.save()
                                                            .then(updatedBooth => {
                                                                foundCode.updateOne({isUsed: true})
                                                                    .then(updatedCode => {
                                                                        httpMsgs.sendJSON(req, res, {
                                                                            status: '200', 
                                                                            msg: 'Thank you for voting!'
                                                                        });
                                                                    }).catch(err => console.log('QRCodeUpdate: ' + err))
                                                            }).catch(err => console.log(err))
                                                    })
                                                    .catch(err => console.log(err));
                                            }).catch(err => console.log(err));
                                    }).catch(err => console.log('Award' + err))
                            })
                            .catch(err => console.log(err));
                    }else{
                        httpMsgs.sendJSON(req, res, {
                            status: '400', 
                            msg: 'The QR Code is already used.'
                        });
                    }
                }).catch(err => {
                    console.log(err);
                    httpMsgs.sendJSON(req, res, {
                        status: '400', 
                        msg: 'Invalid QR Code!'
                    }); 
                });
        }).catch(err => console.log(err));
});


module.exports = router;