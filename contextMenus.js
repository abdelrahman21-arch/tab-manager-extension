const getTabGroups = async () => {
    let lists = await chrome.tabGroups.query({});
    return lists;
}

const groupAddition = async (ID, groups) => {
    try {
        for (let index = 0; index < groups.length; index++) {
            chrome.contextMenus.create({
                title: groups[index].title,
                id: index.toString(),
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
        let group_name;
        // popup to recieve the group name
        chrome.windows.create({
            url: chrome.runtime.getURL('HTMLs/group_name.html'),
            type: 'popup'
        });
        // save the recieved name in a variable
        const getName = new Promise((resolve, reject) => {
            chrome.runtime.onMessage.addListener((message) => {
                if (message) {
                    resolve(message);
                } else {
                    reject('Still to recieve name');
                }
            });
        });
        group_name = await getName;

        let tab = await chrome.tabs.create({url: link});
        chrome.tabs.group({tabIds: [tab.id]}, (id) => {
            chrome.tabGroups.update(id, {
                title: group_name
            });
            // console.log('Group is named: ' + group_name);
            // console.log('Its ID is: ' + id);
        });
    } catch (e) {
        console.log(e);
    }
}

const contextMenuLayout = () => {
    chrome.contextMenus.create({
        title: 'Group',
        id: 'groupOPtions',
        contexts: ['link'],
    });
    chrome.contextMenus.create({
        title: 'Add to exsisting',
        id: 'addToGroup',
        parentId: 'groupOPtions',
        contexts: ['link']
    }, () => groupAddition('addToGroup'));
    chrome.contextMenus.create({
        title: 'Create new group',
        id: 'newGroup',
        parentId: 'groupOPtions',
        contexts: ['link']
    });
    chrome.contextMenus.onClicked.addListener(clicked => {
        if (clicked.menuItemId === 'newGroup') {
            makeGroup(clicked.linkUrl);
        }
    });

    // Update when a group is created
    chrome.tabGroups.onCreated.addListener(async () => {
        let GroupList = await getTabGroups();
        console.log(GroupList);
        groupAddition('addToGroup', GroupList);
    });
    // Update when a group is removed
    chrome.tabGroups.onRemoved.addListener(async () => {
        let GroupList = await getTabGroups();
        console.log(GroupList);
        groupAddition('addToGroup', GroupList);
    });
};
