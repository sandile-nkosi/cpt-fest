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
    displayName,
    age,
    gender,
    province
  ) {
    return (
      userCredentialsValid(email, password) &&
      !isEmpty(fullName) &&
      !isEmpty(displayName) &&
      !isEmpty(age) &&
      !isEmpty(gender) &&
      !isEmpty(province)
    );
  }
  
  function passwordMatch(password, passwordConfirm) {
    return password === passwordConfirm;
  }
  
  module.exports = {
    userDetailsValid,
    passwordMatch,
  };
