/**
* @Author: Mohammad M. AlBanna
* Website: www.MBanna.info
* Facebook: www.FB.com/MBanna.info
* Copyright © 2016 Mohammad M. AlBanna
*/

//---------------------------------------Share Buttons------------//
$(function(){
    $("#twitterShare").on("click",function(e){
        e.preventDefault();
        window.open("https://twitter.com/share?via=_MBanna&text=Hi there, I'm using RSSTimeliner Chrome extension to show RSS feeds in timeline! Try it Now: http://goo.gl/Y1ElGc");
    });

    $("#facebookShare").on("click",function(e){
        e.preventDefault();
        window.open("https://www.facebook.com/dialog/feed?app_id=627072280724068&ref=adcounter&link=http://goo.gl/Y1ElGc&name=I'm using RSS Timeliner chrome extension to show RSS feeds in timeline! Try it Now&redirect_uri=https://www.facebook.com&actions=%5B%7B%22name%22%3A%22Download%20More%20Extensions%22%2C%22link%22%3A%22http%3A%2F%2Fgoo.gl/YuwJ5P%22%7D%5D");
    });

    $("#googlePlusShare").on("click",function(e){
        e.preventDefault();
        window.open("https://plus.google.com/share?url=http://goo.gl/Y1ElGc");
    });
});
//--------------------Ignore contains case sensitive ------------------//
$.expr[":"].contains = $.expr.createPseudo(function(arg) {
    return function(elem) {
        return $(elem).text().toUpperCase().indexOf($.trim(arg.toUpperCase())) >= 0;
    };
});
//--------------------------------------------------------------//
function syncStorage(key, value) {
    var obj = {};
    var key = key;
    obj[key] += key;
    obj[key] = value;
    chrome.storage.sync.set(obj);
}
//-------------------------------------------------------------------------------------------------------//
function escapeHTML(s) { 
    return s.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

//----------------------------------------------------------------------------------//
//Clear tabs for more speed
function clearContent(){
    $(".feeds-content-list li").remove();
    $(".favorit-feeds-content-list li").remove();
    $(".social-media iframe").remove();
    $(".my-products-list li").remove();
}

//----------------------------------------------------------------------------------//
//Sort feeds
var sortArray = function (items, inverse) {
    var inverse = inverse || false;
    var sortedArray = items.map(function () {
        return {
            id: $(this).data("counter"),
            element: $(this)
        };
    });
    
    var appendTo = items.parent();
    items.detach();

    sortedArray.sort(function (a, b) {
        return a.id > b.id ? (inverse ? -1 : 1) : (inverse ? 1 : -1);
    });

    sortedArray.each(function () {
        $(appendTo).append(this.element);
    });
}

