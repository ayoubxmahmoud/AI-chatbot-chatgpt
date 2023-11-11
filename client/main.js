// Import SVG images for the bot and user avatars
import bot from './assets/bot.svg';
import user from './assets/user.svg';

// Select the form element and the chat container from the HTML
const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

// Initialize a variable to hold the loading interval
let loadInterval;

// Function to create a loading animation
function loader(element) {
  // Clear the content of the provided element
  element.textContent = '';

  // Start an interval to add loading dots to the element
  loadInterval = setInterval(() => {
    element.textContent += '.';
  
    // Reset when it reaches '....'
    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

// Function to type text into an element
function typeText(element, text) {
  let index = 0;

  // Start an interval to add characters to the element one at a time
  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

// Function to generate a unique ID based on a timestamp and random number
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const randomNumberString = randomNumber.toString(32);

  return `${timestamp}-${randomNumberString}`;
}

// Function to create a chat message stripe based on user or AI
function chatStripe(isAi, value, uniqueId) {
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img
            src="${isAi ? bot : user}"
            alt="${isAi ? 'bot' : 'user'}"
          />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>
    `
  )
}

// Function to handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // Add the user's chat stripe to the chat container
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset();

  // Add an empty AI chat stripe and scroll to the bottom of the chat container
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  // Start the loading animation
  loader(messageDiv);

  // create an HTTP post request and send it to the server
  const response = await fetch('http://localhost:5000/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  });

  // Stop the loading animation and clear the messageDiv
  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if(response.ok) {
    // If the response is successful, display the AI's response
    const data = await response.json();
    const parseData = data.bot.trim();

    typeText(messageDiv, parseData);
  } else {
    // If there's an error, display an error message and alert the user
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong"

    alert(err);
  }
}

// Listen for the form submission and Enter key press to handle user input
form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    handleSubmit(e);
  }
});
