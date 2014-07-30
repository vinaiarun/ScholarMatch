"use strict";


/**
 * Middleware to handle http response codes that the consuming application can't.  For example, you may want to render
 * all non user recoverable error into 500. And you may want to render specific catch all error pages so you have
 * control of the rendering here.
 *
 *
 * Based off http://expressjs.com/guide.html#error-handling
 *
 * @returns {Function}
 */
function requestHandler() {

    return function(req, res, next) {

        res.format({

            json: function() {
                res.status(200).json(res.locals);
            },

            html: function() {
                res.render(res.viewName, res.locals);
            }
        });
    };
}

module.exports.requestHandler = requestHandler;