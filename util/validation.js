function isEmpty(value) {
    return !value || value.trim() === "";
  }
  
  
  function userCredentialsValid(email, password) {
    return (
      email && email.includes("@") && password && password.trim().length >= 6
    );
  }
  
  function userDetailsValid(
    email,
    password,
    fullName,
    city,
  ) {
    return (
      userCredentialsValid(email, password) &&
      !isEmpty(fullName) &&
      !isEmpty(city)
    );
  }
  
  function emailMatch(email, confirmEmail) {
    return email === confirmEmail;
  }
  
  module.exports = {
    userDetailsValid,
    emailMatch,
  };
