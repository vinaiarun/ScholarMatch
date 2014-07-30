/*global describe:false, it:false, before:false, after:false, afterEach:false*/

'use strict';

var assert = require('assert'),
    path = require('path'),
    express = require("express"),
    connect = require('connect'),
    bodyParser = require("body-parser"),
    cookieParser = require("cookie-parser"),
    session = require("express-session"),
    request = require("supertest"),
    localeFactors = require('./alternatelocaleFactors'),
    localeResolver = require('../lib/localeResolver'),
    renderMiddlewareHandler = require('./renderMiddlewareHandler').requestHandler,
    userMiddleware = require('./userMiddleware').requestHandler,
    G11nLocaleFactory = require('../lib/g11nLocaleFactory');


describe('test-localeResolver with alternate rules and alternate locale factors', function () {

    var hd,
        app,
        server,
        cookie,
        appPath = "/resolveMyLocale",
        localeFactory;


    var hdrs = {  'Accept':  'application/json' };

    var model = {};


    before(function(done) {
        app = express();
        app.use( bodyParser() );
        app.use( cookieParser() );
        app.use( session({ secret: 'keyboard cat', key: 'guesswho', cookie: { secure: false, maxAge: 60000 }}) );


        var localeFactoryOptions = [];
        localeFactoryOptions.push(  path.resolve(__dirname, '../example/resources/BCP47LocaleMapping.json') );
        localeFactoryOptions.push(  path.resolve(__dirname, '../example/resources/CountryTimeZoneMapping.json') );
        localeFactoryOptions.push(  path.resolve(__dirname, '../example/resources/SupportedLanguageMapping.json') );
        localeFactoryOptions.push(  path.resolve(__dirname, '../example/resources/g11nProperties.json') );


        var alternateRulesFile = path.resolve(__dirname, './alternateRules.nools');
        var alternateLocaleFactorFile = path.resolve(__dirname, './alternateLocaleFactors');

        app.all(appPath, userMiddleware(), localeResolver.requestHandler(localeFactoryOptions,
            {ruleFile: alternateRulesFile, localeFactorsModule: alternateLocaleFactorFile} ),
            renderMiddlewareHandler() );

        server = app.listen(3000, done);
    });

    after(function(done) {

        server.close(done);
    });


    beforeEach(function () {
    });


    afterEach(function () {
    });


    // dummy rule
    it('should fire dummy rule', function (done) {

        model.dummyCountry = 'US';
        model.dummyLang = 'en-US';

        request(app).post(appPath).set(hdrs).send(model).end(function(err, response) {

            assert.ok(!err);
            assert( response.body.locale.countryCode === 'US' );
            assert( response.body.locale.language === 'en-US' );


            done();
        });
    });

    // Default
    it('should fire Default rule', function (done) {

        delete model.dummyCountry;
        delete model.dummyLang;


        request(app).post(appPath).set(hdrs).send(model).end(function(err, response) {

            assert.ok(!err);
            assert( response.body.locale.countryCode === localeFactors.defaults.defaultCountry );
            assert( response.body.locale.language === localeFactors.defaults.defaultLang );

            done();
        });
    });
});


