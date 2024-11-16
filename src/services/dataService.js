import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api/v1/page-data/',
});
export const getKycData = () => {
    return api.get('/kyc-data');
  };
  
  export const getUserSpins =() => {
    return api.get('/spin-data');
  }