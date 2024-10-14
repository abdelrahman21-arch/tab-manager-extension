/* file: background.js
 * Author: Sweilam
 * Description: File to handle background processes
 */

/**
 * This function closes duplicate  tabs
 *
 * @returns {void} Returns nothing
 */
importScripts('contextMenus.js');
contextMenuLayout();

async function closeDuplicateTabs() {
    try {
        const tabs = await chrome.tabs.query({});
        const urls = {};
        let duplicateClosed = 0;

        for (const tab of tabs) {
            const url = tab.url;
            if (!urls[url]) {
                urls[url] = true;
            } else {
                await chrome.tabs.remove(tab.id);
                duplicateClosed += 1;
            }

        }
        console.log(`${duplicateClosed} closed duplicate tabs.`);
    } catch (e) {
        e.error("Failed to close duplicate tabs.", e);

    }
};

/**
 * This function suspends inactive tabs
 *
 * @returns {void} Returns nothing
 */

async function suspendInactiveTabs() {
    try {
        const tabs = await chrome.tabs.query({active: false, discarded: false});
        let suspendedTabs = 0;
        for (const tab of tabs) {
            if (!tab.pinned) {
                await chrome.tabs.discard(tab.id);
                suspendedTabs += 1;
            }


        }
        console.log(`${suspendedTabs} inactive tabs suspended.`);
    } catch(e)
    {
        e.error("Failed to suspend inactive tabs.", e);
    }


}

const searchMessage = (message) => {
        if (message) {
            resolve(message);
            cleanupAfterPopup();
        } else {
            reject('no search term');
        }
    };

/**
 * This function searches the tabs and changes the view to it if any.
 *
 * @returns {void} Returns nothing
*/
const searchTabs = async() => {
    const searchTerm = await new Promise((resolve, reject) => {
        console.log('start search');
        chrome.windows.create({
            url: chrome.runtime.getURL('HTMLs/searchTabsTitles.html'),
            type: 'popup'
        });
        const oneTimeMessageListener = (message) => {
            if (message) {
                resolve(message);
            } else {
                reject('No name received');
            }
            chrome.runtime.onMessage.removeListener(oneTimeMessageListener);
        };
        chrome.runtime.onMessage.addListener(oneTimeMessageListener);
    });

    let res = await chrome.tabs.query({}, (tabs) => {
        for (let index = 0; index < tabs.length; index++) {
            if (tabs[index].title.toLowerCase().includes(searchTerm)) {
                console.log(tabs[index].id);
                chrome.tabs.update(tabs[index].id, { active: true });
            }
        }
    });
    console.log(res);
};

chrome.commands.onCommand.addListener((command) => {
  if (command === 'close-duplicate-tabs') {
    closeDuplicateTabs();
  } else if (command === 'suspend-inactive-tabs') {
    suspendInactiveTabs();
  } else if (command === 'Search-tabs') {
    searchTabs();
  }
});
