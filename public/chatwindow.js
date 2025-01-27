document.addEventListener("DOMContentLoaded", () => {
  const inputContainer = document.querySelector('.input-container');

  let h2e = document.getElementById("currentgroupname")
  console.log(h2e, "hehe")
  if (inputContainer) {
    inputContainer.style.display = 'none'; // Hide the element
  }
  let groupname;
  // fetchData()
  let msgform = document.getElementById("messageForm");
  let chatcontainer = document.getElementById("chats");
  let ismemberofgroup = false
  // console.log("chats arr ", chatsarr);
  let groupid = false
  // console.log(lastid)
  let lastid = 0;
  console.log(lastid)


  const fetchData = () => {

    console.log("         d      ", groupid)
    if (ismemberofgroup) {
      if (inputContainer.style.display = 'none') {
        inputContainer.style.display = 'flex'; // Restore its display style

      }
      h2e.textContent = groupname;



      const adminSettingsButton = document.createElement("button");
      adminSettingsButton.id = "adminSettingsButton"; // Set an id for styling
      adminSettingsButton.textContent = "Admin Settings";

      // Append the button near the <h2> element
      h2e.appendChild(adminSettingsButton);

      // Add the click event listener to make the axios POST request
      adminSettingsButton.addEventListener("click", () => {
        console.log(groupid, "group id")
        axios
          .post("http://localhost:3000/admin-settings", { groupid: groupid }, { headers: { token: localStorage.getItem("user jwt") } })
          .then(response => {
            if (response.data.message === 'You are not an admin') {
              alert(response.data.message); // Notify the user
            } else {
              // Navigate to the new page
              window.location.href = `/groupsetting.html?groupid=${response.data.groupid}`;;
            }
          })
          .catch(error => {
            console.error('Error:', error);
          });


      });









      axios.get(`http://localhost:3000/messages/${lastid}`, {
        headers: {
          token: localStorage.getItem("user jwt"),
          groupId: groupid
        }
      })
        .then((response) => {

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
              let msgdiv = document.createElement('div');
              msgdiv.className = 'message'; // Add a class for consistent styling
              msgdiv.textContent = `${product.name}:  ${product.msg}`; // Use textContent for plain text to avoid potential XSS attacks
              chatcontainer.appendChild(msgdiv); // Append the new message
            });
          }
        });


    }
    else {
      console.log("in without membership");
      chatcontainer.innerHTML = "";
      console.log(document.getElementById("joindiv"));

      if (document.getElementById("joindiv")) {
        document.getElementById("joindiv").remove();
      }

      // Create the div element
      const groupDiv = document.createElement("div");
      groupDiv.id = "joindiv";
      groupDiv.setAttribute("data-group-id", `${groupid}`);
      groupDiv.textContent = `Group ID: ${groupid}`;



      // Create join button
      const joinButton = document.createElement("button");
      joinButton.textContent = "Join";

      // Add click event with Axios POST request
      joinButton.onclick = async () => {

        const groupId = groupDiv.getAttribute("data-group-id");
        axios.post("http://localhost:3000/joinbutton", {
          groupId: groupId,
        }, { headers: { token: localStorage.getItem("user jwt") } }).then((response) => {
          inputContainer.style.display = 'flex'; // Restore its display style
          console.log(response.data, " from join button")
        }
        )
      }

      // Append button to div
      groupDiv.appendChild(joinButton);
      console.log("last append", groupDiv);

      // Append div to body
      document.body.appendChild(groupDiv);
    }
  }



  let newgroup1 = document.getElementById("newgroupform1");
  console.log(newgroup1)

  const newgroupform = (event) => {
    event.preventDefault();
    console.log(" ok ")
    console.log(event.target.groupname.value)


    axios
      .post("http://localhost:3000/creategroup", { groupname: event.target.groupname.value }, { headers: { token: localStorage.getItem("user jwt") } })
      .then((response) => {
        console.log('message recorded successfully!');
      })
      .catch((error) => {
        console.error('Error details:', error.response ? error.response.data : error.message);
        alert('Failed to create product');
      });


  }
  newgroup1.addEventListener("submit", newgroupform)

  let publicgroups = document.getElementById("publicgroups")
  console.log("hi  ,", publicgroups)
  const fetchgroups = () => {
    axios.get('http://localhost:3000/fetchgroups')
      .then((response) => {
        response.data.groups.forEach(group => {
          let groupli = document.createElement("li");
          groupname = group.name
          console.log(group.name)
          groupli.textContent = group.name; // Use textContent for plain text


          groupli.addEventListener("click", () => {
            groupid = false
            axios
              .post("http://localhost:3000/joinstatus", { groupId: group.id }, { headers: { token: localStorage.getItem("user jwt") } })
              .then((response) => {
                groupid = group.id
                groupname = group.name;
                console.log(groupname, "4455")
                console.log(response)
                console.log("setted group id as", group.id)
                if (response.data.groupdetails) {
                  console.log("was true")
                  ismemberofgroup = true
                }
                fetchData()

              })
              .catch((error) => {
                console.error("Error joining group:", error);
              });
          });

          publicgroups.appendChild(groupli);
        });

      }
      )
  }
  fetchgroups()
  // setInterval(() => fetchData(), 2000);


  const defaultFormSubmit = (event) => {
    event.preventDefault();

    const msg = event.target.usermessage.value;
    console.log(msg)

    axios
      .post("http://localhost:3000/messagesubmit", { msg: msg, groupId: groupid }, { headers: { token: localStorage.getItem("user jwt") } })
      .then((response) => {
        console.log('message recorded successfully!');

      })
      .catch((error) => {
        console.error('Error details:', error.response ? error.response.data : error.message);
        alert('Failed to create product');
      });

  };

  // Set the default form submit handler
  msgform.addEventListener("submit", defaultFormSubmit);

})