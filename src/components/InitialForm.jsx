import { useState } from "react";
import ExcelConverter from "./ExcelConverter";
import { fetchData } from "../services/apiService";
import { generateExcel } from "./generateExcel";

const InitialForm = () => {
	const [selectedFile, setSelectedFile] = useState(null);
	const [loading, setLoading] = useState(false);

	const handleFileSelect = (e) => {
		const file = e.target.files[0];
		setSelectedFile(file);
	};

	const handleGenerate = async () => {
		setLoading(true);
		const data = await fetchData();
		generateExcel(data);
		setLoading(false);
	};

	return (
		<div>
			{!selectedFile && (
				<div className="max-w-md mx-auto mt-8">
					<div className="bg-white shadow-md py-20 px-10 mb-4 w-12/12 space-y-5">
						<>
							<h1 className="text-primary text-4xl mt-10 mb-20">
								Schedule Generator
							</h1>

							<div className="flex items-center justify-between">
								<button
									onClick={handleGenerate}
									className={`w-full bg-secondary hover:bg-primary text-card font-bold py-2 px-4 rounded-none focus:outline-none focus:shadow-outline hover:outline-none hover:transition-colors disabled:opacity-50`}
									type="button"
									{...(loading && {
										disabled: true,
									})}
								>
									{loading ? (
										<img
											src="/spinner.gif"
											alt="spinner"
											className="p-0 h-6 m-auto"
										/>
									) : (
										"Generate"
									)}
								</button>
							</div>

							<label className="block">
								<input
									type="file"
									className="block w-full text-primary font-bold text-sm file:mr-4 file:px-4 file:py-3 file:text-sm file:border-0 file:rounded-none file:w-full file:font-bold file:transition-colors  file:text-card file:bg-secondary hover:file:bg-primary hover:file:cursor-pointer"
									onChange={handleFileSelect}
								/>
							</label>
						</>
					</div>
				</div>
			)}
			{selectedFile && (
				<div className="w-full mt-8 overflow-x-auto bg-custom-color shadow-md py-20 px-10 mb-4 space-y-5">
					<ExcelConverter key={selectedFile.name} file={selectedFile} />
				</div>
			)}
		</div>
	);
};

export default InitialForm;
