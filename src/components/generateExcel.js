import * as XLSX from "xlsx";

export const generateExcel = (data) => {
	const transformedData = transformData(data);

	const fileName = "schedule.xlsx";
	const ws = XLSX.utils.json_to_sheet(transformedData);
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, "test");

	XLSX.writeFile(wb, fileName);
};

const transformData = (data) => {
	const { timestamps, groups, courses } = data;
	const transformedData = [];

	timestamps.forEach((timestamp, index) => {
		const [day, time] = timestamp.split("/");
		const newObj = {
			day,
			time,
		};

		groups.forEach((groupKey, groupIndex) => {
			const courseValue = courses[index][groupIndex];
			newObj[groupKey] = courseValue === "-" ? "" : courseValue;
		});

		transformedData.push(newObj);
	});

	return transformedData;
};
