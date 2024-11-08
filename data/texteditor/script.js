const textbox = document.getElementById("textbox");
// Set the initial text
textbox.value = "Try correcting theee misspelled word.\n\nThen highlight this sentence by dwell and drag.\n\nGreat! Feel free to type your own message.";
// Add an event listener to handle user input
textbox.addEventListener("input", function(event) {
  // Get the current text
  const text = textbox.textContent;
  // Handle backspace key
  if (event.key === "Backspace") {
    // Remove the last character from the text
    textbox.textContent = text.slice(0, -1);
  }
  // Handle other keys
  else {
    // Append the new character to the text
    textbox.textContent += event.key;
  }
});