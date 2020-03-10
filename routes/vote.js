const express = require('express');
const router = express.Router({mergeParams: true});
require('dotenv').config();
const administrator = process.env.ADMINISTRATOR || process.env.LOCALADMIN;

//Models
const Vote = require('../models/vote');
const Voter = require('../models/voter');
const Booth = require('../models/booth');
const Award = require('../models/award');
const Criteria = require('../models/criteria');
//Middleware
const middleware = require('../middleware');

// VOTE VERSION 1 (without criteria)
// router.get('/:awardId', middleware.isLoggedIn, (req, res) => {
//     Booth.find()
//         .then(allBooths => {
//             Voter.findById(req.user._id)
//                 .then(foundVoter => {
//                     Award.findById(req.params.awardId)
//                         .then(foundAward =>  {
//                             function isVoted(){    
//                                 for(var i = 0; i < foundAward.voter.length; i++){
//                                     if(foundAward.voter[i]._id.equals(foundVoter._id)){
//                                         return true;
//                                     }
//                                 };
//                                 return false;
//                             } 
//                             res.render('award/show', {booths: allBooths, voter: foundVoter, award: foundAward, isVoted: isVoted()});
//                         })
//                         .catch(err => console.log(err));
//                 })
//                 .catch(err => console.log(err))
//         })
//         .catch(err => console.log(err));
// });

// router.post('/:awardId', middleware.isLoggedIn, (req, res) => {
//     var vote = 0;
//     const boothId = req.body.booth;
//     const newVote = new Vote({
//         voteCount: ++vote,
//         voter: {
//             id: req.user._id,
//             username: req.user.username
//         },
//         booth: { id: boothId },
//         award: { id: req.params.awardId }
//     });
//     newVote.save()
//         .then(vote => {
//             Award.findById(req.params.awardId)
//                 .then(foundAward => {
//                     foundAward.booth.push(boothId);
//                     foundAward.voter.push(req.user._id);
//                     foundAward.save()
//                         .then(savedAward => {
//                             const boothVote = {
//                                 voteId: vote._id,
//                                 awardId: foundAward._id,
//                                 voteCount: vote.voteCount
//                             }
//                             Booth.findById(boothId)
//                                 .then(foundBooth => {
//                                     foundBooth.vote.push(boothVote);
//                                     foundBooth.save()
//                                         .then(updatedBooth => {
//                                             res.redirect('back');
//                                             console.log(updatedBooth)
//                                         }).catch(err => console.log(err))
//                                 })
//                                 .catch(err => console.log(err));
//                         }).catch(err => console.log(err));
//                 }).catch(err => console.log(err))
//         })
//         .catch(err => console.log(err));
// });

// VOTE VERSION 2 (with criteria)
router.get('/:awardId', middleware.isLoggedIn, middleware.redirectToBoothRoute ,middleware.restrictVoting, (req, res) => {
    Booth.find()
        .then(allBooths => {
            Voter.findById(req.user._id)
                .then(foundVoter => {
                    Award.findById(req.params.awardId)
                        .then(foundAward =>  {
                            var total = 0;
                            foundAward.criteria.forEach((criteria) => {
                                total += criteria.decimalPercentage * 100
                            })
                            res.render('award/vote', {booths: allBooths, voter: foundVoter, award: foundAward, total: total});
                        })
                        .catch(err => console.log(err));
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err));
});
router.get('/:awardId/booth/:boothId', middleware.isLoggedIn, middleware.redirectToBoothRoute, middleware.restrictVoting, (req, res) => {
    const judge = req.user;
    Booth.findById(req.params.boothId)
        .then(booth => {
            Award.findById(req.params.awardId)
                .then(award => {
                    Criteria.find()
                        .then(criteria => {
                            function isVoted(){
                                for(var i = 0; i < booth.vote.length; i++){
                                    if(JSON.stringify(booth.vote[i].voterId) === JSON.stringify(req.user._id) && JSON.stringify(booth.vote[i].awardId) === JSON.stringify(award._id)){
                                        return true;
                                    }
                                }
                                return false;
                            }
                            var total = 0;
                            award.criteria.forEach((criteria) => {
                                total += criteria.decimalPercentage * 100
                            })
                            res.render('award/judgeVote', {booth, award, criteria, judge , isVoted: isVoted(), total: total});
                        })
                        .catch(err => console.log(err))
                }).catch(err => console.log(err))
        }).catch(err => console.log(err));
});
router.post('/:awardId/booth/:boothId', middleware.isLoggedIn, middleware.redirectToBoothRoute, middleware.restrictVoting, (req, res) => {
    const boothId = req.params.boothId;
    const awardId = req.params.awardId;
    Criteria.find()
        .then(criteria => {
            var voteResult = 0;
            criteria.forEach((criteria) => {
                if(JSON.stringify(criteria.awardId) === JSON.stringify(awardId)){
                    voteResult += Number(req.body[criteria.criteriaName]) * criteria.decimalPercentage;
                }
            });
            const newVote = new Vote({
                        voteCount: voteResult,
                        judgeVote: true,
                        voter: {
                            id: req.user._id,
                            username: req.user.username
                        },
                        booth: { id: boothId },
                        award: { id: awardId }
                    });
                newVote.save()
                    .then(savedVote => {
                        Award.findById(awardId)
                            .then(foundAward => {
                                foundAward.booth.push(boothId);
                                foundAward.voter.push(req.user._id);
                                foundAward.save()
                                    .then(savedAward => {
                                        const boothVote = {
                                            voteId: savedVote._id,
                                            awardId: foundAward._id,
                                            voterId: req.user._id, 
                                            voteCount: savedVote.voteCount,
                                            judgeVote: true
                                        }
                                        Booth.findById(boothId)
                                            .then(foundBooth => {
                                                foundBooth.vote.push(boothVote);
                                                foundBooth.save()
                                                    .then(updatedBooth => {
                                                        res.redirect('back');
                                                        console.log(updatedBooth)
                                                    }).catch(err => console.log(err))
                                            })
                                            .catch(err => console.log(err));
                                    }).catch(err => console.log(err));
                            }).catch(err => console.log(err))
                    }).catch(err => console.log(err))
        }).catch(err => console.log(err));
})


module.exports = router;
