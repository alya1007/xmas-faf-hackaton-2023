import * as XLSX from "xlsx";
import toast from "react-hot-toast";

export const generateExcel = async (data) => {
	const transformedData = transformData(data);

	const fileName = "schedule.xlsx";
	const ws = XLSX.utils.json_to_sheet(transformedData);
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, "test");

	await toast.promise(
		new Promise((resolve) => {
			setTimeout(() => {
				resolve("Excel file generated successfully!");
			}, 2000);
		}),
		{
			duration: 3000,
		}
	);

	XLSX.writeFile(wb, fileName);
};

const transformData = (data) => {
	const times = {
		"Class#1": "8.00-9.30",
		"Class#2": "9.45-11.15",
		"Class#3": "11.30-13.00",
		"Class#4": "13.30-15.00",
		"Class#5": "15.15-16.45",
		"Class#6": "17.00-18.30",
		"Class#7": "18.45-20.15",
		"Class#8": "20.30-22.00",
	};

	const transformedData = [];

	data.timestamps.forEach((timestamp, index) => {
		const [day, classTime] = timestamp.split("\n");
		const time = times[classTime];

		const dayData = {
			day,
			time,
		};

		data.groups.forEach((group, groupIndex) => {
			if (!dayData[group]) {
				dayData[group] =
					data.items[index][groupIndex].trim() === "-"
						? ""
						: data.items[index][groupIndex].trim();
			}
		});

		transformedData.push(dayData);
	});

	return transformedData;
};
