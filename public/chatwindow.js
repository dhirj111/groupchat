document.addEventListener("DOMContentLoaded", () => {


  let msgform = document.getElementById("messageForm");


  const defaultFormSubmit = (event) => {
    event.preventDefault();

    const msg = event.target.usermessage.value;
    console.log(msg)

    axios
      .post("http://localhost:3000/messagesubmit", { msg: msg }, { headers: { token: localStorage.getItem("user jwt") } })
      .then((response) => {
        console.log('message recorded successfully!');
        let chatcontainer = document.getElementById("chats");
        console.log(chatcontainer)
        let msgdiv = document.createElement('div');
        msgdiv.innerHTML = `${msg}`;
        console.log(msgdiv)
        chatcontainer.appendchild(msgdiv)

        //fetchData(); // Refresh the list
        //isLeaderboardLoaded = false;
        //form.reset(); // Clear the form
      })
      .catch((error) => {
        console.error('Error details:', error.response ? error.response.data : error.message);
        alert('Failed to create product');
      });



  };

  // Set the default form submit handler
  msgform.addEventListener("submit", defaultFormSubmit);




})