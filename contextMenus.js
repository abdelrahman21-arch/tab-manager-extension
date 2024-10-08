const addTOGroup = () => {
}

const makeGroup = async(link) => {
    try {
        let group_name;
        chrome.windows.create({
            url: chrome.runtime.getURL("HTMLs/group_name.html"),
            type: "popup"
        });
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
        console.log(e)
    }    
}

const contextMenuLayout = () => {
    let parent = chrome.contextMenus.create({
        title: 'Group',
        id: 'groupOPtions',
        contexts: ['link'],
    });
    chrome.contextMenus.create({
        title: 'Add to exsisting',
        id: 'addToGroup',
        parentId: parent,
        contexts: ['link']
    });
    chrome.contextMenus.create({
        title: 'Create new group',
        id: 'newGroup',
        parentId: parent,
        contexts: ['link']
    });
    chrome.contextMenus.onClicked.addListener(clicked => {
        if (clicked.menuItemId === "newGroup") {
            makeGroup(clicked.linkUrl);
        }
        else {
            addTOGroup();
        }
    });
};
