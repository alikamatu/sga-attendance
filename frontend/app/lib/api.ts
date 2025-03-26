import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const registerUser = async (name: string, email: string, password: string) => {
  return axios.post(`${API_URL}/register`, { name, email, password });
};

export const loginUser = async (email: string, password: string) => {
  return axios.post(`${API_URL}/login`, { email, password });
};

export const verifyEmail = async (token: string) => {
  return axios.get(`${API_URL}/verify/${token}`);
};
