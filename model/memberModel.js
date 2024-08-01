var db = require('./databaseConfig.js');
var Member = require('./member.js');
var ShoppingCartLineItem = require('./shoppingCartLineItem.js');
var crypto = require('crypto');
var bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let config = require('./config');

var memberDB = {
    checkMemberLogin: function (email, password) {
        return new Promise( ( resolve, reject ) => {
            var conn = db.getConnection();
            conn.connect(function (err) {
                if (err) {
                    console.log(err);
                    conn.end();
                    return reject(err);
                }
                else {
                    var sql = 'SELECT * FROM memberentity m WHERE m.EMAIL=?';
                    conn.query( sql, [email], (err, result) => {
                        if (err){
                            conn.end();
                            return reject(err);
                        }
                        else {
                            if(result == null || result == undefined || result == '') {
                                conn.end();
                                return resolve({success:false});
                            }
                            var member = new Member();
                            member.email = result[0].EMAIL;
                            member.passwordHash = result[0].PASSWORDHASH;

                            bcrypt.compare(password, member.passwordHash, function(err, res) {
                                if(res) {
                                    var token = jwt.sign({username: member.email},
                                        config.secret,
                                        { 
                                            expiresIn: '12h'
                                        }
                                    );
                                    conn.end();
                                    return resolve({success:true, email:member.email, token: token});
                                } else {
                                    conn.end();
                                    return resolve({success:false});
                                }
                            });
                        }
                    });
                }
            });
        });
    },
    getMemberAuthState: function (email) {
        return new Promise( ( resolve, reject ) => {
            var conn = db.getConnection();
            conn.connect(function (err) {
                if (err) {
                    console.log(err);
                    conn.end();
                    return reject(err);
                }
                else {
                    var sql = 'SELECT * FROM memberentity m WHERE m.EMAIL=?';
                    conn.query(sql, [email], function (err, result) {
                        if (err) {
                            conn.end();
                            return reject(err);
                        } else {
                            var member = new Member();
                            member.accountActivationStatus = result[0].ACCOUNTACTIVATIONSTATUS;
                            conn.end();
                            return resolve(member);
                        }
                    });
                }
            });
        });
    },
    getMember: function (email) {
        return new Promise( ( resolve, reject ) => {
            var conn = db.getConnection();
            conn.connect(function (err) {
                if (err) {
                    console.log(err);
                    conn.end();
                    return reject(err);
                }
                else {
                    var sql = 'SELECT * FROM memberentity m WHERE m.EMAIL=?';
                    conn.query(sql, [email], function (err, result) {
                        if (err) {
                            conn.end();
                            return reject(err);
                        } else {
                            var member = new Member();
                            member.id = result[0].ID;
                            member.dob = result[0].DOB;
                            member.accountActivationStatus = result[0].ACCOUNTACTIVATIONSTATUS;
                            member.accountLockStatus = result[0].ACCOUNTLOCKSTATUS;
                            member.activationCode = result[0].ACTIVATIONCODE;
                            member.address = result[0].ADDRESS;
                            member.age = result[0].AGE;
                            member.city = result[0].CITY;
                            member.cumulativeSpending = result[0].CUMULATIVESPENDING;
                            member.email = result[0].EMAIL;
                            member.income = result[0].INCOME;
                            member.isDeleted = result[0].ISDELETED;
                            member.joinDate = result[0].JOINDATE;
                            member.loyaltyCardId = result[0].LOYALTYCARDID;
                            member.loyaltyPoints = result[0].LOYALTYPOINTS;
                            member.name = result[0].NAME;
                            member.occupation = result[0].OCCUPATION;
                            member.passwordHash = result[0].PASSWORDHASH;
                            member.passwordReset = result[0].PASSWORDRESET;
                            member.phone = result[0].PHONE;
                            member.securityAnswer = result[0].SECURITYANSWER;
                            member.securityQuestion = result[0].SECURITYQUESTION;
                            member.sla = result[0].SERVICELEVELAGREEMENT;
                            member.zipcode = result[0].ZIPCODE;
                            member.loyaltyTierId = result[0].LOYALTYTIER_ID;
                            member.countryId = result[0].COUNTRY_ID;
                            member.wishlistId = result[0].WISHLIST_ID;
                            member.stripeCustomerId = result[0].STRIPECUSTOMERID;
                            conn.end();
                            return resolve(member);
                        }
                    });
                }
            });
        });
    },
    getBoughtItem: function (id) {
        return new Promise( ( resolve, reject ) => {
            var conn = db.getConnection();
            conn.connect(function (err) {
                if (err) {
                    console.log(err);
                    conn.end();
                    return reject(err);
                }
                else {
                    var sql = "SELECT i.SKU,i.NAME as 'ITEM_NAME',ic.RETAILPRICE,li.QUANTITY,sr.CREATEDDATE,f.IMAGEURL,sr.ID,"
                        +" d.NAME, d.DELIVERY_ADDRESS, d.POSTAL_CODE, d.CONTACT"
                        +" FROM itementity i,item_countryentity ic,lineitementity li,salesrecordentity sr,"
                        +" salesrecordentity_lineitementity sl,furnitureentity f, deliverydetailsentity d"
                        +" WHERE sr.MEMBER_ID=? AND d.SALERECORD_ID = sr.id AND i.ID=ic.ITEM_ID AND"
                        +" ic.COUNTRY_ID=25 AND li.ITEM_ID=i.ID AND sr.ID=sl.SalesRecordEntity_ID AND"
                        +" li.ID=sl.itemsPurchased_ID AND f.ID=i.ID";
                    conn.query(sql, [id], function (err, result) {
                        if (err) {
                            conn.end();
                            return reject(err);
                        } else {
                            var itemList = [];
                            for(var i = 0; i < result.length; i++) {
                                var boughtItems = new ShoppingCartLineItem();
                                boughtItems.id = result[i].ID;
                                boughtItems.sku = result[i].SKU;
                                boughtItems.itemName = result[i].ITEM_NAME;
                                boughtItems.retailPrice = result[i].RETAILPRICE;
                                boughtItems.quantity = result[i].QUANTITY;
                                boughtItems.createddate = result[i].CREATEDDATE;
                                boughtItems.imageUrl = result[i].IMAGEURL;
                                boughtItems.customerName = result[i].NAME;
                                boughtItems.address = result[i].DELIVERY_ADDRESS;
                                boughtItems.postalCode = result[i].POSTAL_CODE;
                                boughtItems.phone = result[i].CONTACT;
                                itemList.push(boughtItems);
                            }
                            conn.end();
                            return resolve(itemList);
                        }
                    });
                }
            });
        });
    },
    checkMemberEmailExists: function (email) {
        return new Promise( ( resolve, reject ) => {
            var conn = db.getConnection();
            conn.connect(function (err) {
                if (err) {
                    console.log(err);
                    conn.end();
                    return reject(err);
                }
                else {
                    var sql = 'SELECT * FROM memberentity m WHERE m.EMAIL=?';
                    conn.query(sql, [email], function (err, result) {
                        if (err) {
                            conn.end();
                            return reject(err);
                        } else {
                            if(result.length == 0) {
                                conn.end();
                                return resolve(false);
                            }
                            else {
                                conn.end();
                                return resolve(true);
                            }
                        }
                    });
                }
            });
        });
    },
    registerMember: function (email, password, hostName) {
        return new Promise( ( resolve, reject ) => {
            var conn = db.getConnection();
            conn.connect(function (err) {
                if (err) {
                    console.log(err);
                    conn.end();
                    return reject(err);
                }
                else {
                    bcrypt.hash(password, 5, function(err, hash) {
                        var sqlArgs = [email, new Date(), hash];
                        var sql = 'INSERT INTO memberentity(EMAIL,JOINDATE,PASSWORDHASH,LOYALTYTIER_ID) values(?,?,?,15)';
                        conn.query(sql, sqlArgs, function (err, result) {
                            if (err) {
                                conn.end();
                                return reject(err);
                            } else {
                                if(result.affectedRows > 0) {
                                    conn.end();
                                    return resolve({success:true});
                                }
                            }
                        });
                    });
                }
            });
        });
    },
    updateMember: function (details) {
        return new Promise((resolve, reject) => {
            var conn = db.getConnection();
            conn.connect(function (err) {
                if (err) {
                    console.log(err);
                    conn.end();
                    return reject(err);
                } else {
                    var email = details.email;
                    var name = details.name;
                    var city = 'Singapore'
                    var phone = details.phone;
                    var address = details.address;
                    var securityQuestion = details.securityQuestion;
                    var securityAnswer = details.securityAnswer;
                    var age = details.age;
                    var income = details.income;
                    var sla = details.sla;
                    var password = details.password;
    

    
                    if (password == null || password == '') {
                        var sql = 'UPDATE memberentity SET NAME=?, PHONE=?, CITY=?, ADDRESS=?, SECURITYQUESTION=?,'
                            + ' SECURITYANSWER=?, AGE=?, INCOME=?, SERVICELEVELAGREEMENT=?'
                            + ' WHERE EMAIL=?';
                        var sqlArgs = [name, phone, city, address, securityQuestion, securityAnswer,
                            age, income, sla, email];
                        conn.query(sql, sqlArgs, function (err, result) {
                            if (err) {
                                conn.end();
                                return reject(err);
                            } else {
                                conn.end();
                                return resolve({ success: true });
                            }
                        });
                    } else {
                        bcrypt.hash(password, 5, function (err, hash) {
                            var sql = 'UPDATE memberentity SET NAME=?, PHONE=?, CITY=?, ADDRESS=?, SECURITYQUESTION=?,'
                                + ' SECURITYANSWER=?, AGE=?, INCOME=?, SERVICELEVELAGREEMENT=?, PASSWORDHASH=?'
                                + ' WHERE EMAIL=?';
                            var sqlArgs = [name, phone, , address, securityQuestion, securityAnswer,
                                age, income, sla, hash, email];
                            conn.query(sql, sqlArgs, function (err, result) {
                                if (err) {
                                    conn.end();
                                    return reject(err);
                                } else {
                                    conn.end();
                                    return resolve({ success: true });
                                }
                            });
                        });
                    }
                }
            });
        });
    }
    
}

module.exports = memberDB;
