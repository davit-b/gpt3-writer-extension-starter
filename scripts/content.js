// This file will hold all of our scripts for the
// frontend of our extension, such as DOM manipulation 🤘.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'inject') {
    const { content } = request;

    console.log(content);

    sendResponse({ status: 'success' });
  }
});