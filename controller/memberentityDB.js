var express = require('express');
var app = express();
let middleware = require('./middleware');

var member = require('../model/memberModel.js');

// Middleware and other configurations
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json({ extended: false });
var request = require('request');

// API to get member authentication state
app.get('/api/memberAuthState', middleware.checkToken, function (req, res) {
    var email = req.query.email;
    member.getMemberAuthState(email)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to get member authentication state");
        });
});

// API to get member details
app.get('/api/getMember', function (req, res) {
    var email = req.query.email;
    member.getMember(email)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to get member");
        });
});

// API to get bought items
app.get('/api/getBoughtItem/:id', middleware.checkToken, function (req, res) {
    var id = req.params.id;
    member.getBoughtItem(id)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to get bought items");
        });
});

// API to check if member email exists
app.get('/api/checkMemberEmailExists', function (req, res) {
    var email = req.query.email;
    member.checkMemberEmailExists(email)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to check if member's email exists");
        });
});

// API to get password reset code
app.get('/api/getPasswordResetCode', function (req, res) {
    var email = req.query.email;
    member.getPasswordResetCode(email)
        .then((result) => {
            res.send({ success: true, code: result.passwordReset });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to get password reset code");
        });
});

// API to login member
app.post('/api/loginMember', jsonParser, function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    member.checkMemberLogin(email, password)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to check member login");
        });
});

// API to register member without email verification
app.post('/api/registerMember', jsonParser, function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var recaptcha = req.body.recaptcha;
    var hostName = req.body.hostName;
    if (recaptcha == null || recaptcha == undefined || recaptcha == '') {
        res.send({ "success": false, "errorMsg": "Please select captcha" });
    } else {
        var secretKey = "6LcLaXYUAAAAAALjkMho0ywJyylxa0kUOylNG7SU";
        var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey
            + "&response=" + recaptcha + "&remoteip=" + req.connection.remoteAddress;
        request(verificationUrl, function (error, response, body) {
            body = JSON.parse(body);
            if (body.success !== undefined && !body.success) {
                res.send({ "errorMsg": "Failed captcha verification" });
            } else {
                member.registerMember(email, password, hostName)
                    .then((result) => {
                        res.send({ success: true });
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).send("Failed to register member");
                    });
            }
        });
    }
});

// API to send password reset email
app.post('/api/sendPasswordReset', jsonParser, function (req, res) {
    var email = req.body.email;
    var url = req.body.url;
    member.sendPasswordResetCode(email, url)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to send password reset email");
        });
});

// API to send feedback
app.post('/api/sendFeedback', jsonParser, function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var subject = req.body.subject;
    var message = req.body.message;
    member.sendFeedback(name, email, subject, message)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to send feedback");
        });
});

// API to verify password
app.post('/api/verifyPassword', jsonParser, function (req, res) {
    var id = req.body.id;
    var password = req.body.password;
    member.verifyPassword(id, password)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to verify password");
        });
});

// Removed API to activate member account
// No need to verify email after account creation

// API to update member details
app.put('/api/updateMember', [middleware.checkToken, jsonParser], function (req, res) {
    member.updateMember(req.body)
        .then((result) => {
            if (result.success) {
                member.getMember(req.body.email)
                    .then((result) => {
                        res.send(result);
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).send("Failed to get member");
                    });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to update member");
        });
});

// API to update member password
app.put('/api/updateMemberPassword', jsonParser, function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    member.updateMemPasswordAndResetCode(email, password)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to update member password");
        });
});

// API to update member delivery details
app.put('/api/updateMemberDeliveryDetails', [middleware.checkToken, jsonParser], function (req, res) {
    var email = req.body.email;
    var name = req.body.name;
    var contactNum = req.body.contactNum;
    var address = req.body.address;
    var postalCode = req.body.postalCode;
    member.updateMemberDeliveryDetails(email, name, contactNum, address, postalCode)
        .then((result) => {
            if (result.success) {
                member.getMember(req.body.email)
                    .then((result) => {
                        res.send(result);
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).send("Failed to get member");
                    });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Failed to update member delivery details");
        });
});

module.exports = app;