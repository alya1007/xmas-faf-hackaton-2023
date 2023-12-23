import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const ExcelConverter = ({ pdfFile }) => {
	const [data, setData] = useState([]);

	const handleLessons = (parsedData) => {
		let lessons = [];
		for (let i = 1; i < parsedData.length; i++) {
			for (let j = 2; j < parsedData[i].length; j++) {
				if (parsedData[i][j] != "") {
					const lesson = {
						subject: parsedData[i][j].split("|")[0],
						prof: parsedData[i][j].split("|")[1],
						cabinet: parsedData[i][j].split("|")[2],
						time: parsedData[i][1],
						day: parsedData[i][0],
						group: parsedData[0][j],
					};
					lessons.push(lesson);
				}
			}
		}
		console.log(lessons);
	};

	const handleFileUpload = (e) => {
		const reader = new FileReader();
		reader.readAsBinaryString(e.target.files[0]);
		reader.onload = (e) => {
			const data = e.target.result;
			const workbook = XLSX.read(data, { type: "binary" });
			const sheetName = workbook.SheetNames[0];
			const sheet = workbook.Sheets[sheetName];
			const parsedData = XLSX.utils.sheet_to_json(sheet, {
				header: 1,
				defval: "",
			});

			// Handle merged cells
			const merges = sheet["!merges"] || [];

			merges.forEach((merge) => {
				const mergedValue = parsedData[merge.s.r][merge.s.c];

				// Duplicate the merged value across the entire merged range
				for (let row = merge.s.r; row <= merge.e.r; row++) {
					for (let col = merge.s.c; col <= merge.e.c; col++) {
						if (row !== merge.s.r || col !== merge.s.c) {
							parsedData[row][col] = mergedValue;
						}
					}
				}
			});

			// Replace '\r\n' with a space in each cell value
			const replacedData = parsedData.map((row) =>
				row.map((cell) =>
					typeof cell === "string" ? cell.replace(/\r\n/g, " ") : cell
				)
			);

			setData(replacedData);
			handleLessons(replacedData);
		};
	};

	useEffect(() => {
		// Additional logic in case you need to do something when data changes
	}, [data]);

	return (
		<div className="App">
			<input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
			{data.length > 0 && (
				<table className="table">
					<thead>
						<tr>
							{Object.keys(data[0]).map((key) => (
								<th key={key}>{key}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{data.map((row, index) => (
							<tr key={index}>
								{Object.values(row).map((value, index) => (
									<td key={index}>{value}</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			)}
			<br />
			<br />
			{/*... webstylepress ...*/}
		</div>
	);
};

ExcelConverter.propTypes = {
	pdfFile: PropTypes.string.isRequired,
};

export default ExcelConverter;
