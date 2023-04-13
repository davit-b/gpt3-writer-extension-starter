function getKey(){
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['openai-key'], (result) => {
      if (result['openai-key']) {
        const decodedKey = atob(result['openai-key']);
        resolve(decodedKey);
      }
    });
  });
}

async function generate(prompt) { 
  const key = await getKey();
  const url = "https://api.openai.com/v1/completions";

  const completionResponse = await fetch(url, {
    method: "POST",
    headers: {
      'Content-Type': "application/json",
      Authorization: `Bearer ${key}`
    }, 
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 1250,
      temperature: 0.7,
    })
  });

  const completion = await completionResponse.json();
  return completion.choices.pop();
}

async function generateCompletionAction(info){
  try {
    // Send message with generating tet
    sendMessage('generating...');

    // This is what was highlighted.
    const { selectionText } = info;
    const basePromptPrefix = `
      Translate the following text from it's native language into English. Infuse an optimistic tone and adjust for meaning.
    
      Text:
    `; 
    const baseCompletion = await generate(`${basePromptPrefix}${selectionText}`);
    console.log("first translation", baseCompletion.text)
    
    const secondPrompt = `
    Take the following text and rewrite it in the voice of Socrates

    Original: ${baseCompletion.text}

    New Text:
    `;

    const secondPromptCompletion = await generate(secondPrompt)
    console.log("socrates voice", secondPromptCompletion.text)
    sendMessage(secondPromptCompletion.text)

  } catch (e) {
    console.error(e);
    sendMessage(e.toString())
  }
}

function sendMessage(content) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    //  looking for which tab is currently active. 
    // In order to send a message we need to do it in an active tab
    console.log(tabs)
    const activeTab = tabs[0].id;


    // takes 3 things — tab, payload, and callback.
    // * Our payload is going to include a message called inject and 
    // * the content of whatever we have passed in
    chrome.tabs.sendMessage(
      activeTab,
      { message: 'inject', content },
      (response) => {
        console.log(response)
        if (response.status === 'failed') {
          console.log('injection failed.');
        }
      }
    );
  })
}

// When the extension is installed
// New option in our context menu called 'GPT4 translation' will appear
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'context-run',
    title: 'GPT4 Translation',
    contexts: ['selection'],
  });
});

// We setup a listener for whenever that is clicked to call generateCompletionAction.
chrome.contextMenus.onClicked.addListener(generateCompletionAction);