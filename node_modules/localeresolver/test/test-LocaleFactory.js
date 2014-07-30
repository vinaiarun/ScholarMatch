/*global describe:false, it:false, before:false, after:false, afterEach:false*/

'use strict';

var assert = require('assert'),
    path = require('path'),
    LocaleFactory = require('../lib/g11nLocaleFactory');


describe('Locale Factory tests', function () {

    var localeFactorySingleton;

    before(function(done) {
        done();
    });

    after(function(done) {

        done();
    });


    beforeEach(function () {
    });


    afterEach(function () {
    });


    it('should create LocaleFactory something', function (done) {
        localeFactorySingleton = new LocaleFactory( path.resolve(__dirname, '../example/resources/BCP47LocaleMapping.json'),
            path.resolve(__dirname, '../example/resources/CountryTimeZoneMapping.json'),
            path.resolve(__dirname, '../example/resources/SupportedLanguageMapping.json') );
        assert(localeFactorySingleton);
        done();
    });

    it('should return the same LocaleFactory instance upon subsequent function constructor calls', function (done) {
        var another = new LocaleFactory();
        assert(another === localeFactorySingleton,
            'Locale Factory should be the same when calling the constructor multiple times');
        done();
    });

    it('should retrieve G11Locales for locales encoded using bcp47 strings', function (done) {
        var locale = localeFactorySingleton.getG11LocaleForBCP47Locale('de-DE-x-DE');
        assert(locale.bcp47Locale === 'de-DE-x-DE');
        assert(locale.countryCode === 'DE');
        assert(locale.language === 'de-DE');
        assert(locale.locale === 'de_DE');
        assert(locale.cldrLocale === 'de-DE');
        assert(locale.supportedLanguages);
        assert(locale.primaryTimeZone);
        assert(locale.timeZones);

        done();
    });

    it('should retrieve legacy locale string for locales encoded using bcp47 strings', function (done) {
        var locale = localeFactorySingleton.getLegacyLocaleForBCP47Locale('de-DE-x-DE');
        assert(locale ===  'de_DE');
        done();
    });

    it('should retrieve G11Locales for locales encoded using both country AND bcp47 strings', function (done) {
        var locale = localeFactorySingleton.getG11LocaleForCountryWithLocale('DE', 'de-DE');
        assert(locale.bcp47Locale === 'de-DE-x-DE');
        assert(locale.countryCode === 'DE');
        assert(locale.language === 'de-DE');
        assert(locale.locale === 'de_DE');
        assert(locale.cldrLocale === 'de-DE');
        assert(locale.supportedLanguages);
        assert(locale.primaryTimeZone);
        assert(locale.timeZones);
        done();
    });

    it('should retrieve G11Locales for locales encoded using both country AND CLDR locale', function (done) {
        var locale = localeFactorySingleton.getG11LocaleForCLDRLocale('AD', 'es-AD');
//        assert(locale);
        assert(locale.bcp47Locale === 'es-US-x-AD');
        assert(locale.countryCode === 'AD');
        assert(locale.language === 'es-US');
        assert(locale.locale === 'es_XC');
        assert(locale.cldrLocale === 'es-AD');
        assert(locale.supportedLanguages);
        assert(locale.primaryTimeZone);
        assert(locale.timeZones);

        done();
    });

    it('should validate language for a given country', function (done) {
        assert(localeFactorySingleton.isLangValidForCountry('fr-FR', 'VU') === true );
        done();
    });

    it('should validate language for a given country', function (done) {
        assert(localeFactorySingleton.isBcp47Locale('es-US-x-AE') === true );
        done();
    });

    it('should validate language for a given country', function (done) {
        assert(localeFactorySingleton.isBcp47Locale('haha') === false );
        done();
    });
});


