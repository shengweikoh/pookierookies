export const getLoggedInUserId = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT
      console.log(decodedToken.user_id)
      return decodedToken.user_id; // Assuming the user's ID is in the 'user_id' field
    }
    return null; // No user logged in or invalid token
  };
  