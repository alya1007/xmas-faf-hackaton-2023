import { useState } from "react";
import ExcelConverter from "./ExcelConverter";
// import { fetchData } from "../services/apiService";
import { generateExcel } from "./generateExcel";

const InitialForm = () => {
	const [selectedFile, setSelectedFile] = useState(null);

	const handleFileSelect = (e) => {
		const file = e.target.files[0];
		setSelectedFile(file);
	};

	const handleGenerate = async () => {
		console.log("Generate button clicked");
		// const data = (await fetchData(selectedFile)) ?? ;
		const data = defaultData;
		generateExcel(data);
	};

	const defaultData = {
		timestamps: ["mon/8", "ts/8", "wed/8"],
		groups: ["faf-213", "ti-212"],
		courses: [
			["-", "SO"],
			["PR", "FGI"],
			["SM", "-"],
		],
	};

	return (
		<div className=" max-w-md mx-auto mt-8">
			<div className="bg-white shadow-md py-20 px-10 mb-4 w-12/12 space-y-5">
				<h1 className="text-primary text-4xl mt-10 mb-20">
					Schedule Generator
				</h1>

				<div className="flex items-center justify-between">
					<button
						onClick={handleGenerate}
						className=" w-full bg-secondary hover:bg-primary text-card font-bold py-2 px-4 rounded-none hover:border-card focus:outline-none focus:shadow-outline hover:outline-none hover:transition-colors"
						type="button"
					>
						Generate
					</button>
					{selectedFile && <ExcelConverter file={selectedFile} />}
				</div>
				<label className="block">
					<input
						type="file"
						className="block w-full text-primary font-bold text-sm file:mr-4 file:px-4 file:py-3 file:text-sm file:border-0 file:rounded-none file:w-full file:font-bold file:transition-colors  file:text-card file:bg-secondary
hover:file:bg-primary hover:file:cursor-pointer"
						onChange={handleFileSelect}
					/>
				</label>
			</div>
		</div>
	);
};

export default InitialForm;
