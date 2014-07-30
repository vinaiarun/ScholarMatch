'use strict';



function G11nLocale(aBcp47Locale, aCountry, aLanguage, aLocale, aCldrLocale) {
    this.bcp47Locale = aBcp47Locale;  // 'bcp language tag'-x-'ISO-3166 country code'
    this.countryCode = aCountry;    //  ISO-3166 (US, FR, IN...)
    this.language = aLanguage;      // bcp47 language tag
    this.locale = aLocale;      // legacy format (en_US, fr_FR, en_IN...)
    this.cldrLocale = aCldrLocale;
    this.timeZones;
    this.primaryTimeZone;
    this.supportedLanguages = [];
}



module.exports = G11nLocale;
