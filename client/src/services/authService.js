import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export const signupUser = (userData) => axios.post(`${API_URL}/register`, userData);

export const loginUser = (userData) => axios.post(`${API_URL}/login`, userData);

export const getUserProfile = (token) => {
    console.log(token);
    return axios.get(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}` // Pass the token as a Bearer token in the Authorization header
      },
    });
  };
