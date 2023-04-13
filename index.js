const checkForKey = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['openai-key'], (result) => {
      resolve(result['openai-key']);
    });
  });
};

function safeKey() {
  const input = document.getElementById('key_input');

  if (input) {
    const encodedValue = btoa(input.value)

    chrome.storage.local.set({'openai-key': encodedValue}, () => {
      document.getElementById('key_needed').style.display = 'none';
      document.getElementById('key_entered').style.display = 'block';
    })

  }
}

function changeKey() {
  document.getElementById('key_needed').style.display = 'block';
  document.getElementById('key_entered').style.display = 'none';
}

document.getElementById('save_key_button').addEventListener('click', safeKey);
document.getElementById('change_key_button').addEventListener('click', changeKey);

checkForKey().then((response) => {
  if (response) {
    document.getElementById('key_needed').style.display = 'none';
    document.getElementById('key_entered').style.display = 'block';
  }
});