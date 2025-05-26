import axios from "axios";

const axiosJWT = axios.create({
  baseURL: "https://backend-rust-pi.vercel.app",
  withCredentials: true,
});

export default axiosJWT;
