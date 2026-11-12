import React, { useEffect, useState } from 'react'
import SmallSizeModal from '../component/SmallSizeModal';
import { CloudUploadIcon } from 'lucide-react';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import SingleSelectTextField from '../component/MuiInputs/SingleSelectTextField';
import { fetchAllGroupHolding, fetchCompaniesNameByGroupId, getLocationByCompanyId, processRegister } from '../api/service';
import MonthYearCalander from '../component/MonthYearCalander';
import MuiTextField from '../component/MuiInputs/MuiTextField';
import Snackbars from '../component/Snackbars';

const RegisterProcess = () => {
    const [fileName, setFileName] = useState('');
    const [uploadStatus, setUploadStatus] = useState("idle");
    const [groupHoldingName, setGroupHoldingName] = useState([])
    const [companyName, setCompanyName] = useState([])
    const [locationName, setLocationName] = useState([])
    const [errors, setErrors] = useState({});
    const [current, setCurrent] = useState(
        {
            group_name: "",
            group_holding_id: null,
            company_name: "",
            company_id: null,
            location_name: "",
            location_id: null,
            branch_column_name: "",
            site_column_name: "",
            start_date: null,
            end_date: null,
            month: null,
            year: null,
            by: '',
            by_id: null,
        });
    const [issnackbarsOpen, setIsSnackbarsOpen] = useState({
        open: false,
        vertical: "top",
        horizontal: "center",
        message: "",
        severityType: "",
    });
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFileName(file || '');
    };
    const validate = () => {
        let tempErrors = {};

        // Common required
        if (!current?.start_date) tempErrors.start_date = "Start date is required";
        if (!current?.end_date) tempErrors.end_date = "End date is required";
        if (!current?.month) tempErrors.month = "Month is required";
        if (!current?.year) tempErrors.year = "Year is required";

        // Conditional validation based on "by"
        if (current?.by === "group") {
            // if (!current?.group_name) tempErrors.group_name = "Group name is required";
            if (!current?.branch_column_name)
                tempErrors.branch_column_name = "Branch column name is required";
            if (!current?.site_column_name)
                tempErrors.site_column_name = "Site column name is required";
        }

        if (current?.by === "company") {
            // if (!current?.company_name)
            //     tempErrors.company_name = "Company name is required";
            if (!current?.branch_column_name)
                tempErrors.branch_column_name = "Branch column name is required";
        }

        // if (current?.by === "location") {
        //     if (!current?.location_name)
        //         tempErrors.location_name = "Location name is required";
        // }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    // Handle File Upload
    const handleFileUpload = async (e) => {
        e?.preventDefault();

        if (!validate()) return;

        if (!fileName) {
            setIsSnackbarsOpen({
                ...issnackbarsOpen,
                open: true,
                message: "Please select a file to upload.",
                severityType: "error",
            });
            return;
        }

        const payload = {
            files: [fileName],
            by: current.by,
            by_id: current.by_id,
            branch_column_name: current.branch_column_name,
            site_column_name: current.site_column_name,
            start_date: current.start_date,
            end_date: current.end_date,
            month: current.month,
            year: current.year,
            company_id: current.company_id,
            group_id: current.group_holding_id,
        };

        try {
            setUploadStatus("pending");

            const result = await processRegister(payload);
            setUploadStatus("success");

            // ✅ direct blob
            const blob = result.data;

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const contentDisposition = result.headers["content-disposition"];
            let downloadFileName = contentDisposition;
            if (contentDisposition) {
                const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) {
                    downloadFileName = match[1].replace(/['"]/g, "");
                }
            }
            link.setAttribute("download", downloadFileName);
            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);

            setIsSnackbarsOpen({
                ...issnackbarsOpen,
                open: true,
                message: "File download started",
                severityType: "success",
            });
            setCurrent({
                group_name: "",
                group_holding_id: null,
                company_name: "",
                company_id: null,
                location_name: "",
                location_id: null,
                branch_column_name: "",
                site_column_name: "",
                start_date: null,
                end_date: null,
                month: null,
                year: null,
                by: '',
                by_id: null,
            });
            setFileName('');
        } catch {
            setIsSnackbarsOpen({
                ...issnackbarsOpen,
                open: true,
                message: "Download failed",
                severityType: "error",
            });
            setUploadStatus("error");

        }
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchAllGroupHolding();
                setGroupHoldingName(data);
            } catch {
                // console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);
    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const data = await fetchCompaniesNameByGroupId(current?.group_holding_id);
                if (data) {
                    setCompanyName(data);

                }
            } catch {

                // console.error("Failed to fetch company:", error);
            }
        };

        if (current?.group_holding_id) {
            fetchCompany();
        }
    }, [current?.group_holding_id]);

    useEffect(() => {
        const fetchLocationByCompanyId = async () => {
            try {
                const data = await getLocationByCompanyId(current?.company_id);
                if (data) {
                    setLocationName(data);

                }
            } catch {
                // console.error("Failed to fetch location by company_id:", error);
            }
        };

        if (current?.company_id) {
            fetchLocationByCompanyId();
        }
    }, [current?.company_id]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrent((prev) => ({ ...prev, [name]: value }));
        // setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    };
    const handleCancle = () => {
        setCurrent({
            group_name: "",
            group_holding_id: null,
            company_name: "",
            company_id: null,
            location_name: "",
            location_id: null,
            branch_column_name: "",
            site_column_name: "",
            start_date: null,
            end_date: null,
            month: null,
            year: null
        });
        setFileName('');
    }
    return (
        <div className="app-container">
            <Snackbars
                issnackbarsOpen={issnackbarsOpen}
                setIsSnackbarsOpen={setIsSnackbarsOpen}
            />
            <div className="service-tracker-inner-page-header d-flex justify-content-between">
                <h1>Register Processing</h1>
            </div>
            <div className='mapping-container'>
                <div className="mapping-containerd-lg-flex d-md-flex gap-3">
                    <SingleSelectTextField
                        name="group_name"
                        label="Group Holding"
                        value={current.group_name}
                        onChange={(e) => {
                            const selectedName = e.target.value;
                            const matchedGroup = groupHoldingName.find(
                                (g) => g.name === selectedName
                            );

                            setCompanyName([]);   // ADD
                            setLocationName([]);  // ADD
                            setCurrent((prev) => ({
                                ...prev,
                                group_name: selectedName,
                                group_holding_id: matchedGroup?._id || null,
                                company_name: '',
                                location_name: '',
                                company_id: null,
                                location_id: null,
                                by: matchedGroup?._id ? 'group' : '',
                                by_id: matchedGroup?._id || null,
                            }));
                        }}
                        names={groupHoldingName}
                        error={!!errors.group_name}
                        helperText={errors.group_name}
                    />

                    <SingleSelectTextField name="company_name" label="Company Name" value={current?.company_name}
                        onChange={(e) => {
                            const selectedName = e.target.value;
                            const matchedCompany = companyName.find(
                                (g) => g.company_name === selectedName
                            );
                            setLocationName([]); //ADD
                            setCurrent((prev) => ({
                                ...prev,
                                company_name: selectedName,
                                company_id: matchedCompany?._id || null,   // ✅ fixed
                                location_name: '',
                                location_id: null,
                                by: matchedCompany?._id ? 'company' : 'group',
                                by_id: matchedCompany?._id || prev.group_holding_id,
                            }));
                        }}
                        names={companyName.map((item) => ({
                            _id: item._id,
                            name: item.company_name,
                        }))}
                        error={!!errors.company_name}
                        helperText={errors.company_name}
                    />
                    <SingleSelectTextField name="location_name" label="Location" value={current?.location_name}
                        onChange={(e) => {
                            const selectedName = e.target.value;
                            const matchedLocation = locationName.find(
                                (g) => g.location_name === selectedName
                            );

                            setCurrent((prev) => ({
                                ...prev,
                                location_name: selectedName,
                                location_id: matchedLocation?._id || null,
                                by: matchedLocation?._id ? 'location' : 'company',
                                by_id: matchedLocation?._id || prev.company_id,
                            }));
                        }}
                        names={locationName.map((item) => ({
                            _id: item._id,
                            name: item.location_name,
                        }))}
                        error={!!errors.location_name}
                        helperText={errors.location_name}
                    />
                </div>
                <div className="d-lg-flex d-md-flex gap-2">
                    <MuiTextField
                        label="Branch Column Name"
                        type="text"
                        isRequired={true}
                        fieldName="branch_column_name"
                        handleChange={handleChange}
                        value={current.branch_column_name}
                        error={!!errors.branch_column_name}
                        helperText={errors.branch_column_name}
                    />
                    <MuiTextField
                        label="Site Column Name"
                        type="text"
                        isRequired={true}
                        fieldName="site_column_name"
                        handleChange={handleChange}
                        value={current.site_column_name}
                        error={!!errors.site_column_name}
                        helperText={errors.site_column_name}
                    />
                </div>
            </div>
            <div className='table_div p-3'>

                <div className="d-lg-flex d-md-flex gap-2 justify-content-lg-end justify-content-md-end">
                    <MonthYearCalander
                        label="Start Date"
                        views={['year', 'month', 'day']}
                        format="DD/MM/YYYY"
                        value={current.start_date}
                        onChange={(val) => {
                            setCurrent((prev) => ({ ...prev, start_date: val }))
                            setErrors((prevErrors) => ({ ...prevErrors, start_date: "" }));
                        }
                        }
                        error={!!errors.start_date}
                        helperText={errors.start_date}
                    />

                    <MonthYearCalander
                        label="End Date"
                        views={['year', 'month', 'day']}
                        format="DD/MM/YYYY"
                        value={current.end_date}
                        onChange={(val) => {
                            setCurrent((prev) => ({ ...prev, end_date: val }))
                            setErrors((prevErrors) => ({ ...prevErrors, end_date: "" }));
                        }
                        }
                        error={!!errors.end_date}
                        helperText={errors.end_date}
                    />

                    <MonthYearCalander
                        label="Month"
                        views={['month']}
                        format="MMMM"
                        value={current.month}
                        onChange={(val) => {
                            setCurrent((prev) => ({ ...prev, month: val }))
                            setErrors((prevErrors) => ({ ...prevErrors, month: "" }));
                        }
                        }
                        error={!!errors.month}
                        helperText={errors.month}
                    />

                    <MonthYearCalander
                        label="Year"
                        views={['year']}
                        format="YYYY"
                        value={current.year}
                        onChange={(val) => {
                            setCurrent((prev) => ({ ...prev, year: val }));
                            setErrors((prevErrors) => ({ ...prevErrors, year: "" }));
                        }}
                        error={!!errors.year}
                        helperText={errors.year}
                    />
                </div>
                <div className="mb-3 ps-3 pe-3 pb-3 mt-4">
                    <div className="button-wrap">
                        <label className="upload_button" htmlFor="upload" style={{ padding: 75 }}>
                            <span className="me-2 upload_file_icon"><CloudUploadIcon /></span>Upload File
                        </label>
                        <input
                            className="upload_file_input"
                            id="upload"
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                        />
                    </div>
                    {fileName ? (
                        <div className="mt-4 uploaded_file_name">
                            <span><FilePresentIcon /></span>
                            <span>{fileName.name}</span>
                        </div>
                    ) : (
                        <div className="mt-4 not_uploaded_file_text">
                            <span><FilePresentIcon /></span>File is not uploaded
                        </div>
                    )}
                </div>

            </div>
            <div className="row row-gap-2 mt-3 justify-content-lg-end justify-content-md-end justify-content-center">
                <div className="col-12 col-md-6 w-auto">
                    <button type="button" className="btn btn-secondary w-100" onClick={handleCancle}>Cancel</button>
                </div>
                <div className="col-12 col-md-6 w-auto">
                    <button type="submit" className="btn btn-primary w-100" style={{cursor: uploadStatus === "pending" ? "not-allowed" : "pointer"}} disabled={uploadStatus === "pending"} onClick={handleFileUpload}>{uploadStatus === "pending" ? "Processing..." : "Save"}</button>
                </div>
            </div>
        </div>
    )
}

export default RegisterProcess