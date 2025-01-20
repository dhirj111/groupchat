document.addEventListener("DOMContentLoaded", () => {

  let msgform = document.getElementById("messageForm");

  // console.log("chats arr ", chatsarr);

  // console.log(lastid)
  let lastid = 0;
  console.log(lastid)
  const fetchData = () => {
    console.log(lastid)
    axios.get(`http://localhost:3000/messages/${lastid}`, {
      headers: {
        token: localStorage.getItem("user jwt")
      }
    })
      .then((response) => {
        console.log(response.data.message)

        let chats = localStorage.getItem('chats')
        if (chats == null) {
          localStorage.setItem('chats', '[]')
          chats = localStorage.getItem('chats')
        }
        const chatsarr = JSON.parse(chats);
        if (chatsarr.length != 0) {
          lastid = chatsarr[chatsarr.length - 1].id
        }
        console.log(response.data.change)
        if (response.data.change) {
          const mergedArray = chatsarr.concat(response.data.messages);
          // Convert merged array to a string
          const resultString = JSON.stringify(mergedArray);
          localStorage.setItem('chats', resultString)
          response.data.messages.forEach((product) => {
            let chatcontainer = document.getElementById("chats");
            let msgdiv = document.createElement('div');
            msgdiv.className = 'message'; // Add a class for consistent styling
            msgdiv.textContent = `${product.name}:  ${product.msg}`; // Use textContent for plain text to avoid potential XSS attacks
            chatcontainer.appendChild(msgdiv); // Append the new message
          });
        }

        // console.log(response.data)
        // // Clear existing list
        // document.getElementById("chats").innerHTML = "";
        // // Iterate through all products and create list items
        // response.data.messages.forEach((product) => {
        //   let chatcontainer = document.getElementById("chats");
        //   let msgdiv = document.createElement('div');
        //   msgdiv.className = 'message'; // Add a class for consistent styling
        //   msgdiv.textContent = `${product.name}:  ${product.msg}`; // Use textContent for plain text to avoid potential XSS attacks
        //   chatcontainer.appendChild(msgdiv); // Append the new message
        // });
      });

  };

  // fetchData()
  setInterval(() => fetchData(), 2000);

  const defaultFormSubmit = (event) => {
    event.preventDefault();

    const msg = event.target.usermessage.value;
    console.log(msg)

    axios
      .post("http://localhost:3000/messagesubmit", { msg: msg }, { headers: { token: localStorage.getItem("user jwt") } })
      .then((response) => {
        console.log('message recorded successfully!');
        // console.log('Message recorded successfully!');

        // let chatcontainer = document.getElementById("chats");
        // console.log(chatcontainer);

        // let msgdiv = document.createElement('div');
        // msgdiv.className = 'message'; // Add a class for consistent styling
        // msgdiv.textContent = `${response.data.name}:  ${msg}`; // Use textContent for plain text to avoid potential XSS attacks
        // console.log(msgdiv);

        // chatcontainer.appendChild(msgdiv); // Append the new message

        ; // Refresh the list

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