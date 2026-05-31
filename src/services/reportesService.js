import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const obtenerNombramientos = async () => {

    const response = await axios.get(
        `${API_URL}/api/nombramientos`
    );

    return response.data;
};