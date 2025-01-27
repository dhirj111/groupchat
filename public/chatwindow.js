document.addEventListener("DOMContentLoaded", () => {
  const inputContainer = document.querySelector('.input-container');
  const h2e = document.getElementById("currentgroupname");
  const msgform = document.getElementById("messageForm");
  const chatcontainer = document.getElementById("chats");
  const publicgroups = document.getElementById("publicgroups");

  let groupname;
  let ismemberofgroup = false;
  let groupid = false;
  let lastid = 0;

  // Connect to Socket.IO server
  const socket = io('http://localhost:3000');

  // Log connection status
  socket.on('connect', () => console.log('Connected to Socket.io server'));
  socket.on('connect_error', (err) => console.error('Socket.io connection error:', err));

  // Join group when group is selected
  const joinGroup = (groupId) => {
    console.log(`Joining group with ID: ${groupId}`);
    socket.emit('joinGroup', groupId);
  };

  // Fetch initial messages and set up real-time updates
  const fetchData = () => {
    if (ismemberofgroup) {
      inputContainer.style.display = 'flex';
      h2e.textContent = groupname;

      // Fetch initial messages
      axios.get(`http://localhost:3000/messages/${lastid}`, {
        headers: {
          token: localStorage.getItem("user jwt"),
          groupId: groupid
        }
      }).then((response) => {
        console.log("Messages fetched:", response.data);

        let chats = localStorage.getItem('chats');
        if (!chats) {
          localStorage.setItem('chats', '[]');
          chats = localStorage.getItem('chats');
        }

        const chatsarr = JSON.parse(chats);
        if (chatsarr.length > 0) {
          lastid = chatsarr[chatsarr.length - 1].id;
        }

        if (response.data.change) {
          const mergedArray = chatsarr.concat(response.data.messages);
          localStorage.setItem('chats', JSON.stringify(mergedArray));

          response.data.messages.forEach((product) => {
            const msgdiv = document.createElement('div');
            msgdiv.className = 'message';
            msgdiv.textContent = `${product.name}: ${product.msg}`;
            chatcontainer.appendChild(msgdiv);
          });
        }
      }).catch((err) => {
        console.error("Error fetching messages:", err);
      });

      // Listen for new messages
      socket.on('receiveMessage', (message) => {
        console.log("New message received:", message);
        const msgdiv = document.createElement('div');
        msgdiv.className = 'message';
        msgdiv.textContent = `${message.name}: ${message.msg}`;
        chatcontainer.appendChild(msgdiv);
      });
    } else {
      console.warn("User is not a member of the group.");
    }
  };

  // Handle form submission
  msgform.addEventListener("submit", (event) => {
    event.preventDefault();

    const msg = event.target.usermessage.value;
    const userId = localStorage.getItem("userId") || "unknown_user";
    const userName = localStorage.getItem("userName") || "Anonymous";

    if (!msg.trim()) {
      console.warn("Cannot send an empty message.");
      return;
    }

    console.log("Sending message:", { msg, groupId: groupid, userId, userName });

    // Emit the message to the server
    socket.emit('sendMessage', {
      msg,
      groupId: groupid,
      userId,
      userName
    });

    // Clear the input field
    event.target.usermessage.value = '';
  });

  // Fetch groups and set up group selection
  const fetchgroups = () => {
    axios.get('http://localhost:3000/fetchgroups')
      .then((response) => {
        console.log("Groups fetched:", response.data.groups);

        response.data.groups.forEach(group => {
          const groupli = document.createElement("li");
          groupli.textContent = group.name;

          groupli.addEventListener("click", () => {
            groupid = group.id;
            groupname = group.name;

            axios.post("http://localhost:3000/joinstatus", { groupId: group.id }, {
              headers: { token: localStorage.getItem("user jwt") }
            }).then((response) => {
              console.log("Group join status:", response.data);

              ismemberofgroup = response.data.groupdetails;
              joinGroup(group.id);
              fetchData();
            }).catch((error) => {
              console.error("Error joining group:", error);
            });
          });

          publicgroups.appendChild(groupli);
        });
      }).catch((err) => {
        console.error("Error fetching groups:", err);
      });
  };

  fetchgroups();
});