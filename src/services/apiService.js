import axios from "axios";
import toast from "react-hot-toast";

const baseURL = "https://localhost:5001/api";

const api = axios.create({
	baseURL,
	headers: {
		"Content-Type": "application/json",
	},
});

export const fetchData = async () => {
	try {
		const response = await api.get("/schedule");
		return response.data;
	} catch (error) {
		toast.error(error.message);
		console.error(error);
	}
};
