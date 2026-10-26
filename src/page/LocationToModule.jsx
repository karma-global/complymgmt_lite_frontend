
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import '../style/useRole.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Modal from '../component/Modal';
import SingleSelectTextField from '../component/MuiInputs/SingleSelectTextField';
import { bulkApproveAllPageData, createsLocationToModule, deleteLocationToModuleByStatusId, fetchAllGroupHolding, fetchAllModulesName, fetchAllSubModuleNameByModuleId, fetchCompaniesNameByGroupId, fetchLocationToModuleModule, getLocationByCompanyId, updateLocationToModuleById, updateLocationToModuleByStatusId, updateLocationToModulesApprovalStatusById, fetchEntityById, getAllCompanyLocationByEntityId } from '../api/service';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import DeleteModal from '../component/DeleteModal';
import Snackbars from '../component/Snackbars';
import Toggle from '../component/Toggle';
import { AnimatedSearchBar } from '../component/AnimatedSearchBar';
import { Link } from 'lucide-react';
import { decryptData } from './utils/encrypt';
import MultiSelectFilter from './dashboardDrawerGridDetailPage/MultiSelectFilter';
import { flattenObject } from '../../Utils/tableColUtils';
ModuleRegistry.registerModules([AllCommunityModule]);

const LocationToModule = () => {
    const [data, setData] = useState([]);
    const [current, setCurrent] = useState(
        {
            id: null,
            module_description: '',
            created_at: '',
            updated_at: '',
            desc: '',
            approved_by: '',
            group_name: "",
            group_holding_id: null,
            company_name: "",
            company_id: null,
            entity_name: '',
            entity_id: null,
            location_name: "",
            location_id: null,
            module_name: '',
            module_id: null,
            sub_module_name: '',
            sub_module_id: null,
        });
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [id, setId] = useState(null)
    const [groupHoldingName, setGroupHoldingName] = useState([])
    const [companyName, setCompanyName] = useState([])
    const [locationName, setLocationName] = useState([])
    const [entityList, setEntityList] = useState([])
    const [moduleName, setModuleName] = useState([])
    const [subModuleName, setSubModuleName] = useState([])
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
    const crudTitle = "Tag Subscribe Modules & Sub-Modules"
    const editCrudTitle = "Edit Tagged Subscribe Modules & Sub-Modules"
    const SystemUserId = decryptData(localStorage.getItem("user_id"));
    const validate = () => {
        let tempErrors = {};
        if (!current?.group_name) tempErrors.group_name = "Group Holding is required";
        if (!current?.company_name) tempErrors.company_name = "Company is required";
        if (!current?.location_name) tempErrors.location_name = "Location is required";
        if (!current?.module_name) tempErrors.module_name = "Module is required";
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleApproveAll = async () => {
        try {
            const response = await bulkApproveAllPageData('location_to_module');
            const message = response?.message || "Status update successfully"
            // Show success snackbar
            setIsSnackbarsOpen({
                ...issnackbarsOpen,
                open: true,
                message,
                severityType: 'success',
            });
        } catch (error) {
            setIsSnackbarsOpen({
                ...issnackbarsOpen,
                open: true,
                message: error?.response?.data?.message,
                severityType: 'error',
            });
        }
        const updatedData = await fetchLocationToModuleModule();
        setData(updatedData);
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!validate()) return; // Don't proceed if validation fails
        const CommonAttributes = {
            [isEditing ? "Updated_By" : "Created_By"]: SystemUserId || "",
        };
        const payload = {
            "CompanyID": current?.company_id,
            "EntityID": current?.entity_id,
            "LocationID": current?.location_id,
            "ModuleID": current?.module_id,
            "SubmoduleID": current?.sub_module_id,
            "CommonAttributes": CommonAttributes
        };

        try {
            let response;
            if (isEditing) {
                // Update existing company
                response = await updateLocationToModuleById(id, payload);
            } else {
                // Create new company
                response = await createsLocationToModule(payload);
            }
            // ✅ Get the message from response
            const message = response?.message;
            setIsSnackbarsOpen({ ...issnackbarsOpen, open: true, message: message, severityType: 'success' });
            // Refresh data
            const updatedData = await fetchLocationToModuleModule();
            setData(updatedData);
        } catch (error) {
            setIsSnackbarsOpen({ ...issnackbarsOpen, open: true, message: error?.response?.data?.message, severityType: 'error' });
        }

        // Reset form state
        setCurrent({
            group_name: "",
            group_holding_id: null,
            company_name: "",
            company_id: null,
            entity_name: '',
            entity_id: null,
            location_name: "",
            location_id: null,
            module_name: '',
            module_id: null,
            sub_module_name: '',
            sub_module_id: null,
        });
        setIsEditing(false);
        setIsModalOpen(false);
    };

    const handleDelete = async (id) => {
        try {
            const response = await deleteLocationToModuleByStatusId(id);
            const message = response?.message || "Module deleted successfully";

            // Refresh data
            const updatedData = await fetchLocationToModuleModule();
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
            setIsSnackbarsOpen({
                ...issnackbarsOpen,
                open: true,
                message: error?.response?.data?.message,
                severityType: 'error',
            });
        }
    };


    // Function to open the modal
    const openModal = () => {
        setIsModalOpen(true);
        setIsEditing(false);
        setErrors({})
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setCurrent({
            group_name: "",
            group_holding_id: null,
            company_name: "",
            company_id: null,
            entity_name: '',
            entity_id: null,
            location_name: "",
            location_id: null,
            module_name: '',
            module_id: null,
        });
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                const results = await Promise.allSettled([
                    fetchLocationToModuleModule(),
                    fetchAllGroupHolding(),
                    fetchAllModulesName(),

                ]);
                if (results[0].status === 'fulfilled') setData(results[0].value);
                if (results[1].status === 'fulfilled') setGroupHoldingName(results[1].value);
                if (results[2].status === 'fulfilled') setModuleName(results[2].value);
                results.forEach((result,) => {
                    if (result.status === 'rejected') {
                        // // console.error(`Error fetching data at index ${idx}:`, result.reason);
                    }
                });
            } catch {
                // // console.error("Error in fetchData:", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchSubModule = async () => {
            try {
                const data = await fetchAllSubModuleNameByModuleId(current?.module_id);
                if (data) {
                    setSubModuleName(data);
                }
            } catch {
                // console.error("Failed to fetch sub module:", error);
            }
        };

        if (current?.module_id) {
            fetchSubModule();
        }
    }, [current?.module_id]);

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
        const fetchEntities = async () => {
            try {
                const data = await fetchEntityById(current?.company_id);

                if (data) {
                    setEntityList(data);

                } else {
                    setEntityList([]);

                }
            } catch {
                setEntityList([]);

            }
        };

        if (current?.company_id) {
            fetchEntities();
        }
    }, [current?.company_id]);

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
    const crudForm = () => {
        return (
            <div>
                <div className='d-lg-flex d-md-flex justify-content-between gap-3'>
                    <SingleSelectTextField
                        name="group_name"
                        label="Group Holding"
                        value={current.group_name}
                        onChange={(e) => {
                            const selectedName = e.target.value;
                            const matchedGroup = groupHoldingName.find(
                                (g) => g.name === selectedName
                            );
                            setCurrent((prev) => ({
                                ...prev,
                                group_name: selectedName,
                                group_holding_id: matchedGroup?._id || null,
                                company_name: '',
                                location_name: '',
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
                            setCurrent((prev) => ({
                                ...prev,
                                company_name: selectedName,
                                company_id: matchedCompany?._id || null,


                                entity_name: '',
                                entity_id: null,
                            }));
                        }}
                        names={companyName.map((item) => ({
                            _id: item._id,
                            name: item.company_name,
                        }))}
                        error={!!errors.company_name}
                        helperText={errors.company_name}
                    />

                    <SingleSelectTextField
                        name="entity_name"
                        label="Entity"
                        value={current?.entity_name || ''}
                        onChange={async (e) => {

                            const selectedEntity = e.target.value;

                            const matchedEntity = entityList.find(
                                (entity) => entity.name === selectedEntity
                            ) || {};

                            const selectedEntityId = matchedEntity.id || null;

                            // entity set karo
                            setCurrent((prev) => ({
                                ...prev,
                                entity_name: selectedEntity,
                                entity_id: selectedEntityId,

                                // location reset
                                location_name: '',
                                location_id: null,
                            }));

                            // agar entity remove kiya
                            if (!selectedEntityId) {

                                const allLocations =
                                    await getLocationByCompanyId(current?.company_id);

                                setLocationName(allLocations || []);

                                return;
                            }

                            try {

                                // selected entity ke locations lao
                                const entityLocations =
                                    await getAllCompanyLocationByEntityId(selectedEntityId);

                                // sirf wahi locations dropdown mai dikhao
                                setLocationName(entityLocations || []);

                            } catch {

                                setLocationName([]);
                            }
                        }}

                        names={entityList?.map((entity) => ({
                            _id: entity?.id,
                            name: entity?.name,
                        }))}
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
                            }));
                        }}

                        names={locationName.map((item) => ({
                            _id: item._id,
                            name: item.location_name,
                        }))}
                        // isdisable={isEditing ? true : false}
                        error={!!errors.location_name}
                        helperText={errors.location_name}

                    />
                </div>
                <div className='d-lg-flex d-md-flex justify-content-between gap-3'>
                    <SingleSelectTextField
                        name="module_name"
                        label="Module"
                        value={current.module_name}
                        onChange={(e) => {
                            const selectedName = e.target.value;
                            const matchedGroup = moduleName.find(
                                (g) => g.name === selectedName
                            );
                            setCurrent((prev) => ({
                                ...prev,
                                module_name: selectedName,
                                module_id: matchedGroup?._id || null,

                            }));
                        }}
                        names={moduleName}
                        error={!!errors.module_name}
                        helperText={errors.module_name}
                    />
                    <SingleSelectTextField
                        name="sub_module_name"
                        label="Sub-Module"
                        value={current?.sub_module_name}
                        // isdisable={isEditing ? true : false}
                        onChange={(e) => {
                            const selectedName = e.target.value;
                            const matchedSubModule = subModuleName.find(
                                (g) => g.sub_module_name === selectedName
                            );
                            setCurrent((prev) => ({
                                ...prev,
                                sub_module_name: selectedName,
                                sub_module_id: matchedSubModule?._id || null,
                            }));
                        }}
                        names={subModuleName?.map((data) => ({
                            _id: data?._id,
                            name: data?.sub_module_name,
                        }))}

                    />

                </div>

                <div className="row row-gap-2">
                    <div className='col-6'>
                        <button type="button" className="btn btn-secondary" onClick={closeModal}><span className='button-style'>Cancel</span></button>
                    </div>
                    <div className='col-6 d-flex justify-content-end'>
                        <button type="submit" className="btn btn-primary" onClick={handleSubmit}>{isEditing ? <span className='button-style'>Save Changes</span> : <span className='button-style'>Tag Module</span>}</button>
                    </div>
                </div>
                {/* </form> */}
            </div>

        )

    }

    const deleteModal = () => {
        return (
            <div>
                <div className='delete_message p-4'>
                    Are you sure you want to delete <DeleteIcon className='action_icon' /> this user Tagged Subscribe Modules & Sub-Modules?
                </div>

                <div className="row row-gap-2 mt-4">
                    <div className='col-6'>
                        <button type="button" className="btn-sm btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}><span className='button-style'>Cancel</span></button>
                    </div>
                    <div className='col-6 d-flex justify-content-end'>
                        <button type="submit"
                            className="btn-sm btn btn-primary"
                            onClick={() => handleDelete(id)}>Yes, I'm sure</button>
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
            const response = await updateLocationToModuleByStatusId(params.data._id, newIsActive);
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
                "Failed to update status";

            // Show error snackbar
            setIsSnackbarsOpen({
                ...issnackbarsOpen,
                open: true,
                message: errorMessage,
                severityType: 'error',
            });
        }
        const updatedData = await fetchLocationToModuleModule();
        setData(updatedData);
    };


    const handleCheckboxClick = async (rowId) => {
        const response = await updateLocationToModulesApprovalStatusById(rowId);
        const message = response?.message

        setIsSnackbarsOpen({
            ...issnackbarsOpen,
            open: true,
            message,
            severityType: 'success',
        })
        const updatedData = await fetchLocationToModuleModule();
        setData(updatedData);
    }

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
                                setId(params.data._id); // OR .user_id based on your data
                            }}
                        >
                            <EditIcon fontSize="small" className="action_icon" />
                        </button>
                        <button
                            className="btn btn-sm"
                            onClick={() => {
                                setId(params.data._id);
                                setIsDeleteModalOpen(true);
                            }}
                        >
                            <DeleteIcon fontSize="small" className="action_icon" />
                        </button>
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
                        {/* <h1>{data?.length > 1 ? "Companies" : "Company"}</h1> */}
                        <h1>Subscribe Modules & Sub-Modules</h1>
                    </div>
                </div>
                <div className='d-lg-flex d-md-flex gap-2 mt-2'>
                    <button className='crud_btn w-100 mb-2' onClick={openModal}>
                        <span><Link style={{ width: '15px', height: '15px' }} /></span> <span className='button-style'>Link </span>
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
            <Modal crudForm={crudForm} crudTitle={crudTitle} isEditing={isEditing} editCrudTitle={editCrudTitle} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} closeModal={closeModal} />
            <DeleteModal deleteForm={deleteModal} deleteTitle='Delete User' isModalOpen={isDeleteModalOpen} setIsModalOpen={setIsDeleteModalOpen} />
            <div className='table_div p-3'>
                <div className='d-flex align-items-center gap-2'>
                    <AnimatedSearchBar placeholder="Search..." type="text" id="filter-text-box" onInput={onFilterTextBoxChanged} />
                    <MultiSelectFilter
                        rowData={data}
                        onFilterApply={handleFilterApply}
                    />
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

export default LocationToModule;
