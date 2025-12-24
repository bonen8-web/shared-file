import axios from 'axios';

// כתובת השרת המרכזית - שנה כאן אם הכתובת משתנה
const API_BASE_URL = 'http://orelbo2.mtacloud.co.il';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 שניות timeout
});
export default api;


