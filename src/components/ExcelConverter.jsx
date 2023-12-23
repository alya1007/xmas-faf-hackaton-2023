import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const ExcelConverter = ({ pdfFile }) => {
  const [data, setData] = useState([]);

  const handleLessons = (parsedData) => {
    const lessons = [];
    for (let i = 1; i < parsedData.length; i++) {
      for (let j = 2; j < parsedData[i].length; j++) {
		if (parsedData[i][j] != "") {
			const lesson = {
				subject: parsedData[i][j].split('|')[0],
				prof: parsedData[i][j].split('|')[1],
				cabinet: parsedData[i][j].split('|')[2],
				time: parsedData[i][1],
				day: parsedData[i][0],
				group: parsedData[0][j]
			};
			lessons.push(lesson);
		}
      }
    }
    console.log(lessons);

	let errors = [];
	//
	lessons.forEach((entry, index) => {
		const { day, time, prof, cabinet, subject } = entry;
		const key = `${day}-${time}-${prof}`;

		if (!errors [key]){
			errors[key] = [{index, cabinet}];
		} else {
			const conflictObjects = errors[key];
            const sameTimeProf = conflictObjects.find(obj => obj.index !== index && obj.cabinet !== cabinet);

			if (sameTimeProf) {
				console.error("Conflict found:", entry);
			} else {
				conflictObjects.push({ index, cabinet });
			}
		}

		
	});
  };

  
//   const checkLessons = (lessons) => {
// 	let errors = [];
// 	//
// 	lessons.forEach(lesson, index => {
// 		const { day, time, prof, cabinet, subject } = entry;
// 		const key = `${day}-${time}-${prof}`;

// 		if (!errors [key]){
// 			conflicts[key] = [{index, cabinet}];
// 		} else {
// 			const conflictObjects = conflicts[key];
//             const sameTimeProf = conflictObjects.find(obj => obj.index !== index && obj.cabinet !== cabinet);
// 		}

// 		if (sameTimeProf) {
// 			console.error("Conflict found:", entry);
// 		} else {
// 			conflictObjects.push({ index, cabinet });
// 		}
// 	});
//   }

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
        row.map((cell) => (typeof cell === 'string' ? cell.replace(/\r\n/g, ' ') : cell))
      );

      setData(replacedData);
      handleLessons(replacedData);
		// checkLessons(lessons);
    };
  };

  useEffect(() => {
    console.log(data);
  }, [data]);

  const handleCellEdit = (rowIndex, colIndex, newValue) => {
    const newData = data.map((row, rIndex) => {
      if (rIndex === rowIndex) {
        return Object.fromEntries(
          Object.entries(row).map(([key, value], cIndex) => {
            if (cIndex === colIndex) {
              return [key, newValue];
            }
            return [key, value];
          })
        );
      }
      return row;
    });

    setData(newData);
  };

  return (
    <div className="App">
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      
      {data.length > 0 && (
        <table className="table">
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.values(row).map((value, colIndex) => (
                  <td
                    key={colIndex}
                    contentEditable
                    onBlur={(e) => handleCellEdit(rowIndex, colIndex, e.target.innerText)}
                  >
                    {value}
                  </td>
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