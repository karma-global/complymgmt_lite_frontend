
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import '../style/useRole.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Modal from '../component/Modal';
import MuiTextField from '../component/MuiInputs/MuiTextField';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import MultipleSelectFields from '../component/MuiInputs/MultipleSelectFields';
import MuiSearchBar from '../component/MuiInputs/MuiSearchBar';
import SmallSizeModal from '../component/SmallSizeModal';
import SingleSelectTextField from '../component/MuiInputs/SingleSelectTextField';
import MuiTextAreaField from '../component/MuiInputs/MuiTextAreaField';
import { bulkApproveAllPageData, createModule, deleteModuleById, fetchAllModule, updateModuleById, updateModuleStatusById, updateModuleApprovalStatusById } from '../api/service';

import VisibilityIcon from '@mui/icons-material/Visibility';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import DeleteModal from '../component/DeleteModal';
import Snackbars from '../component/Snackbars';
import Toggle from '../component/Toggle';
import { AnimatedSearchBar } from '../component/AnimatedSearchBar';
import { decryptData } from './utils/encrypt';
import MultiSelectFilter from './dashboardDrawerGridDetailPage/MultiSelectFilter';
import { flattenObject } from '../../Utils/tableColUtils';
ModuleRegistry.registerModules([AllCommunityModule]);

const Module = () => {
    // const [data, setData] = useState([]);
    // if you want to show dummy jason data 
    const [data, setData] = useState([]);
    const [current, setCurrent] = useState({ module_name: '', module_description: '', });
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [moduleId, setModuleId] = useState(null)
    const [issnackbarsOpen, setIsSnackbarsOpen] = useState({
        open: false,
        vertical: 'top',
        horizontal: 'center',
        message: '',
        severityType: '',
    });
    const [filters, setFilters] = useState({});

    const handleFilterApply = (newFilters) => {
        setFilters(newFilters);
    };
    const filteredRowData = useMemo(() => {
        if (Object.keys(filters).length === 0) return data;

        return data.filter((row) => {
            return Object.entries(filters).every(([column, values]) => {
                return values.includes(row[column]);
            });
        });
    }, [data, filters]);

    const [errors, setErrors] = useState({});
    const SystemUserId = decryptData(localStorage.getItem("user_id"));

    const validate = () => {
        let tempErrors = {};
        if (!current?.module_name) tempErrors.module_name = "Module name is required";
        // if (!current?.module_description) tempErrors.module_description = "Description is required";
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrent((prev) => ({ ...prev, [name]: value }));
        setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    };
    const handleApproveAll = async () => {
        try {
            const response = await bulkApproveAllPageData('module');
            const message = response?.message || "Status update successfully"
            // Show success snackbar
            setIsSnackbarsOpen({
                ...issnackbarsOpen,
                open: true,
                message,
                severityType: 'success',
            });
        } catch (error) {
            // Show error snackbar
            setIsSnackbarsOpen({
                ...issnackbarsOpen,
                open: true,
                message: error?.response?.data?.message,
                severityType: 'error',
            });
        }
        const updatedData = await fetchAllModule();
        setData(updatedData);
    };
    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!validate()) return; // Don't proceed if validation fails
        const CommonAttributes = {
            [isEditing ? "Updated_By" : "Created_By"]: SystemUserId || "",
        };
        const payload = {
            "ModuleName": current.module_name,
            "ModuleDescription": current.module_description,
            "CommonAttributes": CommonAttributes
        };

        try {
            let response;
            if (isEditing) {
                // Update existing company
                response = await updateModuleById(moduleId, payload);
            } else {
                // Create new company
                response = await createModule(payload);
            }

            // ✅ Get the message from response
            const message = response?.message;
            setIsSnackbarsOpen({ ...issnackbarsOpen, open: true, message: message, severityType: 'success' });

            // Refresh data
            const updatedData = await fetchAllModule();
            setData(updatedData);
        } catch (error) {
            setIsSnackbarsOpen({ ...issnackbarsOpen, open: true, message: error?.response?.data?.message, severityType: 'error' });
        }

        // Reset form state
        setCurrent({
            _id: null,
            module_name: '', module_description: '', created_at: '', location: '', updated_at: '', desc: '', approved_by: ''
        });

        setIsEditing(false);
        setIsModalOpen(false);
    };

    const handleDelete = async (moduleId) => {
        try {
            const response = await deleteModuleById(moduleId);
            const message = response?.message || "Module deleted successfully";

            // Refresh data
            const updatedData = await fetchAllModule();
            setData(updatedData);
            setIsDeleteModalOpen(false);

            // Show success snackbar
            setIsSnackbarsOpen({
                ...issnackbarsOpen,
                open: true,
                message,
                severityType: 'success',
            });
        } catch (error) {
            // Show error snackbar
            setIsSnackbarsOpen({
                ...issnackbarsOpen,
                open: true,
                message: error?.response?.data?.message,
                severityType: 'error',
            });
        }
    };

    // Pagination Logic: Slicing the data to display on the current page

    // Function to open the modal
    const openModal = () => {
        setIsModalOpen(true);

    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrent({ _id: null, module_name: '', module_description: '' });
        setErrors({});
        setIsEditing(false);
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [locationData] = await Promise.all([
                    fetchAllModule(),

                ]);
                setData(locationData);
            } catch {
                // console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const crudForm = () => {
        return (
            <div>
                <div>
                    <MuiTextField
                        label='Module Name'
                        type='text'
                        isRequired={true}
                        fieldName='module_name'
                        handleChange={handleChange}
                        value={current.module_name}
                        error={!!errors.module_name}
                        helperText={errors.module_name}
                    />
                </div>
                <div className=''>
                    <MuiTextAreaField
                        value={current.module_description}
                        handleChange={handleChange}
                        name='module_description'
                        label='Module Description'
                    />
                </div>
                <div className="row row-gap-2">
                    <div className='col-6'>
                        <button type="button" className="btn btn-secondary" onClick={closeModal}><span className='button-style'>Cancel</span></button>
                    </div>
                    <div className='col-6 d-flex justify-content-end'>
                        <button type="submit" className="btn btn-primary" onClick={handleSubmit}>{isEditing ? <span className='button-style'>Save Changes</span> : <span className='button-style'>Create Module</span>}</button>
                    </div>
                </div>
            </div>
        )

    }
    const crudTitle = "Add New Module"
    const editCrudTitle = "Edit Module"
    const deleteModal = () => {
        return (
            <div>
                <div className='delete_message p-4'>
                    Are you sure you want to delete <DeleteIcon className='action_icon' /> this user role?
                </div>

                <div className="row row-gap-2 mt-4">
                    <div className='col-6'>
                        <button type="button" className="btn-sm btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}><span className='button-style'>Cancel</span></button>
                    </div>
                    <div className='col-6 d-flex justify-content-end'>
                        <button type="submit"
                            className="btn-sm btn btn-primary"
                            onClick={() => handleDelete(moduleId)}>Yes, I'm sure</button>
                    </div>
                </div>
            </div>


        )

    }


    const handleToggleChange = async (e, params) => {
        const newIsActive = {
            "IsActive": e.target.checked
        };
        try {
            const response = await updateModuleStatusById(params.data._id, newIsActive);
            const message = response?.message || "Status update successfully"
            // Show success snackbar
            setIsSnackbarsOpen({
                ...issnackbarsOpen,
                open: true,
                message,
                severityType: 'success',
            });
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to delete company";

            // Show error snackbar
            setIsSnackbarsOpen({
                ...issnackbarsOpen,
                open: true,
                message: errorMessage,
                severityType: 'error',
            });
        }
        const updatedData = await fetchAllModule();
        setData(updatedData);
    };



    const handleCheckboxClick = async (rowId) => {
        try {
            const response = await updateModuleApprovalStatusById(rowId);
            const message = response?.message || "Status update successfully"
            // Show success snackbar
            setIsSnackbarsOpen({
                ...issnackbarsOpen,
                open: true,
                message,
                severityType: 'success',
            });
        } catch (error) {
            // Show error snackbar
            setIsSnackbarsOpen({
                ...issnackbarsOpen,
                open: true,
                message: error?.response?.data?.message,
                severityType: 'error',
            });
        }
        const updatedData = await fetchAllModule();
        setData(updatedData);
    };

    const generateDynamicColDefs = (data) => {
        if (!data || data.length === 0) return [];

        const sample = flattenObject(data[0]);

        return Object.keys(sample)
            .map((key) => {
                // Skip unwanted fields
                if (
                    key === "_id" ||
                    key === "common_attributes.is_active" ||
                    key === "common_attributes.is_deleted" ||
                    key === "common_attributes.deleted_by" ||
                    key === "common_attributes.deleted_at"
                )
                    return null;

                // ✅ Special case for approval_status
                if (key === "common_attributes.approval_status") {
                    return {
                        field: key,
                        headerName: "Approval Status",
                        filter: true,
                        editable: false,
                        valueGetter: (params) =>
                            params.data?.common_attributes?.approval_status,
                        cellRenderer: (params) => {
                            const status = params.value ?? 0;

                            const handleChange = async (e) => {
                                const checked = e.target.checked;

                                // UI Update Immediately (Optimistic Update)
                                params.node.setDataValue(
                                    "common_attributes.approval_status",
                                    checked ? 1 : 0,
                                );

                                // Optional: API Call
                                try {
                                    await handleCheckboxClick(params.data._id, checked ? 1 : 0);
                                } catch {
                                    // Revert if API fails
                                    params.node.setDataValue(
                                        "common_attributes.approval_status",
                                        status,
                                    );
                                }
                            };

                            return (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={status === 1}
                                        disabled={status === 1} // Approved hone ke baad disable
                                        onChange={handleChange}
                                        style={{
                                            width: 15,
                                            height: 15,
                                            accentColor: "orange",
                                            cursor: status === 1 ? "not-allowed" : "pointer",
                                        }}
                                    />
                                    <span
                                        style={{
                                            color: status === 1 ? "green" : "orange",
                                            fontSize: "0.8rem",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {status === 1 ? "Approved" : "Pending"}
                                    </span>
                                </div>
                            );
                        },
                    };
                }

                // ✅ Default column definition
                return {
                    field: key,
                    headerName: key
                        .split(".")
                        .pop()
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase()),

                    filter: true,
                    editable: false,
                    headerStyle: {
                        color: "#515151",
                        backgroundColor: "#ffffe24d",
                    },

                    valueGetter: (params) => {
                        return key
                            .split(".")
                            .reduce((acc, part) => acc?.[part], params.data);
                    },
                };
            })
            .filter(Boolean);
    };

    const colDefs = [
        {
          flex: 0,
          width: 130,
          minWidth: 130,
          maxWidth: 130,
            headerName: 'Actions',
            field: 'actions',
            filter: false,
            editable: false,
            pinned: "left",
            cellStyle: { 'background-color': 'rgb(252 229 205 / 64%)' },
            cellRenderer: (params) => {
                return (
                    <div className="d-flex justify-content-around align-items-center">

                        <button
                            className="btn btn-sm"
                            onClick={() => {
                                setCurrent(params.data);
                                setIsEditing(true);
                                setIsModalOpen(true);
                                setModuleId(params.data._id); // OR .user_id based on your data
                            }}
                        >
                            <EditIcon fontSize="small" className="action_icon" />
                        </button>
                        <button
                            className="btn btn-sm"
                            onClick={() => {
                                setModuleId(params.data._id);
                                setIsDeleteModalOpen(true);
                            }}
                        >
                            <DeleteIcon fontSize="small" className="action_icon" />
                        </button>
                        {/* <button
                            className="btn btn-sm"
                            onClick={() => {
                                setModuleId(params.data._id);
                                setIsDeleteModalOpen(true);
                            }}
                        >
                            <VisibilityIcon fontSize="small" className="action_icon" />
                        </button> */}
                        {/* <VisibilityIcon/> */}
                    </div>
                );
            }
        },
        ...generateDynamicColDefs(data),
        {
          flex: 0,
          width: 120,
          minWidth: 120,
          maxWidth: 120,
            headerName: 'Status',
            field: 'common_attributes.is_active',
            editable: false,
            pinned: "right",
            valueGetter: (params) => params.data?.common_attributes?.is_active,
            cellRenderer: (params) => (
                <Toggle
                    checked={!!params.value}
                    onChange={(e) => handleToggleChange(e, params)}
                />
            )
        }

    ];
    const gridRef = useRef();
    const defaultColDef = {
      resizable: true,
      flex: 1,
      minWidth: 140,
        sortable: true,
        filter: true,
        editable: true,
        headerStyle: { color: '#515151', backgroundColor: '#ffffe24d' },
    };
    const onRowValueChanged = () => {
        //  // console.log('Row updated:', event.data);
    };
    const onFilterTextBoxChanged = useCallback(() => {
        gridRef.current.api.setGridOption(
            'quickFilterText',
            document.getElementById('filter-text-box').value
        );
    }, []);
    return (
        <div>
            <div className='service-tracker-inner-page-header d-lg-flex d-md-flex'>
                <div className="notification-page-title">
                    <div>
                        <h1>{data?.length > 1 ? "Modules" : "Module"}</h1>
                    </div>
                </div>
                <div className='d-lg-flex d-md-flex gap-2 mt-2'>
                    <button className='crud_btn w-100 mb-2' onClick={openModal}>
                        <span><AddIcon /></span> <span className='button-style'>Add New Module</span>
                    </button>
                    <div className='btn-wrap-div'>
                        <button className="button approve w-100 justify-content-center" onClick={() => handleApproveAll()}>
                            <span className="icon">
                                <svg viewBox="0 0 24 24">
                                    <path d="M9 16.17L4.83 12 3.41 13.41 9 19 21 7 19.59 5.59z" />
                                </svg>
                            </span>
                            <span className="text">Approve</span>
                        </button>
                    </div>
                </div>
            </div>
            <Snackbars issnackbarsOpen={issnackbarsOpen} setIsSnackbarsOpen={setIsSnackbarsOpen} />
            <SmallSizeModal closeModal={closeModal} crudForm={crudForm} crudTitle={crudTitle} isEditing={isEditing} editCrudTitle={editCrudTitle} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
            <DeleteModal deleteForm={deleteModal} deleteTitle='Delete User' isModalOpen={isDeleteModalOpen} setIsModalOpen={setIsDeleteModalOpen} />

            <div className='table_div p-3'>
                <div className='d-flex align-items-center gap-2'>
                    <AnimatedSearchBar placeholder="Search..." type="text" id="filter-text-box" onInput={onFilterTextBoxChanged} />
                    <MultiSelectFilter
                        rowData={data}
                        onFilterApply={handleFilterApply}
                    />
                    {/* <div className='d-lg-flex d-md-flex  justify-content-end mb-3'>
                        <div>
                            <button className='crud_btn w-100' onClick={openModal}>
                                <span><AddIcon /></span>
                                <span className='button-style'>Add New Module</span>
                            </button>
                        </div>

                    </div> */}
                </div>
                <div className="ag-theme-quartz" style={{ height: '600px', width: '100%', marginTop: '1rem' }}>
                    <AgGridReact
                        theme="legacy"
                        ref={gridRef}
                        rowData={filteredRowData}
                        columnDefs={colDefs}
                        defaultColDef={defaultColDef}
                        editType="fullRow"
                        rowSelection="single"
                        pagination={true}
                        // rowBuffer={rowBuffer}
                        onRowValueChanged={onRowValueChanged}

                    />
                </div>
            </div>
        </div>
    );
};

export default Module;
