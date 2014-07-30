"use strict";



function requestHandler() {

    return function(req, res, next) {

        var user = req.param('user');

        if(user) {
            // user is part of request so they are logged in and mocking the call to user to get preferred language
            // and country
            req.user = { name: user, preferredCountry: user.preferredCountry, preferredLang: user.preferredLang };
        }

       next();
    };
}

module.exports.requestHandler = requestHandler;