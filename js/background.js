//Default replacements
var default_replacements = [
    ['Thomas', 'Meredith'],
];
//Default Whitelist
var default_whitelisted_sites = ["docs.google.com",
    "gmail.com",
    "mail.google.com",
    "mail.yahoo.com",
    "outlook.com",
]

debug = false;

function checkWhiteList(url, whitelist) {
    url = url.toLowerCase() || "";
    whitelist = whitelist || [];
    for (var i = whitelist.length - 1; i >= 0; i--) {
        if (url.indexOf(whitelist[i]) > -1) {
            return true;
        }
    };
    return true;
}

function injectionScript(tabId, info, tab) {
    if (debug) console.log("injection fire");
    chrome.storage.sync.get(null, function(result) {
        if (result["status"] === "enabled" && checkWhiteList(tab.url, result['whitelist'])) {
            chrome.tabs.executeScript(tabId, {
                file: "js/substitutions.js",
                runAt: "document_end"
            });
        }
    });
}

function addMessage(request, sender, sendResponse) {
    if (debug) console.log("message fire");
    chrome.storage.sync.get(null, function(result) {
        if (request === "config" && result["replacements"]) {
            sendResponse(result["replacements"]);
        }
    });
    return true;
}

function fixDataCorruption() {
    if (debug) console.log("updateStore");
    chrome.storage.sync.get(null, function(result) {
        if (!result["status"]) {
            chrome.storage.sync.set({
                "status": "enabled"
            });
        }
        if (!result["replacements"]) {
            chrome.storage.sync.set({
                "replacements": default_replacements
            });
        }
        if (!result["replacements"]) {
            chrome.storage.sync.set({
                "whitelist": default_whitelisted_sites
            });
        }
    });
}

function toggleActive() {
    if (debug) console.log("clickfire");
    chrome.storage.sync.get("status", function(result) {
        if (result["status"] === null) {
            status = "enabled";
        } else {
            status = result["status"];
        }
        if (status === "enabled") {
            icon = {
                "path": "images/disabled.png"
            };
            message = {
                "title": "Click to activate name replacement"
            };
            status = "disabled";
        } else if (status === "disabled") {
            icon = {
                "path": "images/enabled.png"
            };
            message = {
                "title": "Click to deactivate name replacement"
            };
            status = "enabled";
        }
        chrome.browserAction.setIcon(icon);
        chrome.browserAction.setTitle(message);
        chrome.storage.sync.set({
            "status": status
        });
    });
}

chrome.browserAction.onClicked.addListener(toggleActive);
chrome.runtime.onMessage.addListener(addMessage);
chrome.tabs.onUpdated.addListener(injectionScript);
chrome.runtime.onInstalled.addListener(fixDataCorruption);
chrome.runtime.onStartup.addListener(fixDataCorruption);