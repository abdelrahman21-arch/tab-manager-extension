const addTOGroup = () => {
    console.log('clicked add to group');
}

const makeGroup = async() => {
    try {
        let group_name = '';
        console.log('clicked new group');
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
    } catch (e) {
        console.log(e)
    }
    
}

const contextMenuLayout = () => {
    let parent = chrome.contextMenus.create({
        title: 'Group',
        id: 'groupOPtions',
        contexts: ['selection'],
    });
    chrome.contextMenus.create({
        title: 'Add to exsisting',
        id: 'addToGroup',
        parentId: parent,
        contexts: ['selection']
    });
    chrome.contextMenus.create({
        title: 'Create new group',
        id: 'newGroup',
        parentId: parent,
        contexts: ['selection']
    });
    chrome.contextMenus.onClicked.addListener(clicked => {
        if (clicked.menuItemId === "newGroup") {
            makeGroup();
        }
        else {
            addTOGroup();
        }
    });
};
