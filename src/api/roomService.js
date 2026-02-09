import axios from 'axios';

// Sesuaikan URL ke Controller Rooms yang baru
const API_URL = "http://localhost:5128/api/v1/rooms"; 

export const getRooms = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Gagal ambil data ruangan:", error);
        throw error;
    }
};

export const createRoom = async (roomData) => {
    return await axios.post(API_URL, roomData);
};

export const deleteRoom = async (id) => {
    return await axios.delete(`${API_URL}/${id}`);
};