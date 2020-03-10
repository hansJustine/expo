const express = require('express');
const router = express.Router({mergeParams: true});
const mongoose = require('mongoose');
const generate = require('color-generator');
const nodemailer = require('nodemailer');
const randomize = require('randomatic');
const QRCode = require('qrcode');
const { createCanvas, getImageData, loadImage } = require('canvas');
const canvas = createCanvas(200, 200);
const db = mongoose.connection;
require('dotenv').config();
const administrator = process.env.ADMINISTRATOR || process.env.LOCALADMIN;
const state = process.env.STATE || process.env.LOCALSTATE;

//Models
const Vote = require('../models/vote');
const Booth = require('../models/booth');
const Voter = require('../models/voter');
const Award = require('../models/award');
const Result = require('../models/result');
const State = require('../models/websitestate');
const QrCodeModel = require('../models/qrcode');
const Criteria = require('../models/criteria');

//Middleware
const middleware = require('../middleware');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: process.env.EMAIL,
           pass: process.env.PASS
    }
});
// For QR
var opts = {
    errorCorrectionLevel: 'L',
    type: 'image/jpeg',
    margin: 1,
    scale: 15
}

router.get('/', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    State.findById(state)
        .then(state => { 
            Voter.find()
                .then(voters => {
                    Vote.find()
                        .then(votes => {
                        Booth.find()
                            .then(booths => {
                                Award.find()
                                    .then(awards => {
                                        QrCodeModel.find()
                                            .then(qrcodes => res.render('admin/index', {booths, state, votes, voters, awards, qrcodes}))
                                            .catch(err => console.log(err));
                                    })
                                    .catch(err => console.log(err))
                            })
                            .catch(err => console.log(err))
                    }).catch(err => console.log(err));
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
});

router.get('/booths', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    const ifAdmin = req.user._id.equals(administrator) || req.user.admin;
    Booth.find()
        .then(allBooths => {
            State.findById(state)
                .then(foundState => res.render('admin/booths', {booths: allBooths, ifAdmin: ifAdmin, foundState}))
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

router.get('/awards/judge', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    const ifAdmin = req.user._id.equals(administrator) || req.user.admin;
    Award.find()
        .then(allAwards => {
            State.findById(state)
                .then(foundState =>res.render('admin/awardsJudge', {awards: allAwards, ifAdmin: ifAdmin, foundState}))
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});
router.get('/awards/booth', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    const ifAdmin = req.user._id.equals(administrator) || req.user.admin;
    Award.find()
        .then(allAwards => {
            State.findById(state)
                .then(foundState =>res.render('admin/awardsBooth', {awards: allAwards, ifAdmin: ifAdmin, foundState}))
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

router.get('/scores', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    Award.find().populate('booth')
        .then(allAwards => { 
            Booth.find()
                .then(allBooths => {
                    State.findById(state)
                        .then(foundState => res.render('admin/results', {awards: allAwards, booths: allBooths, foundState}))
                        .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
        }).catch(err => console.log(err));
});

router.post('/winners', middleware.isLoggedIn, middleware.isAdminLoggedIn, middleware.modifyRestriction, (req, res) => {
    Award.find().populate('booth')
        .then(allAwards => { 
            Booth.find()
                .then(allBooths => {
                    //awards 
                    allAwards.forEach((award) => {
                        //Guests Vote
                        if(award.forBooth){
                            //booths 
                            allBooths.forEach((booth) => {
                                global[booth._id] = 0;
                                //vote of a booth 
                                booth.vote.forEach((vote) => {
                                    if(vote.awardId.equals(award._id)){
                                        global[booth._id] += Number(vote.voteCount)
                                    } 
                                })
                                var result = new Result({
                                    awardName: award.awardName,
                                    awardId: award._id,
                                    boothName: booth.boothName,
                                    boothId: booth._id,
                                    totalScore: global[booth._id],
                                    judgeVote: false
                                });
                                result.save();
                            });
                        }
                        //Judges Vote
                        if(award.forJudge){
                            //booths 
                            allBooths.forEach((booth) => {
                                global[booth._id] = 0;
                                global['voteArray' + booth._id] = []
                                //vote of a booth 
                                booth.vote.forEach((vote) => {
                                    if(vote.awardId.equals(award._id) && vote.judgeVote){
                                        global[booth._id] += Number(vote.voteCount);
                                        global['voteArray' + booth._id].push(vote.voteCount);
                                    } 
                                })
                                var finalAverage = global[booth._id]/global['voteArray' + booth._id].length;
                                var result = new Result({
                                    awardName: award.awardName,
                                    awardId: award._id,
                                    boothName: booth.boothName,
                                    boothId: booth._id,
                                    totalScore: finalAverage,
                                    judgeVote: true
                                });
                                result.save();
                            });
                        }
                    })
                })
                .then(() => {return res.redirect('/adminhub/winners')})
                .catch(err => console.log(err));
        }).catch(err => console.log(err)); 
});

router.get('/winners', middleware.isLoggedIn, middleware.isAdminLoggedIn, middleware.modifyRestriction, (req, res) => {
    Award.find().populate('booth')
        .then(allAwards => { 
            Booth.find()
                .then(allBooths =>{
                    Result.find()
                        .then(results => {
                            State.findById(state)
                                .then(foundState => res.render('admin/winnersResult', {awards: allAwards, booths: allBooths, results: results, foundState}))
                                .catch(err => console.log(err));
                        })
                        .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
        }).catch(err => console.log(err));
});
//Delete Judge
router.delete('/judge/:judgeId', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    const judgeId = req.params.judgeId
    Voter.findById(judgeId)
        .then(foundVoter => {
            Booth.updateMany({}, { $pull: { 'vote': { voterId: foundVoter._id   } } }, { multi: true })
                .then(results => {
                    console.log("updateBooth " + results)
                    Vote.deleteMany({voter: { id: foundVoter._id, username: foundVoter.username}})
                        .then(results => {
                            console.log(results);
                            Voter.findByIdAndDelete(foundVoter._id)
                            .then(result => {
                                req.flash('success', "You've deleted a judge successfully!");
                                res.redirect('back');
                            }).catch(err => {
                                req.flash('error', err.message);
                                res.redirect('back');
                            })
                        }).catch(err => console.log(err))
                }).catch(err => console.log(err));
        })
});

//Change State
router.put('/changestate', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    State.findById(state)
        .then(foundState => {
            foundState.updateOne({state: !foundState.state})
                .then(result => {
                    console.log(result);
                    res.redirect('back');
                }).catch(err => console.log(err));
        }).catch(err => console.log(err));
});

//CRITERIA
router.get('/criteria', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    const ifAdmin = req.user._id.equals(administrator) || req.user.admin;
    Criteria.find()
        .then(criteria =>{
            State.findById(state)
                .then(foundState => {
                    Award.find()
                        .then(allAwards => {
                            var total = 0;
                            criteria.forEach((criteria) =>{
                                total += criteria.decimalPercentage * 100
                            });
                            res.render('admin/criteriaIndex', {criteria: criteria, total: total, state: foundState, awards: allAwards, ifAdmin: ifAdmin});
                        })
                        .catch(err => console.log(err))
                })
        })
        .catch(err => console.log(err));
});
router.get('/criteria/:awardId', middleware.isLoggedIn, middleware.isAdminLoggedIn,(req, res) => {
    Criteria.find()
        .then(criteria =>{
            State.findById(state)
                .then(foundState => {
                    Award.findById(req.params.awardId)
                        .then(award => {
                            var total = 0;
                            criteria.forEach((criteria) =>{
                                if(JSON.stringify(criteria.awardId) === JSON.stringify(award._id)){
                                    total += criteria.decimalPercentage * 100
                                }
                            });
                            res.render('admin/addCriteria', {criteria: criteria, total: total, state: foundState, award: award});
                        })
                        .catch(err => console.log(err))
                })
        })
        .catch(err => console.log(err));
})

router.post('/criteria/:awardId', middleware.isLoggedIn, middleware.isAdminLoggedIn, middleware.modifyRestriction, (req, res) => {
    const percentToDeci = Number(req.body.percentage)/100;
    Award.findById(req.params.awardId)
        .then(award => {
            function isAwardNameSim(){
                for(var i = 0; i < award.criteria.length; i++){
                    if(award.criteria[i].criteriaName.trim() === req.body.criteriaName.trim()){
                        return true;
                    }
                }
                return false;
            }
            const isAwardSim = isAwardNameSim();
            if(isAwardSim){
                req.flash('error', 'The criteria name was already registered.')
                res.redirect('back');
            }else{
                var newCriteria = new Criteria({
                    criteriaName: req.body.criteriaName, 
                    decimalPercentage: percentToDeci, 
                    awardName: award.awardName,
                    awardId: award._id
                });
                var total = 0;
                newCriteria.save()
                    .then(createdCriteria => {
                        Criteria.find()
                            .then(allCriteria => {
                                allCriteria.forEach((criteria) =>{
                                    if(JSON.stringify(criteria.awardId) === JSON.stringify(award._id)){
                                        total += criteria.decimalPercentage
                                    }
                                });
                                if(total > 1 || Number(createdCriteria.decimalPercentage) === 0){
                                    Criteria.findByIdAndDelete(createdCriteria._id)
                                        .then(result => {
                                            var requiredNumberLeft = 0;
                                            Criteria.find()
                                                .then(allCriteria => {
                                                    allCriteria.forEach((criteria) =>{
                                                        if(JSON.stringify(criteria.awardId) === JSON.stringify(award._id)){
                                                            requiredNumberLeft += criteria.decimalPercentage * 100
                                                        }
                                                    });
                                                    var percentageLeft = 100 - requiredNumberLeft
                
                                                    if(percentToDeci === 0 || percentageLeft === 0){
                                                        req.flash('error', 'The total percentage is 100%')
                                                        res.redirect('back');
                                                    }else{
                                                        req.flash('error', `You only need ${percentageLeft}%`);
                                                        res.redirect('back');
                                                    }
                                                }).catch(err => console.log(err));
                                        }).catch(err => console.log(err));
                                }else{
                                    const criteriaForAward = {
                                        criteriaId: createdCriteria._id,
                                        criteriaName: createdCriteria.criteriaName,
                                        decimalPercentage: createdCriteria.decimalPercentage,
                                    }
                                    award.criteria.push(criteriaForAward);
                                    award.save()
                                        .then(savedAward => res.redirect('back'))
                                        .catch(err => {
                                            res.redirect('back');
                                            console.log(err);
                                        })
                                }
                            }).catch(err => console.log(err));
                    }).catch(err => {
                        req.flash('error', err.message);
                        res.redirect('back');
                    })
            }
        }).catch(err => console.log(err))
});
router.delete('/criteria/:criteriaId/award/:awardId', middleware.isLoggedIn, middleware.isAdminLoggedIn, middleware.modifyRestriction, (req, res) => {
    Award.updateOne({_id: req.params.awardId}, { $pull: { 'criteria': { criteriaId: req.params.criteriaId } } }, { multi: true })
        .then(result => {
            Criteria.findByIdAndDelete(req.params.criteriaId)
                .then(result => {
                    req.flash('success', "You've successfully deleted a criteria.");
                    res.redirect('back');
                }).catch(err => {
                    req.flash('error', err.message);
                    res.redirect('back');
                })
        }).catch(err => console.log(err));
});

// Register Form
router.get('/register', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    res.render('admin/register')
});

//Register QRCode 
router.post('/register/qrcode', middleware.isLoggedIn, middleware.isRegistrarLoggedIn , (req, res) => {
    var randomCode = randomize('aA0', 8, { exclude: '0oOiIlL1' });
    QRCode.toDataURL(randomCode, opts)
        .then(url => {
            const mailOptions = {
                from: process.env.EMAIL, // sender address
                to: req.body.email, // list of receivers
                subject: 'Qr Code', // Subject line
                html: `<div>Here is your QR Code</div>`, // plain text body
                attachments: [
                    {
                        filename: `qr.jpg`,
                        content: url.split('base64,')[1],
                        encoding: 'base64'
                    }                
                ]
            };
            transporter.sendMail(mailOptions, function (err, info) {
                if(err){
                    console.log('Nodemailer:' + err)
                }else{
                    var qrcode = new QrCodeModel({
                        code: randomCode,
                        isUsed: false
                    });
                    qrcode.save()
                        .then(savedQr => { 
                            req.flash('success', "You've successfully registered a QR Code."); 
                            res.redirect('back')})
                        .catch(err => {
                            req.flash('error', err.message);
                            res.redirect('back')});
                }
            })
        }).catch(err => console.log(err));
});


//Register Booth
router.post('/register/booth', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    var randomCode = randomize('aA0', 8, { exclude: '0oOiIlL1' });
    console.log(req.body);
    console.log(randomCode);
    var newVoter = new Voter({username: req.body.username, boothName: req.body.boothName, judge: false, booth: true, registrar: false});
    Voter.register(newVoter, req.body.password)
        .then(voter => {
            console.log(voter);
            var newBooth = new Booth({
                boothName: req.body.boothName,
                information: req.body.information,
                subInformation: req.body.subInformation,
                color: generate().hexString(),
                code: randomCode,
                image: req.body.image,
                account: voter._id
            });
            newBooth.save()
                .then(savedBooth => {
                    req.flash('success', "You've successfully registered a Booth.");
                    voter.updateOne({boothId: savedBooth._id})
                        .then(result => {
                            const mailOptions = {
                                from: process.env.EMAIL, // sender address
                                to: req.body.email, // list of receivers
                                subject: 'Login Now!', // Subject line
                                html: `<div>Hello ${req.body.boothName}! Here are your credentials: <br> <h4>Username: </h4><span>${req.body.boothName}</span> <br> <h4>Password: </h4> <span>${req.body.password}</span> </div>`, // plain text body
                            };
                            transporter.sendMail(mailOptions, function (err, info) {
                                if(err){
                                    console.log('Nodemailer:' + err)
                                }else{
                                    res.redirect('back')
                                }
                            });
                        }).catch(err => console.log(err));
                }).catch(err => {
                    var msg = err.message; 
                    var errorNum = msg.slice(0, 6);
                    if(errorNum == 'E11000'){
                        req.flash('error', 'The booth you entered is already in the list.');
                    }
                    res.redirect('back');
                });
        }).catch(err => {
            req.flash('error', err.message);
            res.redirect('back');
        });
});
//Register Judge
router.post('/register/judge', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    console.log(req.body);
    var newVoter = new Voter({username: req.body.username, judge: true, booth: false, registrar: false});
    Voter.register(newVoter, req.body.password)
        .then(voter => {
            req.flash('success', "You've successfully registered a Judge.");
            res.redirect('back');
        })
        .catch(err => {
            console.log(err); 
            req.flash('error', err.message);
            res.redirect('back');
        });
});
//Register Registrar
router.post('/register/registrar', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    console.log(req.body);
    var newVoter = new Voter({username: req.body.username, judge: false, booth: false, registrar: true});
    Voter.register(newVoter, req.body.password)
        .then(voter => {
            req.flash('success', "You've successfully registered a Registrar.");
            res.redirect('back');
        })
        .catch(err => {
            console.log(err); 
            req.flash('error', err.message);
            res.redirect('back');
        });
});
// This will be called on ajax
router.get('/api/datas', middleware.isLoggedIn, middleware.isAdminLoggedIn, (req, res) => {
    Award.find().populate('booth')
        .then(allAwards => { 
            Booth.find()
                .then(allBooths => {
                    State.findById(state)
                        .then(states => {
                            Criteria.find()
                                .then(criteria => res.json({allAwards, allBooths, states, criteria}))
                                .catch(err => console.log(err));
                        })
                        .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
        }).catch(err => console.log(err));
});

router.delete('/dropresult', middleware.isLoggedIn, middleware.isAdminLoggedIn, middleware.modifyRestriction, (req, res) => {
    db.dropCollection('results')
        .then(result => console.log('drop collection success'), res.redirect('/adminhub/scores'))
        .catch(err => console.log('drop collection error'));
});



module.exports = router;