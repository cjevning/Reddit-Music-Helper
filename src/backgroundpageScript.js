			function updateSettings() {
				chrome.windows.getCurrent(function(win) {
					// get an array of the tabs in the window
					chrome.tabs.getAllInWindow(win.id, function(tabs) {
						for(i in tabs)// loop over the tabs
						{
							chrome.tabs.sendRequest(tabs[i].id, {
								action : 'updateSettings',
								keyboardshortcut : localStorage["keyboardshortcut"],
								oldkeyboardshortcut : localStorage["oldkeyboardshortcut"]
							});
						}
					});
				});
			}

			function isTrueSet(value) {
				if (value.toLowerCase() == "true") return true;
				return false;
			}

			function isStandard(url, openyoutubelinks) {
				if ((url.indexOf("soundcloud") > -1) || (openyoutubelinks && (url.indexOf("youtu") > -1))) return true;
				return false;
			}

			function openInNewTab(link) {
				chrome.history.addUrl({
					url : link
				});
				chrome.tabs.create({
					url : link,
					selected : false
				});
			}

			chrome.tabs.onUpdated.addListener(function(tabID, changeInfo, tab) {
				if (changeInfo.status == "complete") {
					chrome.tabs.get(tabID, function(tab) {
						if (tab.url.indexOf("youtu") > -1 && !tab.highlighted ) {
							chrome.tabs.executeScript(tab.id, {code:"document.getElementsByClassName('video-stream')[0].pause()"});
						}
					});
				}
			})

			function openAllUrls(tab) {
				var openyoutubelinks = isTrueSet(localStorage["openyoutubelinks"]);
				var nonstandardlinks = localStorage["nonstandardlinks"];
				var openvisitedlinks = isTrueSet(localStorage["openvisitedlinks"]);
				var opennsfwlinks = isTrueSet(localStorage["opennsfwlinks"]);
				var tabslimit = parseInt(localStorage["tabslimit"]);
				chrome.tabs.sendRequest(tab.id, {
					action : 'openRedditLinks',
					tabid : tab.id
				}, function(response) {
					openUrl(response.urls, 0, response.tabid, openyoutubelinks, nonstandardlinks, openvisitedlinks, opennsfwlinks, tabslimit);
				});
			}

			function openUrl(urls, index, tabid, openyoutubelinks, nonstandardlinks, openvisitedlinks, opennsfwlinks, tabslimit) {
				if(tabslimit <= 0) {
					return;
				}
				var url = urls[index];
				if(!opennsfwlinks && ((url[0].toLowerCase().indexOf("nsfw") != -1) || url[3])) {
					openUrl(urls, index + 1, tabid, openyoutubelinks, nonstandardlinks, openvisitedlinks, opennsfwlinks, tabslimit);
					return;
				}
				var urlToOpen;
				var directURL = url[1];

				if(index == urls.length-1) {
					chrome.tabs.sendRequest(tabid, {
						action : 'openNextPage'
					});
					return;
				}

				var standard = isStandard(directURL, openyoutubelinks);
				if ((nonstandardlinks != "donothing") || standard) {
					if ((nonstandardlinks == "opencomments") && !standard) directURL = url[2];
					chrome.history.getVisits({
						url : directURL
					}, function(visitItems) {
						if(openvisitedlinks || (visitItems.length == 0)) {
							openInNewTab(directURL)
							openUrl(urls, index + 1, tabid, openyoutubelinks, nonstandardlinks, openvisitedlinks, opennsfwlinks, tabslimit-=1);
						}
						else {
							openUrl(urls, index + 1, tabid, openyoutubelinks, nonstandardlinks, openvisitedlinks, opennsfwlinks, tabslimit);
						}
					});
				}
				else {
					openUrl(urls, index + 1, tabid, openyoutubelinks, nonstandardlinks, openvisitedlinks, opennsfwlinks, tabslimit);
					return;
				}
			}

			function checkVersion() {

				function onInstall() {
					chrome.tabs.create({
						url : "options.html",
						selected : true
					});
				}

				function onUpdate() {
					chrome.tabs.create({
						url : "changelog.html",
						selected : true
					});
				}

				function getVersion() {
					var details = chrome.app.getDetails();
					return details.version;
				}

				// Check if the version has changed.
				var currVersion = getVersion();
				var prevVersion = localStorage['version']
				if(currVersion != prevVersion) {
					// Check if we just installed this extension.
					if( typeof prevVersion == 'undefined') {
						onInstall();
					} else {
						onUpdate();
					}
					localStorage['version'] = currVersion;
				}
			}

			function init() {

				var openyoutubelinks = localStorage["openyoutubelinks"];
				var nonstandardlinks = localStorage["nonstandardlinks"];
				var openvisitedlinks = localStorage["openvisitedlinks"];
				var opennsfwlinks = localStorage["opennsfwlinks"];
				var tabslimit = localStorage["tabslimit"];
				var keyboardshortcut = localStorage["keyboardshortcut"];

				localStorage["oldkeyboardshortcut"] = undefined;


				if(!openyoutubelinks) {
					localStorage["openyoutubelinks"] = "true";
				}

				if(!nonstandardlinks) {
					localStorage["nonstandardlinks"] = "opencomments";
				}

				if(!openvisitedlinks) {
					localStorage["openvisitedlinks"] = "false";
				}

				if(!opennsfwlinks) {
					localStorage["opennsfwlinks"] = "false";
				}			

				if(!tabslimit) {
					localStorage["tabslimit"] = 10;
				}

				if(!keyboardshortcut) {
					localStorage["keyboardshortcut"] = "Ctrl+Shift+F";
				}

				chrome.browserAction.onClicked.addListener(function(tab) {
					openAllUrls(tab);
				});

				chrome.extension.onRequest.addListener(function(request, sender, callback) {
					switch (request.action) {
						case 'keyboardShortcut':
							openAllUrls(sender.tab);
							break;

						case 'initKeyboardShortcut':
							chrome.tabs.sendRequest(sender.tab.id, {
								action : 'updateSettings',
								keyboardshortcut : localStorage["keyboardshortcut"]
							});
							break;

						default:
							break;
					}
				});
				checkVersion();
			}
			
document.addEventListener('DOMContentLoaded', function () {
  init();
});