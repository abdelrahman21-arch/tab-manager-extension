/* file: background.js
 * Author: Sweilam
 * Description: File to handle background processes
 */

/**
 * This function closes duplicate  tabs
 *
 * @returns {void} Returns nothing
 */
importScripts('contextMenus.js')
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

chrome.commands.onCommand.addListener((command) => {
  if (command === 'close-duplicate-tabs') {
    closeDuplicateTabs();
  } else if (command === 'suspend-inactive-tabs') {
    suspendInactiveTabs();
  }
});