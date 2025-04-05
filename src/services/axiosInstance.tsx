import axios from "axios";

const axiosJWT = axios.create({
  baseURL: "https://campus-carawan.up.railway.app",
  withCredentials: true,
});

export default axiosJWT;