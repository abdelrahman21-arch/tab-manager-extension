const getTabGroups = async () => {
    let lists = await chrome.tabGroups.query({});
    return lists;
}

const groupAddition = async (ID, groups) => {
    try {
        for (let index = 0; index < groups.length; index++) {
            chrome.contextMenus.create({
                title: groups[index].title,
                id: toString(Date.now()),
                parentId: ID,
                contexts: ['link']
            });
        }
    } catch (e) {
        console.log(e);
    }
}

const makeGroup = async(link) => {
    try {
        if (!link) {
            console.log('link is none');
        } else {
            console.log(link);
        }
        let groupName = await new Promise((resolve, reject) => {
            chrome.windows.create({
                url: chrome.runtime.getURL('HTMLs/group_name.html'),
                type: 'popup'
            });
            chrome.runtime.onMessage.addListener((message) => {
                if (message) {
                    // console.log('runed');
                    resolve(message);
                } else {
                    reject('No name received');
                }
            });
        });
        // console.log(groupName);

        let tab = await chrome.tabs.create({url: link});
        let groupID = await new Promise((resolve) => {
            chrome.tabs.group({ tabIds: [tab.id] }, (id) => {
                resolve(id);
            });
        });

        // Now update the group with the name
        chrome.tabGroups.update(groupID, {
            title: groupName
        });
        console.log(groupID);
        console.log(groupName);
    } catch (e) {
        console.log(e);
    }
}

const contextMenuLayout = () => {
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
        }, async () => {
            let GroupList = await chrome.tabGroups.query({});
            groupAddition('addToGroup', GroupList);
        });
        chrome.contextMenus.create({
            title: 'Create new group',
            id: 'newGroup',
            parentId: 'groupOPtions',
            contexts: ['link']
        });

        // Event listener for clicks on the context menu
        chrome.contextMenus.onClicked.addListener(clicked => {
            if (clicked.menuItemId === 'newGroup') {
                makeGroup(clicked.linkUrl);
            }
        });
        // Handle group changes dynamically
        chrome.tabGroups.onCreated.addListener(async () => {
            contextMenuLayout();  // Update context menus when a group is created
        });
        chrome.tabGroups.onRemoved.addListener(async () => {
            contextMenuLayout();  // Update context menus when a group is removed
        });
    });
};
