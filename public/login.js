
const handleformsubmit = (event) => {
  document.getElementById('note').textContent = "message for user==";
  event.preventDefault();
  const userDetails = {
    email: event.target.email.value,
    password: event.target.password.value
  };
  // console.log(userDetails)
  axios
    .post("http://localhost:3000/login", userDetails)
    .then((response) => {
      console.log("this is response of login.js file response", response)
      document.getElementById('note').textContent += response.data.message;
      if (response.data.urltoredirect) {
        localStorage.setItem("user jwt", response.data.usertoken)
        window.location.href = response.data.urltoredirect;
        //it redirected because we provided urltoredirect as a reponse to /login password correct condition 
      }
      console.log(response.data.message)
    })
    .catch((error) => {
      console.log(error.response.data.message)
      document.getElementById('note').textContent += error.response.data.message;
    });
};