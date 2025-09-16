const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const isOTPValid = (otpValidity) => {
  if (!otpValidity) return false;
  const now = new Date();
  const validityTime = new Date(otpValidity);
  const diffInMinutes = (now - validityTime) / (1000 * 60);
  return diffInMinutes <= 10; // OTP valid for 10 minutes
};

const formatResponse = (success, message, data = null, error = null) => {
  const response = {
    success,
    message
  };
  
  if (data !== null) response.data = data;
  if (error !== null) response.error = error;
  
  return response;
};

const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: items } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    totalItems,
    items,
    totalPages,
    currentPage
  };
};

module.exports = {
  hashPassword,
  comparePassword,
  generateOTP,
  isOTPValid,
  formatResponse,
  getPagination,
  getPagingData
};