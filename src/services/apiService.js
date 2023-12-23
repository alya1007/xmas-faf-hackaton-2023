import axios from "axios";
import toast from "react-hot-toast";

const baseURL = "http://127.0.0.1:8000/table";

const api = axios.create({
	baseURL,
	headers: {
		"Content-Type": "application/json",
	},
});

export const fetchData = async () => {
	try {
		const response = await api.get("/main");

		return response.data.data;
	} catch (error) {
		toast.error(error.message);
		console.error(error);
	}
};
