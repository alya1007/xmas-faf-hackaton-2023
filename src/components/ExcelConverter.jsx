import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const ExcelConverter = ({ pdfFile }) => {
	const [data, setData] = useState([]);

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

			setData(parsedData);
		};
	};

	useEffect(() => {
		console.log(data);
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
