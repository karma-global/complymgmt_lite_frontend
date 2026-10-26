
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import '../style/useRole.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MuiTextField from '../component/MuiInputs/MuiTextField';
import AddIcon from '@mui/icons-material/Add';
import SmallSizeModal from '../component/SmallSizeModal';
import SingleSelectTextField from '../component/MuiInputs/SingleSelectTextField';
import { bulkApproveAllPageData, createLocation, deleteLocationById, fetchAllGroupHolding, fetchAllLocation, fetchCompaniesNameByGroupId, fetchEntityById, updateLocationById, updateLocationStatusById, updateCompanyLocationApprovalStatusById, } from '../api/service';
import DeleteModal from '../component/DeleteModal';
import Snackbars from '../component/Snackbars';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import Toggle from '../component/Toggle';
import { AnimatedSearchBar } from '../component/AnimatedSearchBar';
import MultiSelectFilter from './dashboardDrawerGridDetailPage/MultiSelectFilter';
import { flattenObject } from "../../Utils/tableColUtils";
ModuleRegistry.registerModules([AllCommunityModule]);

const Location = () => {
    const [data, setData] = useState([]);
    const [current, setCurrent] = useState(
        {
            _id: null,
            group_holding_id: null,
            company_name: '',
            company_id: null,
            entity_name: '',
            entity_id: null,
            group_name: '',
            created_at: '',
            location_name: "",
            location_id: null,
            updated_at: '',
            city: '',
            state: '',
            location_address: '',
            location_description: ''
        });
    console.log("current", current);
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groupHoldingData, setGroupHoldinData] = useState([])
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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
    const [locationId, setLocationId] = useState(null);
    const [companyNameByGroupHoldingId, setCompanyNameByGroupHoldingId] = useState([])
    const [entityList, setEntityList] = useState([])
    const [errors, setErrors] = useState({});

    const validate = () => {
        let tempErrors = {};
        if (!current?.company_name) tempErrors.company_name = "Company name is required";
        if (!current?.location_name) tempErrors.location_name = "Location name is required";
        if (!current?.group_name) tempErrors.group_name = "Group name is required";
        // if (!current?.location_description) tempErrors.location_description = "Description is required";
        if (!current?.city) tempErrors.city = "City is required";
        if (!current?.state) tempErrors.state = "State is required";

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
            const response = await bulkApproveAllPageData('company_location');
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
                "Failed to update user sataus";

            // Show error snackbar
            setIsSnackbarsOpen({
                ...issnackbarsOpen,
                open: true,
                message: errorMessage,
                severityType: 'error',
            });
        }
        const updatedData = await fetchAllLocation();
        setData(updatedData);
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!validate()) return; // Don't proceed if validation fails
        const CommonAttributes = {
            [isEditing ? "Updated_By" : "Created_By"]: "68480959d7038d326905b02c"
        };
        const payload = {
            "GroupHoldingsID": current?.group_holding_id,
            "CompanyID": current?.company_id,
            "EntityID": current?.entity_id,
            "LocationName": current?.location_name,
            "LocationDescription": current?.location_description,
            "LocationAddress": current?.location_address,
            "City": current?.city,
            "State": current?.state,
            "CommonAttributes": CommonAttributes
        };
        console.log(payload);
        try {
            if (isEditing) {
                // Update existing location
                const response = await updateLocationById(current._id, payload);
                const message = response?.message || "Location updated successfully";
                setIsSnackbarsOpen({
                    ...issnackbarsOpen,
                    open: true,
                    message: message,
                    severityType: 'success',
                });
            } else {
                // Create new location
                const response = await createLocation(payload);
                const message = response?.message || "Location created successfully";
                setIsSnackbarsOpen({
                    ...issnackbarsOpen,
                    open: true,
                    message: message,
                    severityType: 'success',
                });
            }
            // Refresh data
            const updatedData = await fetchAllLocation();
            setData(updatedData);

            // Reset form state
            setCurrent({
                company_id: null,
                company_name: '',
                entity_name: '',
                entity_id: null,
                group_name: '',
                group_holding_id: null,
                created_at: '',
                updated_at: '',
                location_description: '',
                location_address: '',
            });

            setIsEditing(false);
            setIsModalOpen(false);
        } catch (error) {
            setIsSnackbarsOpen({ ...issnackbarsOpen, open: true, message: error?.response?.data?.message, severityType: 'error' });
        }

    };

    const handleDelete = async (locationId) => {
        try {
            const response = await deleteLocationById(locationId);
            const message = response?.message || "Company deleted successfully";

            // Refresh data
            const updatedData = await fetchAllLocation();
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

    // Function to open the modal
    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setErrors({})
        setCurrent({})
        setIsEditing(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [locationData, groupHolding,] = await Promise.all([
                    fetchAllLocation(),
                    fetchAllGroupHolding(),
                ]);
                setData(locationData);
                setGroupHoldinData(groupHolding);

            } catch {
                // handle error silently
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const data = await fetchCompaniesNameByGroupId(current?.group_holding_id);
                if (data) {
                    setCompanyNameByGroupHoldingId(data);
                }
            } catch {
                // handle error silently
            }
        };

        if (current?.group_holding_id) {
            fetchCompany();
        } else {
            // clear company dropdown
            setCompanyNameByGroupHoldingId([]);

            // clear entity dropdown
            setEntityList([]);
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
                // handle error silently
                setEntityList([]);
            }
        };

        if (current?.company_id) {
            fetchEntities();
        } else {
            setEntityList([]);

            setCurrent((prev) => ({
                ...prev,
                entity_name: '',
                entity_id: null,
            }));
        }
    }, [current?.company_id]);

    const handleToggleChange = async (e, params) => {
        const newIsActive = {
            "IsActive": e.target.checked
        };
        try {
            const response = await updateLocationStatusById(params.data._id, newIsActive);
            const message = response?.message
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
        const updatedData = await fetchAllLocation();
        setData(updatedData);
    };

    const crudForm = () => {
        return (
            <>
                <div>
                    <SingleSelectTextField
                        name="group_name"
                        label="Group Holding"
                        value={current?.group_name || ''}
                        onChange={(e) => {
                            const selectedName = e.target.value;
                            const matchedGroup = groupHoldingData.find((g) => g.name === selectedName) || {};
                            setCurrent((prev) => ({
                                ...prev,
                                group_name: selectedName,
                                group_holding_id: matchedGroup._id || null,

                                // reset company
                                company_name: '',
                                company_id: null,

                                // reset entity
                                entity_name: '',
                                entity_id: null,
                            }));


                            // clear dropdown data
                            setCompanyNameByGroupHoldingId([]);
                            setEntityList([]);

                            setErrors(prevErrors => ({ ...prevErrors, group_name: '' }));
                        }}
                        names={groupHoldingData}
                        isdisable={isEditing}
                        error={!!errors.group_name}
                        helperText={errors.group_name}
                    />
                </div>

                <div>
                    <SingleSelectTextField
                        name="company_name"
                        label="Company Name"
                        value={current?.company_name || ''}
                        onChange={(e) => {
                            const selectedName = e.target.value;
                            const matchedGroup = companyNameByGroupHoldingId.find((g) => g.company_name === selectedName) || {};
                            setCurrent((prev) => ({
                                ...prev,
                                company_name: selectedName,
                                company_id: matchedGroup._id || null,

                                // reset entity
                                entity_name: '',
                                entity_id: null,
                            }));
                            setErrors(prevErrors => ({ ...prevErrors, company_name: '' }));
                        }}
                        names={companyNameByGroupHoldingId?.map((data) => ({
                            _id: data?._id,
                            name: data?.company_name
                        }))}
                        isdisable={isEditing}
                        error={!!errors.company_name}
                        helperText={errors.company_name}
                    />
                </div>

                <div>
                    <SingleSelectTextField
                        name="entity_name"
                        label="Entity"
                        value={current?.entity_name || ''}
                        onChange={(e) => {

                            const selectedEntity = e.target.value;

                            const matchedEntity = entityList.find(
                                (entity) => entity.name === selectedEntity
                            ) || {};

                            setCurrent((prev) => ({
                                ...prev,
                                entity_name: selectedEntity,
                                entity_id: matchedEntity.id || null,
                            }));

                            setErrors(prevErrors => ({
                                ...prevErrors,
                                entity_name: ''
                            }));
                        }}
                        names={entityList?.map((entity) => ({
                            _id: entity?.id,
                            name: entity?.name
                        }))}
                        error={!!errors.entity_name}
                        helperText={errors.entity_name}
                    />
                </div>
                <div>
                    <MuiTextField
                        label="Location"
                        type="text"
                        isRequired={true}
                        fieldName="location_name"
                        handleChange={handleChange}
                        value={current?.location_name || ''}
                        error={!!errors.location_name}
                        helperText={errors.location_name}
                    />
                </div>

                <div>
                    <MuiTextField
                        label="City"
                        type="text"
                        isRequired={true}
                        fieldName="city"
                        handleChange={handleChange}
                        value={current?.city || ''}
                        error={!!errors.city}
                        helperText={errors.city}
                    />
                </div>

                <div>
                    <MuiTextField
                        label="State"
                        type="text"
                        isRequired={true}
                        fieldName="state"
                        handleChange={handleChange}
                        value={current?.state || ''}
                        error={!!errors.state}
                        helperText={errors.state}
                    />
                </div>


                <div>
                    <MuiTextField
                        label="Address"
                        type="text"
                        isRequired={true}
                        fieldName="location_address"
                        handleChange={handleChange}
                        value={current?.location_address || ''}
                        error={!!errors.location_address}
                        helperText={errors.location_address}
                    />
                </div>

                <div>
                    <MuiTextField
                        label="Description"
                        type="text"
                        // isRequired={true}
                        fieldName="location_description"
                        handleChange={handleChange}
                        value={current?.location_description || ''}
                    />
                </div>

                <div className="row row-gap-2">
                    <div className='col-6'>
                        <button type="button" className="btn btn-secondary" onClick={closeModal}><span className='button-style'>Cancel</span></button>
                    </div>
                    <div className='col-6 d-flex justify-content-end'>
                        <button type="submit" className="btn btn-primary" onClick={handleSubmit}>{isEditing ? <span className='button-style'>Save Changes</span> : <span className='button-style'>Create Location</span>}</button>
                    </div>
                </div>
            </>

        );
    };

    const crudTitle = "Add company Location"
    const editCrudTitle = "Edit Location"

    const deleteModal = () => {
        return (
            <div>
                <div className='delete_message p-4'>
                    Are you sure you want to delete <DeleteIcon className='action_icon' /> this company Location?
                </div>

                <div className="row row-gap-2 mt-4">
                    <div className='col-6'>
                        <button type="button" className="btn-sm btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}><span className='button-style'>Cancel</span></button>
                    </div>
                    <div className='col-6 d-flex justify-content-end'>
                        <button type="submit"
                            className="btn-sm btn btn-primary"
                            onClick={() => handleDelete(locationId)}>Yes, I'm sure</button>
                    </div>
                </div>
            </div>
        )
    }


    const handleCheckboxClick = async (rowId) => {
        const response = await updateCompanyLocationApprovalStatusById(rowId);
        const message = response?.message
        setIsSnackbarsOpen({
            ...issnackbarsOpen,
            open: true,
            message,
            severityType: 'success',
        });

        const updatedData = await fetchAllLocation();
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
                                setLocationId(params.data._id)
                            }}
                        >
                            <EditIcon fontSize="small" className="action_icon" />
                        </button>
                        <button
                            className="btn btn-sm"
                            onClick={() => {
                                setLocationId(params.data._id)
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
        },

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
                        <h1>{data?.length > 1 ? "Locations" : "Location"}</h1>
                    </div>
                </div>
                <div className='d-lg-flex d-md-flex gap-2 mt-2'>
                    <button className='crud_btn w-100 mb-2' onClick={openModal}>
                        <span><AddIcon /></span> <span className='button-style'>Add company Location</span>
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
            <DeleteModal deleteForm={deleteModal} deleteTitle='Delete Location' isModalOpen={isDeleteModalOpen} setIsModalOpen={setIsDeleteModalOpen} />
            <SmallSizeModal crudForm={crudForm} crudTitle={crudTitle} isEditing={isEditing} editCrudTitle={editCrudTitle} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} closeModal={closeModal} />

            {/* Table to display data */}
            <div className='table_div p-3'>
                <div className='d-flex align-items-center gap-2'>
                    <AnimatedSearchBar placeholder="Search..." type="text" id="filter-text-box" onInput={onFilterTextBoxChanged} />
                    <MultiSelectFilter
                        rowData={data}
                        onFilterApply={handleFilterApply}
                    />
                    <div className='d-lg-flex d-md-flex  justify-content-end mb-3'>
                        {/* <div>
                            <button className='crud_btn w-100' onClick={openModal}>
                                <span><AddIcon /></span> <span className='button-style'>Add company Location</span>
                            </button>
                        </div> */}
                    </div>
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

export default Location;
