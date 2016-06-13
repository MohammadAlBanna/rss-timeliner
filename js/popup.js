/**
* @Author: Mohammad M. AlBanna
* Website: www.MBanna.info
* Facebook: www.FB.com/MBanna.info
* Copyright © 2016 Mohammad M. AlBanna
*/

$(function() {
    //Load current settings
    loadSettings();
    //Tabs
    $('ul.tabs li').click(function() {
        clearContent();
        $('.tab-content').enscroll("destroy").unbind("scroll");
        $(".website-url-search-box").fadeOut();
        var tab_id = $(this).attr('data-tab');
        $('ul.tabs li').removeClass('current');
        $('.tab-content').removeClass('current');
        $(this).addClass('current');
        $("#" + tab_id).addClass('current');
        if (tab_id == "tab-1") {
            loadFeeds(function() {
                sortArray($(".feeds-content-list li"));
            });
        } else if (tab_id == "tab-2") {
            loadFavoriteFeeds();
        } else if (tab_id == "tab-3") {
            $(".feeds-content-list li").remove();
            $(".favorit-feeds-content-list li").remove();
            $(".website-url-search-box").fadeIn();
        } else if (tab_id == "tab-4") {
            loadProducts();
        } else if (tab_id == "tab-5") {
            $(".social-media").prepend('<iframe src="https://www.facebook.com/plugins/likebox.php?href=https%3A%2F%2Fwww.facebook.com%2FMBanna.info&amp;width=250&amp;height=250&amp;colorscheme=light&amp;show_faces=true&amp;header=false&amp;stream=false&amp;show_border=false&amp;appId=627072280724068" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:250px; height:210px;" allowTransparency="true"></iframe>');
        }

        $('.current.tab-content').enscroll({
            verticalTrackClass: 'track4',
            verticalHandleClass: 'handle4',
            minScrollbarLength: 28,
            showOnHover: false
        }).bind("scroll", function() {
            var currentBanel = $(this);
            if (scrollTime) {
                clearTimeout(scrollTime);
            }
            scrollTime = setTimeout(function() {
                syncStorage("setting_currentScroll", $(currentBanel).scrollTop())
            }, 300);
        });
    });

    //Remove red color.
    $("body").on("click", "#tab-3 input[name='feedUrlInput']", function() {
        $("input[name='feedUrlInput']").val("");
        $("input[name='feedUrlInput']").css("color", "#757575");
    });
    //----------------------------------------------------------------------------------//
    //Add feed url
    $("body").on("click", "#tab-3 .add-rss-url-button", function() {
        var feedUrl = $("input[name='feedUrlInput']").val();
        if (feedUrl.length > 0) {
            $.get("https://ajax.googleapis.com/ajax/services/feed/load?num=1&v=1.0&q=" + feedUrl, function(data) {
                if (data.responseData != null) {
                    //Save to storage
                    var websiteLink = document.createElement("a");
                    if (data.responseData.feed.link) {
                        websiteLink.href = data.responseData.feed.link;
                    } else {
                        websiteLink.href = "chrome://" + Math.floor((Math.random() * 100000000) + 1) + ".html";
                    }
                    //Check if this website stored before!
                    chrome.storage.sync.get(null, function(result) {
                        var dontAddURL = false;
                        //check if the feed url is founded!
                        $.each(result, function(index, entry) {
                            var json = JSON.parse(entry);
                            if (json.feedUrl == feedUrl) {
                                $("input[name='feedUrlInput']").css("color", "red").val("This website has beed added before!");
                                dontAddURL = true;
                                return false;
                            }
                        });
                        if (dontAddURL) {
                            return false;
                        }
                        var websiteTitle = data.responseData.feed.title;
                        var description = data.responseData.feed.description;
                        var direction = $("input[name='textDirection']:checked").val();
                        var followed = "Y";
                        var pin = "N";
                        var obj = {};
                        var keyFeedUrl = feedUrl.replace(/(http:\/\/)|(www\.)/ig, "");
                        var key = keyFeedUrl;
                        obj[key] += keyFeedUrl;
                        var json = {
                            "feedUrl": feedUrl,
                            "websiteUrl": websiteLink.href,
                            "websiteTitle": websiteTitle,
                            "description": description,
                            "direction": direction,
                            "followed": followed,
                            "pin": pin
                        };
                        obj[key] = JSON.stringify(json);
                        chrome.storage.sync.set(obj);
                        //Insert the item
                        $('<li class="rsst-feeds-urls current" data-feed="' + keyFeedUrl + '">\
                            <div class="feed-info-url">\
                                <b class="feed-url-title" title="' + description + '">' + websiteTitle + '</b>\
                                <div class="operations-btns uibutton-group">\
                                    <a class="' + (followed == "Y" ? "uibutton-active" : "") + ' follow-btn uibutton" href="#">' + (followed == "Y" ? "Unfollow" : "Follow") + '</a>\
                                    ' + (websiteLink.href.indexOf("http") == -1 ? "" : "<a class=\"uibutton\" target=\"_blank\" href=\"" + websiteLink.href + "\">Visit Website</a>") + '\
                                    ' + (pin == "Y" ? "" : "<a class=\"uibutton uibutton-red remove-feed-url\" href=\"#\">Remove</a>") + '\
                                </div>\
                                <div class="directions-radio-container"><label for="' + keyFeedUrl + '1" title="The text will be from Right to Left">\
                                    <input id="' + keyFeedUrl + '1" class="rtlText" ' + (direction == "rtl" ? "checked" : "") + ' name="' + keyFeedUrl + '" type="radio" value="rtl" />\
                                    RTL</label>\
                                    <label for="' + keyFeedUrl + '2" title="The text will be from Left to Right">\
                                    <input class="ltrText" id="' + keyFeedUrl + '2" ' + (direction == "ltr" ? "checked" : "") + ' name="' + keyFeedUrl + '" type="radio" value="ltr" />\
                                    LTR</label></div>\
                                </div>\
                            </li>').appendTo(".websites-feed-url").data(json);
                        //Scroll to end
                        $(".tab-content.current").scrollTop($("html").innerHeight());
                    });
                    $("input[name='feedUrlInput']").val("");
                } //If there is feeds respons == url is right.
                else {
                    $("input[name='feedUrlInput']").css("color", "red").val("Please check the feed URL again OR there are no feeds yet!");
                }
            }, "jsonp");
        } else {
            $("input[name='feedUrlInput']").css("color", "red").val("Please add direct feed URL - XML format!");
        }
    });
    //----------------------------------------------------------------------------------//
    //get all websites
    chrome.storage.sync.get(null, function(result) {
        $.each(result, function(index, data) {
            if (index.indexOf("fav_") != -1 || index.indexOf("setting_") != -1) {
                return;
            }
            var feed = JSON.parse(data);
            var theWebsite = $('<li class="rsst-feeds-urls ' + (feed.pin == "Y" ? "pinned" : "") + '" data-feed="' + index + '">\
                 <div class="feed-info-url">\
                    <b class="feed-url-title" title="' + feed.description + '">' + feed.websiteTitle + '</b>\
                    <div class="operations-btns uibutton-group">\
                        <a class="' + (feed.followed == "Y" ? "uibutton-active" : "") + ' follow-btn uibutton" href="#">' + (feed.followed == "Y" ? "Unfollow" : "Follow") + '</a>\
                        ' + (feed.websiteUrl.indexOf("http") == -1 ? "" : "<a class=\"uibutton\" target=\"_blank\" href=\"" + feed.websiteUrl + "\">Visit Website</a>") + '\
                        ' + (feed.pin == "Y" ? "" : "<a class=\"uibutton uibutton-red remove-feed-url\" href=\"#\">Remove</a>") + '\
                    </div>\
                     <div class="directions-radio-container"><label for="' + index + '1" title="The text will be from Right to Left">\
                        <input id="' + index + '1" class="rtlText" ' + (feed.direction == "rtl" ? "checked" : "") + ' name="' + index + '" type="radio" value="rtl" />\
                        RTL</label>\
                        <label for="' + index + '2" title="The text will be from Left to Right">\
                        <input class="ltrText" id="' + index + '2" ' + (feed.direction == "ltr" ? "checked" : "") + ' name="' + index + '" type="radio" value="ltr" />\
                        LTR</label></div>\
                    </div>\
                </li>')
            if (feed.pin == "Y") {
                theWebsite.prependTo(".websites-feed-url").data(feed);
            } else {
                theWebsite.appendTo(".websites-feed-url").data(feed);
            }
        });
    });
    //----------------------------------------------------------------------------------//
    //on changes in direction
    $("body").on("change", ".rsst-feeds-urls input[type='radio']", function() {
        //Get the data
        var keyFeedUrl = $(this).parents(".rsst-feeds-urls").attr("data-feed");
        var json = $(this).parents(".rsst-feeds-urls").data();
        json.direction = $(this).val();
        var obj = {};
        var key = keyFeedUrl;
        obj[key] += keyFeedUrl;
        obj[key] = JSON.stringify(json);
        chrome.storage.sync.set(obj);
    });
    //----------------------------------------------------------------------------------//
    //on changes in Follow
    $("body").on("click", ".rsst-feeds-urls .follow-btn", function() {
        //Get the data
        var keyFeedUrl = $(this).parents(".rsst-feeds-urls").attr("data-feed");
        var json = $(this).parents(".rsst-feeds-urls").data();
        if (json.followed == "Y") {
            json.followed = "N";
            $(this).removeClass("uibutton-active");
            $(this).text("Follow");
        } else {
            json.followed = "Y";
            $(this).addClass("uibutton-active");
            $(this).text("Unfollow");
        }
        var obj = {};
        var key = keyFeedUrl;
        obj[key] += keyFeedUrl;
        obj[key] = JSON.stringify(json);
        chrome.storage.sync.set(obj);
    });
    //----------------------------------------------------------------------------------//
    //on remove url feeds clicked
    $("body").on("click", ".rsst-feeds-urls .remove-feed-url", function() {
        //Get the data
        var keyFeedUrl = $(this).parents(".rsst-feeds-urls").attr("data-feed");
        chrome.storage.sync.remove(keyFeedUrl);
        $(this).parents(".rsst-feeds-urls").remove();
    });
    //----------------------------------------------------------------------------------//
    //on remove favorite feeds clicked
    $("body").on("click", "#tab-2 .favorite-feed", function() {
        //Get the data
        var feedLink = $(this).parents(".rsst-feeds").attr("data-feed-url");
        chrome.storage.sync.remove("fav_" + feedLink);
        //Save to LOCAL storage
        var json = $(this).parents(".rsst-feeds").data();
        json.favorite = "N";
        var obj = {};
        var key = feedLink;
        obj[key] += feedLink;
        obj[key] = JSON.stringify(json);
        chrome.storage.local.set(obj);
        $(this).parents(".rsst-feeds").remove();
        $(".feeds-content-list li[data-feed-url='" + feedLink + "'] .favorite-feed").removeClass("special-active");
        $(".feeds-content-list li[data-feed-url='" + feedLink + "'] .favorite-feed").text("Favorite");
    });
    //----------------------------------------------------------------------------------//
    var timer;
    //filter feeds by websites title
    $("body").on("keypress", "input[name='feedSearchInput']", function() {
        clearTimeout(timer);
        timer = setTimeout(function() {
            $(".websites-feed-url li").hide();
            $(".feed-info-url b:contains(" + $("input[name='feedSearchInput']").val() + ")").parents(".rsst-feeds-urls").fadeIn("fast");
        }, 100);
    }).on('keydown', function(e) {
        if (e.keyCode == 8)
            if ($(this).val() == '') {
                $(".websites-feed-url li").fadeIn("fast");
            }
    });
    //----------------------------------------------------------------------------------//
    //filter feeds
    $("body").on("keypress", "#tab-1 input[name='searchFeeds']", function() {
        clearTimeout(timer);
        timer = setTimeout(function() {
            $(".feeds-content-list li").hide();
            $(".feed-info a:contains(" + $("input[name='searchFeeds']").val() + ")").parents(".rsst-feeds").fadeIn("fast");
        }, 100);
    }).on('keydown', function(e) {
        if (e.keyCode == 8) {
            if ($(this).val() == '') {
                $(".feeds-content-list li").fadeIn("fast");
            }
        }
    });
    //filter fav feeds
    $("body").on("keypress", "#tab-2 input[name='searchFavoriteFeeds']", function() {
        clearTimeout(timer);
        timer = setTimeout(function() {
            $(".favorit-feeds-content-list li").hide();
            $(".feed-info a:contains(" + $("input[name='searchFavoriteFeeds']").val() + ")").parents(".rsst-feeds").fadeIn("fast");
        }, 100);
    }).on('keydown', function(e) {
        if (e.keyCode == 8) {
            if ($(this).val() == '') {
                $(".favorit-feeds-content-list li").fadeIn("fast");
            }
        }
    });
    //----------------------------------------------------------------------------------//
    //On click load feeds
    $("body").on("click", "#tab-1 .refresh-feeds-button", function() {
        var clearStorage = false;
        var counter = 0;
        var feedCounter = 1;
        $(".feeds-content-list li").remove();
        $(".loaderImg").remove();
        $(".feeds-content-list").prepend('<img class="loaderImg" src="images/loader.gif" height="32" width="32" />');
        chrome.storage.sync.get(null, function(result) {
            $.each(result, function(savedWebsites, feeds) {
                if (savedWebsites.indexOf("fav_") != -1) {
                    return;
                }
                var data = JSON.parse(feeds);
                //get just followed feeds url
                if (typeof data.feedUrl != "undefined" && data.followed == "Y") {
                    $.get("https://ajax.googleapis.com/ajax/services/feed/load?num=50&v=1.0&q=" + data.feedUrl, function(responseFeeds) {
                        if (responseFeeds.responseData != null) {
                            if (counter == 0) {
                                clearStorage = true;
                            } else if (counter == 1) {
                                clearStorage = false;
                            }
                            if (clearStorage) {
                                chrome.storage.local.clear();
                            }
                            //for each on all feeds
                            var entries = responseFeeds.responseData.feed.entries;
                            $.each(entries, function(index2, entry) {
                                var entryTitle = entry.title;
                                var entryLink = entry.link;
                                var entryDescription = entry.contentSnippet;
                                var websiteTitle = data.websiteTitle;
                                var direction = data.direction;
                                var entryImage = "../images/no-image.png";
                                if (typeof entry.mediaGroups != "undefined") {
                                    entryImage = entry.mediaGroups[0].contents[0].url;
                                } else {
                                    var entryImageRegx = /<img[^>]+src="((http|https):\/\/[^">]+?(\.jpg|\.png))"/g;
                                    var imageRegxTest = entryImageRegx.exec(entry.content);
                                    entryImage = imageRegxTest !== null ? imageRegxTest[1] : "../images/no-image.png";
                                }
                                //Check favorites to show unfavorite button
                                chrome.storage.sync.get("fav_" + entryLink, function(favEntry) {
                                    var favorite = $.isEmptyObject(favEntry) ? "N" : "Y";
                                    var obj = {};
                                    var key = entryLink;
                                    obj[key] += entryLink;
                                    var json = {
                                        "entryCounter": feedCounter,
                                        "entryTitle": entryTitle,
                                        "entryLink": entryLink,
                                        "direction": direction,
                                        "entryDescription": entryDescription,
                                        "entryImage": entryImage,
                                        "websiteTitle": websiteTitle,
                                        "favorite": favorite
                                    };
                                    obj[key] = JSON.stringify(json);
                                    chrome.storage.local.set(obj);
                                    $('<li data-counter="' + feedCounter + '" class="' + (index2 == entries.length - 1 ? "splitter" : "") + ' rsst-feeds" data-feed-url="' + entryLink + '">\
                                            <div class="feed-image">\
                                                <img src="' + entryImage + '" />\
                                            </div>\
                                            <div class="feed-info ' + (direction == "rtl" ? "rtl" : "ltr") + '">\
                                                <a target="_blank" href="' + entryLink + '">' + entryTitle + ' <span class="website-title">[' + websiteTitle + ']</span></a>\
                                                <a target="_blank" href="' + entryLink + '">' + entryDescription + '</a>\
                                            </div>\
                                            <div class="share-feed-btns">\
                                                <a title="Share on Facebook" target="_blank" href="https://www.facebook.com/dialog/feed?app_id=627072280724068&ref=adcounter&link=' + entryLink + '&name=' + entryTitle + '&redirect_uri=https://www.facebook.com&actions=%5B%7B%22name%22%3A%22Download%20More%20Extensions%22%2C%22link%22%3A%22http%3A%2F%2Fgoo.gl/YuwJ5P%22%7D%5D"><img src="images/Facebook.png" height="16" width="16"/> </a>\
                                                <a title="Share on Twitter" target="_blank" href="https://twitter.com/share?via=_MBanna&text=' + entryTitle + " " + entryLink + '"><img src="images/Twitter.png" height="16" width="16"/> </a>\
                                                <a title="Share on Google+" target="_blank" href="https://plus.google.com/share?url=' + entryLink + '"><img src="images/GooglePlus.png" height="16" width="16"/> </a>\
                                                <a class="uibutton special favorite-feed ' + (favorite == "Y" ? "special-active" : "") + '" href="#">' + (favorite == "Y" ? "Unfavorite" : "Favorite") + '</a>\
                                            </div>\
                                        </li>').appendTo(".feeds-content-list").data(json);
                                    ++feedCounter;
                                }); //get fav feeds
                            }); //for each for all entities
                        } //If there is feeds respons == url is right.
                        ++counter;
                    }, "jsonp").complete(function() {
                        $(".feeds-content-list .loaderImg").fadeOut();
                    });
                } //end if to get followed feeds urls
            }); //end each
        });
    }); //end event
    //----------------------------------------------------------------------------------//
    //On Favorite feed clicked
    $("body").on("click", "#tab-1 .favorite-feed", function() {
        var feedLink = $(this).parents(".rsst-feeds").attr("data-feed-url");
        var json = $(this).parents(".rsst-feeds").data();
        //Unfave
        if ($(this).hasClass("special-active")) {
            chrome.storage.sync.remove("fav_" + feedLink);
            $(this).removeClass("special-active");
            $(this).text("Favorite");
            $(".favorit-feeds-content-list li[data-feed-url='" + feedLink + "']").remove();
        } else {
            //Save to LOCAL storage
            json.favorite = "Y";
            var obj = {};
            var key = feedLink;
            obj[key] += feedLink;
            obj[key] = JSON.stringify(json);
            chrome.storage.local.set(obj);
            obj = {};
            key = "fav_" + feedLink;
            obj[key] += "fav_" + feedLink;
            obj[key] = JSON.stringify(json);
            chrome.storage.sync.set(obj);
            $('<li class="rsst-feeds" data-feed-url="' + json.entryLink + '">\
                <div class="feed-image">\
                    <img src="' + json.entryImage + '" />\
                </div>\
                <div class="feed-info ' + (json.direction == "rtl" ? "rtl" : "ltr") + '">\
                    <a target="_blank" href="' + json.entryLink + '">' + json.entryTitle + ' <span class="website-title">[' + json.websiteTitle + ']</span></a>\
                    <a target="_blank" href="' + json.entryLink + '">' + json.entryDescription + '</a>\
                </div>\
                <div class="share-feed-btns">\
                    <a href=""><img src="images/Facebook.png" height="16" width="16"/> </a>\
                    <a href=""><img src="images/Twitter.png" height="16" width="16"/> </a>\
                    <a href=""><img src="images/GooglePlus.png" height="16" width="16"/> </a>\
                    <a class="uibutton special special-active favorite-feed" href="#">Unfavorite</a>\
                </div>\
            </li>').appendTo(".favorit-feeds-content-list").data(json);
            $(this).addClass("special-active");
            $(this).text("Unfavorite");
        } //end else fave this
    });
    //Image Preview for feeds
    var showFeedImageTimeout = null;
    $("body").on("mouseenter mouseleave", ".current .feed-image img", function(ev) {
        if (ev.type === 'mouseenter' && $(this).attr("src").indexOf("http") == 0) {
            var feedImg = $(this).attr("src");
            showFeedImageTimeout = setTimeout(function() {
                $(".current .image-preview img").attr("src", feedImg);
                $(".current .image-preview").fadeIn("fast");
                $(".current .image-preview").css({
                    "left": (500 - $(".current .image-preview").width()) / 2,
                    "top": (600 - $(".current .image-preview").height()) / 2
                });
            }, 400);
        } else if (ev.type === 'mouseleave') {
            if (showFeedImageTimeout) {
                clearTimeout(showFeedImageTimeout);
                $(".current .image-preview").fadeOut("fast");
            }
        }
    });
    //Go to top in one click
    $("body").on("click", "#goUpLink", function() {
        $(".tab-content.current").animate({
            scrollTop: 0,
            complete: function() {
                $(".tab-content.current").scrollTop("0");
            }
        });
    });
    //--------------------------------------------------------------//
    //Save settings current tab
    $("body").on("click", ".tab-link", function() {
        syncStorage("setting_currentTab", $(this).index());
    });
    //--------------------------------------------------------------//
    //Load settings
    function loadSettings() {
        chrome.storage.sync.get(["setting_currentTab", "setting_currentScroll"], function(result) {
            //Current Tab
            if (typeof result.setting_currentTab != "undefined") {
                clearContent();
                $('ul.tabs li').removeClass('current');
                $('.tab-content').removeClass('current');
                //If the user inside favorite tab.
                if (result.setting_currentTab == 0) {
                    loadFeeds(function() {
                        sortArray($(".feeds-content-list li"));
                    });
                } else if (result.setting_currentTab == 1) {
                    loadFavoriteFeeds();
                } else if (result.setting_currentTab == 3) {
                    loadProducts();
                } else if (result.setting_currentTab == 4) {
                    $(".social-media").prepend('<iframe src="https://www.facebook.com/plugins/likebox.php?href=https%3A%2F%2Fwww.facebook.com%2FMBanna.info&amp;width=250&amp;height=250&amp;colorscheme=light&amp;show_faces=true&amp;header=false&amp;stream=false&amp;show_border=false&amp;appId=627072280724068" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:250px; height:210px;" allowTransparency="true"></iframe>');
                }
                $(".tab-content").eq(result.setting_currentTab).addClass("current");
                $("ul.tabs li").eq(result.setting_currentTab).addClass("current");
            } else {
                syncStorage("setting_currentTab", "0");
                loadFeeds(function() {
                    sortArray($(".feeds-content-list li"));
                });
            }
            if (typeof result.setting_currentScroll != "undefined") {
                $('ul.tabs li').removeClass('current');
                $('.tab-content').removeClass('current');
                $(".tab-content").eq(result.setting_currentTab).addClass("current");
                $("ul.tabs li").eq(result.setting_currentTab).addClass("current");

                //--------------------Scroll ------------------//
                var scrollTime = false;
                $('.current.tab-content').enscroll({
                    verticalTrackClass: 'track4',
                    verticalHandleClass: 'handle4',
                    minScrollbarLength: 28,
                    showOnHover: false
                }).bind("scroll", function() {
                    var currentBanel = $(this);
                    if (scrollTime) {
                        clearTimeout(scrollTime);
                    }
                    scrollTime = setTimeout(function() {
                        syncStorage("setting_currentScroll", $(currentBanel).scrollTop())
                    }, 300);
                });

                setTimeout(function() {
                    $(".tab-content.current").scrollTop(result.setting_currentScroll);
                }, 500);
            }
        });
    }
    //----------------------------------------------------------------------------------//
    function loadFavoriteFeeds() {
        //get all favorites feeds
        chrome.storage.sync.get(null, function(result) {
            $.each(result, function(index, data) {
                if (index.indexOf("fav_") != -1) {
                    var json = JSON.parse(data);
                    $('<li class="rsst-feeds" data-feed-url="' + json.entryLink + '">\
                    <div class="feed-image">\
                        <img src="' + json.entryImage + '" />\
                    </div>\
                    <div class="feed-info ' + (json.direction == "rtl" ? "rtl" : "ltr") + '">\
                        <a target="_blank" href="' + json.entryLink + '">' + json.entryTitle + ' <span class="website-title">[' + json.websiteTitle + ']</span></a>\
                        <a target="_blank" href="' + json.entryLink + '">' + json.entryDescription + '</a>\
                    </div>\
                    <div class="share-feed-btns">\
                        <a title="Share on Facebook" target="_blank" href="https://www.facebook.com/dialog/feed?app_id=627072280724068&ref=adcounter&link=' + json.entryLink + '&name=' + json.entryTitle + '&redirect_uri=https://www.facebook.com&actions=%5B%7B%22name%22%3A%22Download%20More%20Extensions%22%2C%22link%22%3A%22http%3A%2F%2Fgoo.gl/YuwJ5P%22%7D%5D"><img src="images/Facebook.png" height="16" width="16"/> </a>\
                        <a title="Share on Twitter" target="_blank" href="https://twitter.com/share?via=_MBanna&text=' + json.entryTitle + " " + json.entryLink + '"><img src="images/Twitter.png" height="16" width="16"/> </a>\
                        <a title="Share on Google+" target="_blank" href="https://plus.google.com/share?url=' + json.entryLink + '"><img src="images/GooglePlus.png" height="16" width="16"/> </a>\
                        <a class="uibutton special special-active favorite-feed" href="#">Unfavorite</a>\
                    </div>\
                </li>').appendTo(".favorit-feeds-content-list").data(json);
                }
            });
            $(".favorit-feeds-content-list .loaderImg").fadeOut();
        });
    }
    //----------------------------------------------------------------------------------//
    //Load feeds from LOCAL storage when the popup is opened
    function loadFeeds(callback) {
        chrome.storage.local.get(null, function(feeds) {
            $.each(feeds, function(index2, entries) {
                var entry = JSON.parse(entries);
                var entryCounter = entry.entryCounter;
                var entryTitle = entry.entryTitle;
                var entryLink = entry.entryLink;
                var entryDescription = entry.entryDescription;
                var websiteTitle = entry.websiteTitle;
                var direction = entry.direction;
                var entryImage = entry.entryImage
                var favorite = entry.favorite;
                $('<li data-counter="' + entryCounter + '" class="' + (index2 == feeds.length - 1 ? "splitter" : "") + ' rsst-feeds" data-feed-url="' + entryLink + '">\
                    <div class="feed-image">\
                        <img src="' + entryImage + '" />\
                    </div>\
                    <div class="feed-info ' + (direction == "rtl" ? "rtl" : "ltr") + '">\
                        <a target="_blank" href="' + entryLink + '">' + entryTitle + ' <span class="website-title">[' + websiteTitle + ']</span></a>\
                        <a target="_blank" href="' + entryLink + '">' + entryDescription + '</a>\
                    </div>\
                    <div class="share-feed-btns">\
                        <a title="Share on Facebook" target="_blank" href="https://www.facebook.com/dialog/feed?app_id=627072280724068&ref=adcounter&link=' + entryLink + '&name=' + entryTitle + '&redirect_uri=https://www.facebook.com&actions=%5B%7B%22name%22%3A%22Download%20More%20Extensions%22%2C%22link%22%3A%22http%3A%2F%2Fgoo.gl/YuwJ5P%22%7D%5D"><img src="images/Facebook.png" height="16" width="16"/> </a>\
                        <a title="Share on Twitter" target="_blank" href="https://twitter.com/share?via=_MBanna&text=' + entryTitle + " " + entryLink + '"><img src="images/Twitter.png" height="16" width="16"/> </a>\
                        <a title="Share on Google+" target="_blank" href="https://plus.google.com/share?url=' + entryLink + '"><img src="images/GooglePlus.png" height="16" width="16"/> </a>\
                        <a class="uibutton special favorite-feed ' + (favorite == "Y" ? "special-active" : "") + '" href="#">' + (favorite == "Y" ? "Unfavorite" : "Favorite") + '</a>\
                    </div>\
                </li>').appendTo(".feeds-content-list").data(entry);
            });
            //Sort feeds
            if (callback) {
                callback.call(this);
                //Remove loader of feed image
                setTimeout(function() {
                    $(".feed-image img").css("background-image", "none");
                }, 20000);
            }
        });
    }
    //----------------------------------------------------------------------------------//
    function loadProducts() {
        $(".my-products-list .loaderImg").fadeIn();
        $.getJSON("http://www.mbanna.info/extensions/products.json", function(json, textStatus) {
            if (json.length <= 0) {
                return;
            }
            $.each(json, function(index, el) {
                var node = $('<li class="products-list">\
                        <div class="products-list-image">\
                            <img src="' + escapeHTML(el[2]) + '" />\
                        </div>\
                        <div class="products-info">\
                            <a title="' + escapeHTML(el[0]) + '" target="_blank" href="' + escapeHTML(el[3]) + '">' + escapeHTML(el[0]) + '</a>\
                            <a title="' + escapeHTML(el[1]) + '" target="_blank" href="' + escapeHTML(el[3]) + '">' + escapeHTML(el[1]) + '</a>\
                        </div>\
                    </li>').appendTo($(".my-products-list"));
            });
            $(".my-products-list .loaderImg").fadeOut();
        });
    }
});