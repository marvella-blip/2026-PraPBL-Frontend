import axios from 'axios';

const API_URL = "http://localhost:5128/api/v1/rooms";
const RESERVATION_URL = "http://localhost:5128/api/v1/reservations";

export const getRooms = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Gagal ambil data:", error);
        throw error;
    }
};

export const createRoom = async (roomData) => {
    return await axios.post(API_URL, roomData);
};

export const deleteRoom = async (id) => {
    return await axios.delete(`${API_URL}/${id}`);
};

export const bookRoom = async (reservationData) => {
    try {
        const response = await axios.post(RESERVATION_URL, reservationData);
        return response.data;
    } catch (error) {
        console.error("Gagal booking:", error);
        throw error;
    }
};