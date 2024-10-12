let closeBUTTON = document.getElementById('abort');
closeBUTTON.addEventListener('click', () => {
    close();
});

let saveButton = document.getElementById('save');
saveButton.addEventListener('click', () => {
    let text = document.getElementById('group_name');
    if (!text.value) {
        alert('still empty');
    } else {
        chrome.runtime.sendMessage(text.value);
        close();
    }
});

