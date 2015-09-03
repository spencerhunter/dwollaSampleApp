var secrets = require('../config/secrets');
var validator = require('validator');
var async = require('async');
var request = require('request');
var Dwolla = require('dwolla-node')(secrets.dwolla.clientID, secrets.dwolla.clientSecret);
var util = require('util');
var _ = require('lodash');
Dwolla.sandbox = true;

/**
 * GET /api
 * List of API examples.
 */
exports.getApi = function(req, res) {
    res.render('api/index', {
        title: 'API Examples'
    });
};

/**
 * GET /gateway
 * Off-Site Gateway API example.
 */
exports.getGateway = function(req, res, next) {
    if (req.query.error_description != null) {
        req.flash('errors', {
            msg: 'Error: ' + req.query.error_description
        });
    } else if (req.query.status === 'Completed') {
        req.flash('success', {
            msg: 'Transaction Completed - Your Transaction Id is: ' +
                req.query.transaction + '. The expected clearing date of the transaction is: ' + req.query.clearingDate
        });
    }
    var redirect_uri = secrets.dwolla.host + '/api/gateway';
    var purchaseOrder = {
        destinationId: secrets.dwolla.destinationId,
        total: '11.00'
    };

    var params = {
        allowFundingSources: true,
        orderId: 'test order',
    };

    Dwolla.createCheckout(redirect_uri, purchaseOrder, params, function(err, checkout) {
        if (err) return next(err);

        res.render('api/gateway', {
            title: 'Off-Site Gateway',
            checkout: checkout.checkoutURL
        });
    });
};

/**
 * GET /oauth
 * OAuth example.
 */
exports.getOauth = function(req, res) {
    var scope1 = 'AccountInfoFull|Funding';
    var scope2 = 'AccountInfoFull|Funding|Send';
    var client_id = secrets.dwolla.clientID;
    var redirect_uri = secrets.dwolla.host + '/api/oauth/return';
    var url1 = util.format("https://uat.dwolla.com/oauth/v2/authenticate?client_id=%s&response_type=code&redirect_uri=%s&scope=%s&dwolla_landing=register",
        encodeURIComponent(client_id),
        encodeURIComponent(redirect_uri),
        encodeURIComponent(scope1));
    var url2 = util.format("https://uat.dwolla.com/oauth/v2/authenticate?client_id=%s&response_type=code&redirect_uri=%s&scope=%s&dwolla_landing=register",
        encodeURIComponent(client_id),
        encodeURIComponent(redirect_uri),
        encodeURIComponent(scope2));
    var url3 = util.format("https://uat.dwolla.com/oauth/v2/authenticate?client_id=%s&response_type=code&redirect_uri=%s&scope=%s&verified_account=true&dwolla_landing=register",
        encodeURIComponent(client_id),
        encodeURIComponent(redirect_uri),
        encodeURIComponent(scope2));
    res.render('api/oauth', {
        title: 'OAuth Example',
        authUrl1: url1,
        authUrl2: url2,
        authUrl3: url3
    });
};

/**
 * GET /oauth
 * OAuth example.
 */
exports.getOauthReturn = function(req, res) {
    var client_id = secrets.dwolla.clientID;
    var redirect_uri = secrets.dwolla.host + '/api/oauth/return';
    var client_secret = secrets.dwolla.clientSecret;
    var code = req.query.code;
    var url = util.format("https://uat.dwolla.com/oauth/v2/token?client_id=%s&client_secret=%s&grant_type=authorization_code&redirect_uri=%s&code=%s",
        encodeURIComponent(client_id),
        encodeURIComponent(client_secret),
        encodeURIComponent(redirect_uri),
        encodeURIComponent(code));
    request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var tokens = JSON.parse(body);
            req.session.tokens = tokens;
            res.redirect('/api/funding');
        }
    });
};

/**
 * GET /users
 * Users example.
 */
exports.getFundingSources = function(req, res) {
    var atoken = req.session.tokens.access_token;
    var rtoken = req.session.tokens.refresh_token;
    Dwolla.setToken(atoken);
    Dwolla.fundingSources(function(err, data) {
        var response = JSON.stringify(data, null, 2);
        if (err) {
            console.log('This is the error ' + err);
            req.flash('errors', {
                msg: 'Error: ' + err
            });
            return res.render('api/funding');
        }
        res.render('api/funding', {
            title: 'Funding Sources API',
            atoken: atoken,
            rtoken: rtoken,
            response: response
        });
    });
};