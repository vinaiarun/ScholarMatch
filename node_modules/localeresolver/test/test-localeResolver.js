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
     localeFactors = require('../lib/localeFactors'),
     localeResolver = require('../lib/localeResolver'),
     memwatch = require('memwatch'),
     renderMiddlewareHandler = require('./renderMiddlewareHandler').requestHandler,
     userMiddleware = require('./userMiddleware').requestHandler,
     G11nLocaleFactory = require('../lib/g11nLocaleFactory');


describe('test-localeResolver', function () {

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


        memwatch.on('leak', function(info) {
            console.log('>>>>>>>>>>>>>>>>   leaking memory!');
            console.dir(info);
        });

        localeFactory = new G11nLocaleFactory( path.resolve(__dirname, '../example/resources/BCP47LocaleMapping.json'),
            path.resolve(__dirname, '../example/resources/CountryTimeZoneMapping.json'),
            path.resolve(__dirname, '../example/resources/SupportedLanguageMapping.json'),
            path.resolve(__dirname, '../example/resources/g11nProperties.json') );

        app.all(appPath, userMiddleware(), localeResolver.requestHandler(localeFactory), renderMiddlewareHandler() );


        hd = new memwatch.HeapDiff();

        server = app.listen(3000, done);
    });

    after(function(done) {

        var diff = hd.end();
        console.log('diff:  ', diff.change.size );

        server.close(done);
    });


    beforeEach(function () {
    });


    afterEach(function () {
    });


    // loggedInUserAndLangUrlQueryParam
    it('should fire loggedInUserAndLangUrlQueryParam rule', function (done) {

        model.user = { name: 'ralph', preferredCountry: 'US', preferredLang: 'es-US' };
        model.lang = 'en-US'

        request(app).post(appPath).set(hdrs).send(model).end(function(err, response) {

            assert.ok(!err);

            assert( response.body.locale.countryCode === 'US' );
            assert( response.body.locale.language === 'en-US' );

            // set cookie in first test so that it can be passed back and forth for all tests
            hdrs.cookie = response.headers['set-cookie'];

            done();
        });
    });

    //loggedInUserAndLangCookie
    it('should fire loggedInUserAndLangCookie rule', function (done) {

        model.user = { name: 'ralph', preferredCountry: 'US', preferredLang: 'es-US' };
        delete model.lang;
        hdrs.cookie[1] = 'LANG=fr-FR';  // this value has to be in the supported langs for the choosen country

        request(app).post(appPath).set(hdrs).send(model).end(function(err, response) {

            assert.ok(!err);
            assert( response.body.locale.countryCode === 'US' );
            assert( response.body.locale.language === 'fr-FR' );

            done();
        });
    });

    // loggedInUser
    it('should fire loggedIn user rule', function (done) {

        model.user = { name: 'ralph', preferredCountry: 'ES', preferredLang: 'es-ES' };
        delete model.lang;
        delete hdrs['Accept-Language'];
        delete hdrs.cookie[1];

        request(app).post(appPath).set(hdrs).send(model).end(function(err, response) {

            assert.ok(!err);
            assert( response.body.locale.countryCode === 'ES' );
            assert( response.body.locale.language === 'es-ES' );

            done();
        });
    });

    it('should fire loggedInUserAndLangBrowserAcceptHeader rule', function (done) {

        model.user = { name: 'ralph', preferredCountry: 'AU' /**, preferredLang: 'YI' */ };
        hdrs['Accept-Language'] = 'en-AU';
        delete model.lang;
        delete hdrs.cookie[1];

        request(app).post(appPath).set(hdrs).send(model).end(function(err, response) {

            assert.ok(!err);
            assert( response.body.locale.countryCode === 'AU' );
            assert( response.body.locale.language === 'en-AU' );

            done();
        });
    });

    // countryUrlQueryParamAndLangCookie
    it('should fire countryUrlQueryParamAndLangCookie rule', function (done) {

        delete model.user;
        delete hdrs['Accept-Language'];
        delete model.lang;
        model.country = 'BO';
        hdrs.cookie[1] = 'LANG=es-US';

        request(app).post(appPath).set(hdrs).send(model).end(function(err, response) {

            assert.ok(!err);
            assert( response.body.locale.countryCode === 'BO' );
            assert( response.body.locale.language === 'es-US' );

            done();
        });
    });

    // countryUrlQueryParamAndLangBrowserAcceptHeader
    it('should fire countryUrlQueryParamAndLangBrowserAcceptHeader rule', function (done) {

        delete model.user;
        delete  hdrs.cookie[1];
        delete model.lang;
        model.country = 'BM';
        hdrs['Accept-Language'] = 'zh-Hans-CN';

        request(app).post(appPath).set(hdrs).send(model).end(function(err, response) {

            assert.ok(!err);
            assert( response.body.locale.countryCode === 'BM' );
            assert( response.body.locale.language === 'zh-Hans-CN' );

            done();
        });
    });

    // countryCookieAndLangUrlQueryParam
    it('should fire countryCookieAndLangUrlQueryParam rule', function (done) {

        delete model.user;
        delete model.country;
        delete hdrs['Accept-Language'];
        model.lang = 'fr-CA';
        hdrs.cookie[1] = 'COUNTRY=CA';

        request(app).post(appPath).set(hdrs).send(model).end(function(err, response) {

            assert.ok(!err);
            assert( response.body.locale.countryCode === 'CA' );
            assert( response.body.locale.language === 'fr-CA' );

            done();
        });
    });

    // countryCookieAndLangCookie
    it('should fire countryCookieAndLangCookie rule', function (done) {

        delete model.user;
        delete model.country;
        delete  model.lang;
        delete hdrs['Accept-Language'];
        hdrs.cookie[1] = 'COUNTRY=RU';
        hdrs.cookie[2] = 'LANG=ru-RU';

        request(app).post(appPath).set(hdrs).send(model).end(function(err, response) {

            assert.ok(!err);
            assert( response.body.locale.countryCode === 'RU' );
            assert( response.body.locale.language === 'ru-RU' );

            done();
        });
    });

    // countryCookieAndLangBrowserAcceptHeader
    it('should fire countryCookieAndLangBrowserAcceptHeader rule', function (done) {

        delete model.user;
        delete model.country;
        delete  model.lang;
        delete hdrs.cookie[2];
        hdrs.cookie[1] = 'COUNTRY=DK';
        hdrs['Accept-Language'] = 'da-DK';

        request(app).post(appPath).set(hdrs).send(model).end(function(err, response) {

            assert.ok(!err);
            assert( response.body.locale.countryCode === 'DK' );
            assert( response.body.locale.language === 'da-DK' );

            done();
        });
    });

    // countryCookieAndLangBrowserAcceptHeader when lang is really locale format
    it('should fire countryCookieAndLangBrowserAcceptHeader rule  when lang is really locale format', function (done) {

        delete model.user;
        delete model.country;
        delete  model.lang;
        delete hdrs.cookie[2];
        hdrs.cookie[1] = 'COUNTRY=DK';
        hdrs['Accept-Language'] = 'da_DK';

        request(app).post(appPath).set(hdrs).send(model).end(function(err, response) {

            assert.ok(!err);
            assert( response.body.locale.countryCode === 'DK' );
            assert( response.body.locale.language === 'da-DK' );

            done();
        });
    });

    // Default
    it('should fire Default rule', function (done) {

        delete model.user;
        delete model.country;
        delete  model.lang;
        delete hdrs.cookie[2];
        delete hdrs.cookie[1];
        delete hdrs['Accept-Language'];

        request(app).post(appPath).set(hdrs).send(model).end(function(err, response) {

            assert.ok(!err);
            assert( response.body.locale.countryCode === localeFactors.defaults.defaultCountry );
            assert( response.body.locale.language === localeFactors.defaults.defaultLang );

            done();
        });
    });
});


