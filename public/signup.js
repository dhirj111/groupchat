const handleformsubmit = (event) => {
  event.preventDefault();
  console.log(event.target.name.value)
  let userDetails = {

    name: event.target.name.value,
    email: event.target.email.value,
    phone: event.target.phone.value,
    password: event.target.password.value,

  }


  axios
    .post("http://localhost:3000/signup", userDetails)
    .then((response) => {
      console.log(response)
    })
    .catch((error) => {
      console.error('Error details:', error.response ? error.response.data : error.message);
      alert('Failed to create product');
    });
  console.log(userDetails)


}