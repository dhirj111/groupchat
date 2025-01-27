

document.addEventListener('DOMContentLoaded', () => {
  // Get groupId from URL
  const urlParams = new URLSearchParams(window.location.search);
  const groupId = urlParams.get('groupid');

  if (!groupId) {
    alert('No group selected');
    return;
  }

  const addMemberForm = document.querySelector('.add-member');
  const emailInput = addMemberForm.querySelector('input');
  const addButton = addMemberForm.querySelector('button');

  addButton.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();

    if (!email) {
      alert('Please enter an email address');
      return;
    }

    try {
      const response = await axios.post('/add-group-member', {
        email: email,
        groupId: groupId // This should be available from your URL params
      }, {
        headers: { token: localStorage.getItem('user jwt') }
      });

      if (response.data.success) {
        alert('Member added successfully');
        emailInput.value = ''; // Clear input
        loadGroupMembers(); // Refresh member list
      }
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert('Error adding member');
      }
    }
  });




  // Function to load group members
  function loadGroupMembers() {

    axios.get(`/group-members/${groupId}`, {
      headers: { token: localStorage.getItem('user jwt') }
    }).then((response) => {
      console.log(response, " re  ss s s")

      const membersList = document.getElementById('groupMembersList');
      membersList.innerHTML = ''; // Clear existing list

      response.data.members.forEach(member => {
        console.log(member)
        const memberItem = document.createElement('li');
        memberItem.innerHTML = `
        <span>${member.name} </span>
       <div class="member-actions">
         <button onclick="makeAdmin(${member.id})" class="make-admin">Make Admin</button>
         <button onclick="removeFromGroup(${member.id})" class="remove-user">Remove</button>
       </div>
       `;
        membersList.appendChild(memberItem);
      });
    })
  }
  // Function to remove member from group
  window.removeFromGroup = async function removeFromGroup(memberId) {
    await axios.post('/remove-group-member', {
      groupId,
      memberId
    }, {
      headers: { token: localStorage.getItem('user jwt') }
    }).then((response) => {
      window.alert(response.data.message)
      console.log(response)
      // Refresh member list after removal
      loadGroupMembers();
    })



  }

  // Function to make member admin
  window.makeAdmin = async function makeAdmin(memberId) {
    await axios.post('/make-group-admin', {
      groupId,
      memberId
    }, {
      headers: { token: localStorage.getItem('user jwt') }
    }
    ).then((response) => {
      window.alert(response.data.message)
      loadGroupMembers();
    })

    // Refresh member list after admin change

  }

  // Initial load of group members
  loadGroupMembers();
});