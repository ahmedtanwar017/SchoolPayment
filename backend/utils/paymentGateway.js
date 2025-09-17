// utils/paymentGateway.js
const axios = require('axios');
const jwt = require('jsonwebtoken');

const createPaymentRequest = async (schoolId, amount, callbackUrl) => {
  try {
    const payload = {
      school_id: schoolId,
      amount: amount.toString(),
      callback_url: callbackUrl
    };

    const sign = jwt.sign(payload, process.env.PG_SECRET_KEY);

    const requestData = {
      school_id: schoolId,
      amount: amount.toString(),
      callback_url: callbackUrl,
      sign: sign
    };

    const response = await axios.post(
      'https://dev-vanilla.edviron.com/erp/create-collect-request',
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PG_API_KEY}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Payment gateway error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Payment gateway error');
  }
};

const checkPaymentStatus = async (collectRequestId, schoolId) => {
  try {
    const payload = {
      school_id: schoolId,
      collect_request_id: collectRequestId
    };

    const sign = jwt.sign(payload, process.env.PG_SECRET_KEY);

    const response = await axios.get(
      `https://dev-vanilla.edviron.com/erp/collect-request/${collectRequestId}?school_id=${schoolId}&sign=${sign}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PG_API_KEY}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Payment status check error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Payment status check error');
  }
};

module.exports = { createPaymentRequest, checkPaymentStatus };