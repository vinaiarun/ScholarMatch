'use strict';


var assert = require('assert'),
    path = require('path'),
    nools = require('nools'),
    _ = require('underscore'),
    G11nLocaleFactory = require('./g11nLocaleFactory'),
    debug = require('debuglog')('g11nLocaleFR'),
    flow,
    noolsSession,
    LocaleFactors,
    localeFactory;


/**
 *   Design is that each user request/response cycle can or can NOT cause a firing the rules engine depending on
 *   how you choose to call this function.  That decision/logic should be at a higher level than this function so wrap
 *   this function with additional middleware that decides whether or not to call this function.
 *
 * @param localeFactorie a array representing the files (absolute path) for the localeFactory constructor OR the actual
 *        constructed localeFactory
 * @param options  { ruleFile: 'absolute path/fileName',
 *                  localeFactorsModule: absolute path/fileName }
 *
 *   If you need to over-ride the default rules and LocaleFactors class used by the rules. NOTE: you must name your
 *         LocaleFactors module name and constructor function 'LocaleFactors'
 * @returns {resolveLocale}
 */
function requestHandler(localeFactorie, options) {

    assert(localeFactorie, 'Locale Resolver must have a valid Locale Factory passed in');

    if( typeof localeFactorie === 'object' && Array.isArray(localeFactorie) ) {

        var file0 = localeFactorie[0];
        var file1 =  localeFactorie[1];
        var file2 = localeFactorie[2];
        var file3 = localeFactorie[3];

        localeFactory =  new G11nLocaleFactory(file0, file1, file2, file3);

    }
    else {
        localeFactory = localeFactorie;
    }

    var    localeResolutionDefaults = { ruleFile: path.resolve(__dirname, '../resources/localeResolution.nools'),
        localeFactorsModule: path.resolve(__dirname, './localeFactors') };

    options = (options) ? options : {};

    _.defaults(options, localeResolutionDefaults);
    LocaleFactors = require(options.localeFactorsModule);

    flow = nools.compile( options.ruleFile, {
        define: { LocaleFactors: LocaleFactors},
        scope: {localeFactory: localeFactory}
    });


    /** If you place session here YOU must ensure that you retract all facts before loading new facts and firing rules.
    In addition, you must also ensure that you are not calling any methods in resolveLocale that it put on nextTick
    but required context in currentTick OR be stepped on by another request that call resolveLocale in between another
    request */
    noolsSession = flow.getSession();

    return function resolveLocale(req, res, next) {

        var lf = new LocaleFactors();
        lf.populateFactors(req);


        if(lf) {
            var start = process.hrtime();

            // when you get new info such as user logged in OR query string params such as country then add new fact
            noolsSession.assert(lf);

            //now fire the rules
            noolsSession.match().then(function(err){
                if(err){
                    console.error(err);
                }else{
                    console.log('done');
                }
            });

            // remove facts that where added to the session so the session can be reused
            noolsSession.retract(lf);
            assert(noolsSession.getFacts().length === 0);

            var stop = process.hrtime(start);
            var time = (stop[0]*1e9 + stop[1])/1e6;
            debug('Time for fact(s) to be evaluated by locale resolution on nools: '+ time +' ms');
        }




        res.locals.locale = localeFactory.getG11LocaleForCountryWithLang(lf.country, lf.lang);

        next();
    };
}

module.exports = {
    requestHandler: requestHandler
};




