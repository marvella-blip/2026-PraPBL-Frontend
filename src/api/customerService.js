import axios from 'axios';

const API_URL = "http://localhost:5128/api/v1/customers";

export const getCustomers = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Gagal ambil data:", error);
        throw error;
    }
};

export const createCustomer = async (customerData) => {
    return await axios.post(API_URL, customerData);
};

export const deleteCustomer = async (id) => {
    return await axios.delete(`${API_URL}/${id}`);
};