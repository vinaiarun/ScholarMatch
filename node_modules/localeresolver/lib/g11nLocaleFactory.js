'use strict';


var fs = require('fs'),
    path = require('path'),
    assert = require('assert'),
    G11nLocale = require('./g11nLocale'),
    debug = require('debuglog')('g11nLocaleFR');


/**
 *
 *
 * @param bcp47LocaleFile   a hash containing locales in the format:
    [
      {
        "bcp47Locale": "es-US-x-AD",
        "countryCode": "AD",
        "language": "es-US",
        "locale": "es_XC",
        "cldrLocale": "es-AD"
      }
    ], ....
 *
 * @param countryTZsFile   a hash of country timezones in the format:

     { "ISO 3166 Country Code": {
          "primaryTimeZone": "Pacific/Efate",
          "timeZones": ["Pacific/Efate"]
       }, ....
     }

 *
 * @param countryLanguagesFile  a hash of country supported languages in the format:
 *
 * { "VU": [
        "fr-FR",
        "es-US",
        "en-US",
        "zh-Hans-CN"
     ], .....
    }
 *
 * @param metadataFile  optional contains the file names for bcp47LocaleFile, countryTZsFile, and countryLanguagesFile
 *     as well as comprehensive version number assuming these files are released as one managed unit
 *
 *
 * @returns {G11nLocaleFactory|*}  the single instance of the G11nLocaleFactory
 * @constructor
 */
function G11nLocaleFactory(bcp47LocaleFile, countryTZsFile, countryLanguagesFile, metadataFile) {

    if(G11nLocaleFactory.prototype.instance !== undefined) { return G11nLocaleFactory.prototype.instance; }

    assert(bcp47LocaleFile && countryTZsFile && countryLanguagesFile);

    // the cached instance
    G11nLocaleFactory.prototype.instance = this;

    // All locale objects (G11nLocale types) from the original source
    this.locales;

    /* Map of G11nLocale s keyed by BCP47 as a String ((such as 'de-DE-x-DE') */
    this.g11nLocalesByBCP47 = {};

    /**
     * Map of G11nLocale s keyed by country then 'legacy' locale as a String
     * ((such as 'en_AU'). The reason is that legacy locale are not unique
     */
    this.g11nLocalesByCountryAndLocale = {};

    /**
     * Map of G11nLocales keyed by country then CLDR locale as a String
     * ((such as 'en-AU')
     */
    this.g11nLocalesByCountryAndCLDRLocale = {};

    /**
     * Hash of country and language where language is a proper language string
     */
    this.g11nLocalesByCountryandLang = {};

    var bcp47Locales = require(bcp47LocaleFile);

    this.countryTimeZones = require(countryTZsFile);

    this.countrySupportedLangs = require(countryLanguagesFile);

    this._setLocales(bcp47Locales);

    if(metadataFile) {
        var bcp47Metadata = require(metadataFile);
        this.sVersion = bcp47Metadata.CURRENT_METADATA_VERSION;
    }
}


/**
* This method is needed so the the public representation of a G11nLocale object can remain constant while the
* underlying data that is used to create/munge it can change at a different rate.
*
* @param internalG11nLocale
* @returns {*}
*/
G11nLocaleFactory.prototype.createG11nLocale = function createG11nLocale(internalG11nLocale) {
    var g11nLocale;
    if(internalG11nLocale) {
        g11nLocale = new G11nLocale(internalG11nLocale.bcp47Locale,
            internalG11nLocale.countryCode,
            internalG11nLocale.language,
            internalG11nLocale.locale,
            internalG11nLocale.cldrLocale);

        g11nLocale.timeZones = internalG11nLocale.timeZones;
        g11nLocale.primaryTimeZone = internalG11nLocale.primaryTimeZone;
        g11nLocale.supportedLanguages = internalG11nLocale.supportedLanguages;
    }
    return g11nLocale;
};

/**
 *
 * @param langStr  must be in valid lang format such as "en-US" or "zh-Hans-CN". Should NOT be a locale legacy format
 *                using the underscore symbol such as  'en_US'. You are assuming legacy locale is a language and it is
 *                not in the context of this function.
 *
 * @param countryCode
 * @returns {*|boolean}
 */
G11nLocaleFactory.prototype.isLangValidForCountry = function isLangValidForCountry(langStr, countryCode) {

    return this.countrySupportedLangs[countryCode] && this.countrySupportedLangs[countryCode].indexOf(langStr) !== -1;
};

/**
 *
 * @param bcp47LocaleStr
 */
G11nLocaleFactory.prototype.isBcp47Locale = function isBcp47Locale(bcp47LocaleStr) {
    return (this.g11nLocalesByBCP47[bcp47LocaleStr] !== undefined);
};



/**
* @param aBCP47Locale string
*            (such as 'de-DE-x-DE')
* @return a corresponding object in G11nLocale format
*/
G11nLocaleFactory.prototype.getG11LocaleForBCP47Locale = function getG11LocaleForBCP47Locale(aBCP47Locale) {
    return this.createG11nLocale(this.g11nLocalesByBCP47[aBCP47Locale]);
};

/**
 * @param aBCP47Locale string
 *            (such as 'de-DE-x-DE')
 * @return a corresponding String for the legacy locale format
 */
G11nLocaleFactory.prototype.getLegacyLocaleForBCP47Locale = function getG11LocaleForBCP47Locale(aBCP47Locale) {
    return this.g11nLocalesByBCP47[aBCP47Locale].locale;
};


/**
 *
 * @param countryCode
 * @param lang    this should be a language string in the BCP47 format
 * @returns {*}
 */
G11nLocaleFactory.prototype.getG11LocaleForCountryWithLang = function getG11LocaleForCountryWithLang(countryCode, lang ) {

    var countryLocales = this.g11nLocalesByCountryandLang[countryCode];
    if(countryLocales && lang) {
        return this.createG11nLocale( countryLocales.locales[lang] );
    }
    return null;
};


/**
* aLocale is expected to be in the xx_YY format. However this method is
* tolerant to the formatting and would accept xx-YY as locale and language
* are often used (wrongly) interchangeably by many
*
* @param countryCode
*            (such as 'AU')
* @param aLocale
*            (such as 'en_AU')
* @return a corresponding object in G11nLocale format
* @deprecated
*/
G11nLocaleFactory.prototype.getG11LocaleForCountryWithLocale = function getG11LocaleForCountryWithLocale(countryCode, aLocale ) {

    var countryLocales = this.g11nLocalesByCountryAndLocale[countryCode];
    if(countryLocales && aLocale) {
        var legacyLocale = aLocale.replace('-', '_');
        return this.createG11nLocale( countryLocales.locales[legacyLocale] );
    }
    return null;
};

/**
 * aCLDRLocale is expected to be in the xx-YY format.
 * @param countryCode
 *            (such as 'AD')
 * @param aCLDRLocale
 *            (such as 'es-AD')
 * @return a corresponding object in G11nLocale format
 */
G11nLocaleFactory.prototype.getG11LocaleForCLDRLocale = function getG11LocaleForCLDRLocale(countryCode, aCLDRLocale) {
    var countryLocales = this.g11nLocalesByCountryAndCLDRLocale[countryCode];
    if(countryLocales && aCLDRLocale) {
        return this.createG11nLocale( countryLocales.locales[aCLDRLocale] );
    }
    return null;
};



/**
* @param theLocales
*/
G11nLocaleFactory.prototype._setLocales = function _setLocales(theLocales) {
    var that = this;

    // All locale objects (G11nLocale types) from the original source
    this.locales = theLocales;

    theLocales.forEach( function(aLocale) {

        that.g11nLocalesByBCP47[aLocale.bcp47Locale] = aLocale;

        if(!that.g11nLocalesByCountryAndLocale[aLocale.countryCode]) {
            that.g11nLocalesByCountryAndLocale[aLocale.countryCode] = { 'locales': {} };
        }
        if(!that.g11nLocalesByCountryAndCLDRLocale[aLocale.countryCode]) {
            that.g11nLocalesByCountryAndCLDRLocale[aLocale.countryCode] = { 'locales': {} };
        }
        if(!that.g11nLocalesByCountryandLang[aLocale.countryCode]) {
            that.g11nLocalesByCountryandLang[aLocale.countryCode] = { 'locales': {} };
        }

        // for each country enter holistic locale info for 'legacy' locale key
        that.g11nLocalesByCountryAndLocale[aLocale.countryCode].locales[aLocale.locale] = aLocale;
        that.g11nLocalesByCountryAndCLDRLocale[aLocale.countryCode].locales[aLocale.cldrLocale] = aLocale;
        that.g11nLocalesByCountryandLang[aLocale.countryCode].locales[aLocale.language] = aLocale;

        if(that.countryTimeZones[aLocale.countryCode]) {
            aLocale.primaryTimeZone = that.countryTimeZones[aLocale.countryCode].primaryTimeZone;
            aLocale.timeZones = that.countryTimeZones[aLocale.countryCode].timeZones;
        }

        if(that.countrySupportedLangs[aLocale.countryCode]) {
            aLocale.supportedLanguages = that.countrySupportedLangs[aLocale.countryCode];
        }
    });
};

module.exports = G11nLocaleFactory;
