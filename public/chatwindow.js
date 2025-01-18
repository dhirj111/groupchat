document.addEventListener("DOMContentLoaded", () => {

  let msgform = document.getElementById("messageForm");










  const fetchData = () => {
    axios.get("http://localhost:3000/messages", {
      headers: {
        token: localStorage.getItem("user jwt")
      }
    })
      .then((response) => {

        console.log(response.data)
        // Clear existing list
        document.getElementById("chats").innerHTML = "";

        // Iterate through all products and create list items
        response.data.messages.forEach((product) => {
          console.log("product is   ", product)
          let chatcontainer = document.getElementById("chats");
          console.log(chatcontainer);

          let msgdiv = document.createElement('div');
          msgdiv.className = 'message'; // Add a class for consistent styling
          msgdiv.textContent = `${product.name}:  ${product.msg}`; // Use textContent for plain text to avoid potential XSS attacks
          console.log(msgdiv);
          chatcontainer.appendChild(msgdiv); // Append the new message
        });
      });

  };
  fetchData()











  const defaultFormSubmit = (event) => {
    event.preventDefault();

    const msg = event.target.usermessage.value;
    console.log(msg)

    axios
      .post("http://localhost:3000/messagesubmit", { msg: msg }, { headers: { token: localStorage.getItem("user jwt") } })
      .then((response) => {
        console.log('message recorded successfully!');
        console.log('Message recorded successfully!');

        let chatcontainer = document.getElementById("chats");
        console.log(chatcontainer);

        let msgdiv = document.createElement('div');
        msgdiv.className = 'message'; // Add a class for consistent styling
        msgdiv.textContent = `${response.data.name}:  ${msg}`; // Use textContent for plain text to avoid potential XSS attacks
        console.log(msgdiv);

        chatcontainer.appendChild(msgdiv); // Append the new message

        // fetchData(); // Refresh the list
        // isLeaderboardLoaded = false;
        // form.reset(); // Clear the form
      })
      .catch((error) => {
        console.error('Error details:', error.response ? error.response.data : error.message);
        alert('Failed to create product');
      });



  };

  // Set the default form submit handler
  msgform.addEventListener("submit", defaultFormSubmit);




})