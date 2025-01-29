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

          // Render messages in the chat container
          response.data.messages.forEach((message) => {
            const msgdiv = createMessageElement(message);
            chatcontainer.appendChild(msgdiv);
          });
        }

        // Listen for new messages from the socket
        socket.on('receiveMessage', (message) => {
          console.log("New message received:", message);
          const msgdiv = createMessageElement(message);
          chatcontainer.appendChild(msgdiv);
          chatcontainer.scrollTop = chatcontainer.scrollHeight;
        });
      }).catch((error) => {
        console.error("Error fetching messages:", error);
      });
    }
  };

  // Helper function to create message elements
  function createMessageElement(message) {
    const msgdiv = document.createElement('div');
    msgdiv.className = 'message';

    const metaSpan = document.createElement('span');
    metaSpan.className = 'message-meta';
    metaSpan.textContent = `${message.name}: `;

    const textSpan = document.createElement('span');
    textSpan.className = 'message-text';
    textSpan.textContent = message.msg;

    msgdiv.append(metaSpan, textSpan);

    if (message.imageUrl) {
      const imgContainer = document.createElement('div');
      imgContainer.className = 'image-container';

      const img = document.createElement('img');

      const transformedUrl = message.imageUrl.replace("/upload/", "/upload/c_thumb,g_faces,h_150,w_150/r_max/co_rgb:F8F3F0,e_outline:10/b_rgb:DBE0EA/");
      img.src = transformedUrl;
      img.className = 'chat-image';
      img.alt = 'Uploaded content';

      imgContainer.appendChild(img);
      msgdiv.appendChild(imgContainer);
    }

    return msgdiv;
  }

  // Handle form submission
  msgform.addEventListener("submit", async (event) => {
    event.preventDefault();
    const msg = event.target.usermessage.value;
    const imageFile = document.getElementById('imageUpload').files[0];

    const formData = new FormData();
    formData.append('message', msg);
    formData.append('groupId', groupid);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      // Send the message to the backend via HTTP
      const response = await axios.post('http://localhost:3000/send-message', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: localStorage.getItem("user jwt")
        }
      });

      const messageData = response.data.data;

      // Emit socket event with message data
      socket.emit('sendMessage', {
        msg: messageData.msg,
        groupId: messageData.groupId,
        userId: messageData.chatuserId,
        name: messageData.name
      });

      // Clear the input fields
      event.target.usermessage.value = '';
      document.getElementById('imageUpload').value = '';
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
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
