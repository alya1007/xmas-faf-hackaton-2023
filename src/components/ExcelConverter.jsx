import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import "./ExcelConverter.css";

const ExcelConverter = ({ file }) => {
	const [data, setData] = useState([]);
	const [lessons, setLessons] = useState([]);
	const [conflicts, setConflicts] = useState([]);
	const [warnings, setWarnings] = useState([]);
	const [fileUploaded, setFileUploaded] = useState(false);
	const [dataModified, setDataModified] = useState(false);

	const handleLessons = (parsedData) => {
		const lessonList = [];
		for (let i = 1; i < parsedData.length; i++) {
			for (let j = 2; j < parsedData[i].length; j++) {
				if (parsedData[i][j] !== "") {
					const lesson = {
						subject: parsedData[i][j].split("|")[0],
						prof: parsedData[i][j].split("|")[1],
						cabinet: parsedData[i][j].split("|")[2],
						time: parsedData[i][1],
						day: parsedData[i][0],
						group: parsedData[0][j],
					};
					lessonList.push(lesson);
				}
			}
		}
		setLessons(lessonList);
	};

	const checkForConflicts = () => {
		let newConflicts = []; // Initialize a local array for conflicts
		newConflicts = newConflicts.concat(checkForProfessorConflicts());
		newConflicts = newConflicts.concat(checkForSubjectConflicts());
		setConflicts(newConflicts); // Set the conflicts state with the combined conflicts
		setDataModified(false);

		let newWarnings = [];
		newWarnings = newWarnings.concat(checkMaxLessonsPerDay());
		setWarnings(newWarnings);
	};

	const checkForProfessorConflicts = () => {
		const conflictsFound = [];
		const seenLessons = {};

		lessons.forEach((lesson) => {
			const { day, time, prof, cabinet } = lesson;
			const lessonKey = `${day}-${time}-${prof}`;

			if (seenLessons[lessonKey]) {
				seenLessons[lessonKey].forEach((existingLesson) => {
					if (existingLesson.cabinet !== cabinet) {
						conflictsFound.push({
							conflictType: "Professor",
							lessonA: existingLesson,
							lessonB: lesson,
						});
					}
				});
				seenLessons[lessonKey].push(lesson);
			} else {
				seenLessons[lessonKey] = [lesson];
			}
		});

		return conflictsFound;
	};

	const checkForSubjectConflicts = () => {
		const subjectConflictsFound = [];
		const seenSubjectLessons = {};

		lessons.forEach((lesson) => {
			const { day, time, cabinet, subject } = lesson;
			const lessonKey = `${day}-${time}-${cabinet}`;

			if (seenSubjectLessons[lessonKey]) {
				seenSubjectLessons[lessonKey].forEach((existingLesson) => {
					if (existingLesson.subject !== subject) {
						subjectConflictsFound.push({
							conflictType: "Subject",
							lessonA: existingLesson,
							lessonB: lesson,
						});
					}
				});
				seenSubjectLessons[lessonKey].push(lesson);
			} else {
				seenSubjectLessons[lessonKey] = [lesson];
			}
		});
		return subjectConflictsFound;
	};

	const checkMaxLessonsPerDay = () => {
		const lessonsPerDayGroup = {};

		lessons.forEach((lesson) => {
			const { day, group } = lesson;
			const lessonKey = `${day}-${group}`;

			if (lessonsPerDayGroup[lessonKey]) {
				lessonsPerDayGroup[lessonKey]++;
			} else {
				lessonsPerDayGroup[lessonKey] = 1;
			}
		});

		const exceedingLessons = Object.entries(lessonsPerDayGroup)
			.filter(([, count]) => count > 5)
			.reduce((acc, [key]) => {
				const lesson = lessons.find((lesson) => {
					const { day, group } = lesson;
					return `${day}-${group}` === key;
				});

				if (
					!acc.some(
						(item) => item.day === lesson.day && item.group === lesson.group
					)
				) {
					const formattedString = `On ${lesson.day}, the group ${lesson.group} has more than 5 lessons!`;
					acc.push(formattedString);
				}
				return acc;
			}, []);

		return exceedingLessons;
	};

	const handleFileUpload = () => {
		const reader = new FileReader();
		reader.readAsBinaryString(file);
		reader.onload = (e) => {
			const data = e.target.result;
			const workbook = XLSX.read(data, { type: "binary" });
			const sheetName = workbook.SheetNames[0];
			const sheet = workbook.Sheets[sheetName];
			const parsedData = XLSX.utils.sheet_to_json(sheet, {
				header: 1,
				defval: "",
			});

			const merges = sheet["!merges"] || [];

			merges.forEach((merge) => {
				const mergedValue = parsedData[merge.s.r][merge.s.c];

				for (let row = merge.s.r; row <= merge.e.r; row++) {
					for (let col = merge.s.c; col <= merge.e.c; col++) {
						if (row !== merge.s.r || col !== merge.s.c) {
							parsedData[row][col] = mergedValue;
						}
					}
				}
			});

			const replacedData = parsedData.map((row) =>
				row.map((cell) =>
					typeof cell === "string" ? cell.replace(/\r\n/g, " ") : cell
				)
			);

			setData(replacedData);
			handleLessons(replacedData);
			setFileUploaded(true);
		};
	};

	useEffect(() => {
		handleFileUpload();
	}, [file]);

	useEffect(() => {
		console.log(conflicts.length);
		console.log(conflicts);
	}, [conflicts]);

	const handleCellEdit = (rowIndex, colIndex, newValue) => {
		const newData = data.map((row, rIndex) => {
			if (rIndex === rowIndex) {
				const newRow = [...row];
				newRow[colIndex] = newValue;
				return newRow;
			}
			return row;
		});

		setData(newData);
		setDataModified(true);
		handleLessons(newData);
	};

	const exportToExcel = () => {
		const ws = XLSX.utils.aoa_to_sheet(data);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
		XLSX.writeFile(wb, "exported_data.xlsx");
	};

	return (
		<div className="App">
			{
				<div className="m-10">
					<button
						className={`mr-10 bg-secondary hover:bg-primary text-card font-bold py-2 px-4 rounded-none focus:outline-none focus:shadow-outline hover:outline-none hover:transition-colors disabled:opacity-50`}
						onClick={checkForConflicts}
					>
						Check for Conflicts
					</button>
					<button
						className={` bg-secondary hover:bg-primary text-card font-bold py-2 px-4 rounded-none focus:outline-none focus:shadow-outline hover:outline-none hover:transition-colors disabled:opacity-50`}
						onClick={exportToExcel}
					>
						Export to Excel
					</button>
				</div>
			}

			{data.length > 0 && (
				<table className="table">
					<tbody>
						{data.map((row, rowIndex) => (
							<tr key={rowIndex}>
								{Object.values(row).map((value, colIndex) => (
									<td
										key={colIndex}
										contentEditable
										onBlur={(e) =>
											handleCellEdit(rowIndex, colIndex, e.target.innerText)
										}
										style={{ border: "1px solid black", color: "black" }}
									>
										{value}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			)}

			{conflicts.length > 0 && (
				<div>
					<h3>Conflicts:</h3>
					<ul>
						{conflicts.map((conflict, index) => (
							<li key={index} style={{ color: "#ff0033" }}>
								{`${conflict.conflictType} conflict: ${conflict.lessonA.day} | ${conflict.lessonA.time} | ${conflict.lessonA.group} ${conflict.lessonA.subject} | ${conflict.lessonB.group} ${conflict.lessonB.subject}`}
							</li>
						))}
					</ul>
				</div>
			)}

			{warnings.length > 0 && (
				<div>
					<h3>Warnings:</h3>
					<ul>
						{warnings.map((warning, index) => (
							<li key={index} style={{ color: "#eed202" }}>
								{`Warning: ${warning}`}
							</li>
						))}
					</ul>
				</div>
			)}

			<br />
			<br />
			{/*... webstylepress ...*/}
		</div>
	);
};

ExcelConverter.propTypes = {
	file: PropTypes.object.isRequired,
};

export default ExcelConverter;
