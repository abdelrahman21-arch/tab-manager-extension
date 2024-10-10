let isPopupOpen = false; // To track if a popup is already open
let popupWindowId = null; // To track the popup window ID

const getTabGroups = async () => {
    return await chrome.tabGroups.query({});
};

const groupAddition = async (ID, groups) => {
    try {
        // Clear out existing group options to avoid duplication
        chrome.contextMenus.removeAll(() => {
            chrome.contextMenus.create({
                title: 'Group',
                id: 'groupOPtions',
                contexts: ['link'],
            });
            chrome.contextMenus.create({
                title: 'Add to existing',
                id: 'addToGroup',
                parentId: 'groupOPtions',
                contexts: ['link']
            });
            chrome.contextMenus.create({
                title: 'Create new group',
                id: 'newGroup',
                parentId: 'groupOPtions',
                contexts: ['link']
            });

            for (let index = 0; index < groups.length; index++) {
                chrome.contextMenus.create({
                    title: groups[index].title,
                    id: `group-${groups[index].id}`, // Ensure each group has a unique ID
                    parentId: ID,
                    contexts: ['link']
                });
            }
        });
    } catch (e) {
        console.log(e);
    }
};

const makeGroup = async (link) => {
    try {
        if (!link) {
            console.log('link is none');
            return;
        }

        if (isPopupOpen) {
            console.log('Popup already open, ignoring request.');
            return;  // Avoid opening multiple popups
        }

        isPopupOpen = true;  // Mark that a popup is open

        let groupName = await new Promise((resolve, reject) => {
            // Create popup to receive the group name
            chrome.windows.create({
                url: chrome.runtime.getURL('HTMLs/group_name.html'),
                type: 'popup'
            }, (popupWindow) => {
                popupWindowId = popupWindow.id; // Store the popup window ID

                // Add an event listener for when the popup is closed manually
                chrome.windows.onRemoved.addListener(function handlePopupClose(windowId) {
                    if (windowId === popupWindowId) {
                        console.log('Popup was closed manually.');
                        chrome.windows.onRemoved.removeListener(handlePopupClose); // Remove listener after it's triggered
                        cleanupAfterPopup();  // Reset popup state
                    }
                });
            });

            // Only listen for the message once to avoid multiple popups handling
            const oneTimeMessageListener = (message) => {
                if (message) {
                    resolve(message);
                    cleanupAfterPopup(); // Reset popup state when message is received
                } else {
                    reject('No name received');
                }
                chrome.runtime.onMessage.removeListener(oneTimeMessageListener); // Remove listener after it's done
            };
            chrome.runtime.onMessage.addListener(oneTimeMessageListener);
        });

        // Create new tab and group it
        let tab = await chrome.tabs.create({ url: link });
        let groupID = await chrome.tabs.group({ tabIds: [tab.id] });

        // Update the group with the provided name
        await chrome.tabGroups.update(groupID, { title: groupName });

        console.log(`Group created with ID: ${groupID}, Name: ${groupName}`);
    } catch (e) {
        console.log(e);
        cleanupAfterPopup();  // Ensure popup flag is reset in case of error
    }
};

const cleanupAfterPopup = () => {
    console.log('Resetting popup state.');
    isPopupOpen = false;
    popupWindowId = null;
};

const contextMenuLayout = () => {
    // First, clear any existing context menus to avoid duplication
    chrome.contextMenus.removeAll(() => {
        // Create the base menu layout
        chrome.contextMenus.create({
            title: 'Group',
            id: 'groupOPtions',
            contexts: ['link'],
        });
        chrome.contextMenus.create({
            title: 'Add to existing',
            id: 'addToGroup',
            parentId: 'groupOPtions',
            contexts: ['link']
        });
        chrome.contextMenus.create({
            title: 'Create new group',
            id: 'newGroup',
            parentId: 'groupOPtions',
            contexts: ['link']
        });

        // Event listener for context menu click
        chrome.contextMenus.onClicked.addListener(clicked => {
            if (clicked.menuItemId === 'newGroup') {
                makeGroup(clicked.linkUrl);
            }
        });
    });

    // Handle group changes dynamically
    chrome.tabGroups.onCreated.removeListener(updateContextMenu); // Remove previous listeners
    chrome.tabGroups.onCreated.addListener(updateContextMenu);    // Add new listener

    chrome.tabGroups.onRemoved.removeListener(updateContextMenu); // Remove previous listeners
    chrome.tabGroups.onRemoved.addListener(updateContextMenu);    // Add new listener
};

// Function to update the context menu when groups change
const updateContextMenu = async () => {
    let GroupList = await getTabGroups();
    await groupAddition('addToGroup', GroupList);
};

// Initialize the context menu layout when the extension is loaded
contextMenuLayout();
