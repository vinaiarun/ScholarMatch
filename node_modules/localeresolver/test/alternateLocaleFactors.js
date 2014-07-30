'use strict';

function LocaleFactors(options) {
    if(!options) {
        options = {};
    }

    this.dummyCountry;
    this.dummyLang;

    // computed
    this.country;
    this.language;
}

LocaleFactors.defaults = {
    defaultCountry: 'DE',
    defaultLang: 'de-DE'
};




/**
 *
 * @param req  should have user object attached if a user is logged in and that user object should contain
 *             preferredCountry and preferredLang
 * @returns  populated LocaleFactors object
 */
LocaleFactors.prototype.populateFactors = function populateFactors(req) {

    this.dummyCountry  = req.param('dummyCountry');
    this.dummyLang = req.param('dummyLang');

    return this;
}



module.exports = LocaleFactors;