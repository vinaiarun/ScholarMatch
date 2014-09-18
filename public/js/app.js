define([
        "jquery",
        "backbone",
        "BaseView",
        "nougat"
    ],
    function ($, Backbone, BaseView, nougat) {

        "use strict";

        var App = {
            initialize: function () {

                var body = $("body"),
                    initialContext = {
                        "viewName": body.data("viewName")
                    };

                // ajaxify links with "xhr" class
                $("body").on("click", ".xhr", $.proxy(function (event) {
                    var element = $(event.currentTarget);

                    event.preventDefault();

                    $.ajax({
                        type: "get",
                        url: element.attr("href"),
                        success: $.proxy(function (response) {
                            this.handleResponse(response, this.view);
                        }, this)
                    });
                }, this));


                if (initialContext.viewName) {
                    // render first view using afterRender() only because the server already render the template and calling 
                    // render() would require content to be in the response json which it is not
                    require(["views/" + initialContext.viewName], $.proxy(function (ViewClass) {
                        this.view = new ViewClass();

                        // render view with response data
                        this.view.model = new Backbone.Model();
                        this.view.model.set(initialContext);
                        this.view.afterRender();

                        // start recording history for backbone for Ajax'd content
                        Backbone.history.start({
                            pushState: true, // Use HTML5 Push State
                            hashChange: false, // Do full page refresh if Push State isn't supported
                            root: "/businessexp/" //Initial path for app
                        });

                    }, this));
                }

                body.data("viewName", null);
                body[0].removeAttribute("data-view-name");

            },

            // render view and given data       
            renderContext: function (context) {

                var viewName = context.viewName;

                // undelegate events
                this.view.undelegateEvents();

                require(['views/' + viewName], $.proxy(function (ViewClass) {
                    this.view = new ViewClass();

                    // render view with response data
                    this.view.model = new Backbone.Model();
                    this.view.model.set(context);
                    this.view.render();

                    // delegate events
                    this.view.delegateEvents();
                }, this));
            },

            // handles an ajax response made by the app
            // response - json context object
            // currentView - the view that made the request that created the given response
            // form - the form that made the request [optional]
            handleResponse: function (response, currentView, form) {

                // trigger before push state event
                currentView.trigger("beforePushState", response);
                this.renderContext(response);

            }
        };

        return App;
    });




//Bram CODE BELOW

$('#overview').on('click', function(e) {
    $('#overview-answer').toggleClass("about-item-answer-hidden"); 
    e.preventDefault();
});
$('#candidates').on('click', function(e) {
    $('#candidates-answer').toggleClass("about-item-answer-hidden"); 
    e.preventDefault();
});
$('#how-it-works').on('click', function(e) {
    $('#how-it-works-answer').toggleClass("about-item-answer-hidden"); 
    e.preventDefault();
});
$('#student-expectations').on('click', function(e) {
    $('#student-expectations-answer').toggleClass("about-item-answer-hidden"); 
    e.preventDefault();
});
$('#coach-expectations').on('click', function(e) {
    $('#coach-expectations-answer').toggleClass("about-item-answer-hidden"); 
    e.preventDefault();
});



//move cursor to left when someone tries to login & clicks on the appropriate text field
$('#username').on('click',function(e){
    $('#username').css("text-align","left")
});
$('#password').on('click',function(e){
    $('#password').css("text-align","left")
});

//INSTEAD OF ABOVE, OPTION: moves cursor to left only if someone types in the field and clicks off of it
/*$('#username').change(function(e){
    $('#username').css("text-align","left")
});
$('#password').change(function(e){
    $('#password').css("text-align","left")
});
*/


//if menu is open and someone clicks off the menu, it should close

//settings on click (log out, report bug, contact SM, etc)
$('#settings-icon').on('click', function(e) {
    $('#dropdown-settings-id').toggleClass("dropdown-settings-hidden"); 
    e.preventDefault();
});

/*if user clicks outside of the menu, it should go away
$('body').click(function(e){
    if(e.target.className != "dropdown-settings-hidden" || e.target.className!= "dropdown-settings"){
        $('#dropdown-settings-id').toggleClass("dropdown-settings-hidden"); 
        e.preventDefault();
    }
});
*/


//change the active tag in header based on which page it's on
var parts = window.location.href.split("/");
for(var i = 0; i < parts.length; i++){
    parts[i] = parts[i].toUpperCase();
}

var linkIds = ["home","about","dashboard","profile","login-or-logout","sign-up","contact"];

if(parts.indexOf("DASHBOARD")>0){
    for(var i = 0; i < linkIds.length; i++)
        $("#"+linkIds[i]).removeClass();
    document.getElementById("dashboard").className = "active-link";
}
else if(parts.indexOf("ABOUT")>0){
    for(var i = 0; i < linkIds.length; i++)
        $("#"+linkIds[i]).removeClass();
    document.getElementById("about").className = "active-link";
}
else if(parts.indexOf("PROFILE")>0){
    for(var i = 0; i < linkIds.length; i++)
        $("#"+linkIds[i]).removeClass();
    document.getElementById("profile").className = "active-link";
}
else if(parts.indexOf("LOGIN")>0){
    for(var i = 0; i < linkIds.length; i++)
        $("#"+linkIds[i]).removeClass();
    //document.getElementById("login-or-logout").className = "active-link";
    document.getElementById("home").className = "active-link";
}
else if(parts.indexOf("SIGNUP")>0){
    for(var i = 0; i < linkIds.length; i++)
        $("#"+linkIds[i]).removeClass();
    document.getElementById("sign-up").className = "active-link";
}
else if(parts.indexOf("CONTACT")>0){
    for(var i = 0; i < linkIds.length; i++)
        $("#"+linkIds[i]).removeClass();
    document.getElementById("contact").className = "active-link";
}
else{ //if anything else is selected, underline home for now
    for(var i = 0; i < linkIds.length; i++)
        $("#"+linkIds[i]).removeClass();
    document.getElementById("home").className = "active-link";
}