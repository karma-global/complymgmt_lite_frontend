import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import "../style/useRole.css";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MuiTextField from "../component/MuiInputs/MuiTextField";
import AddIcon from "@mui/icons-material/Add";
import {
  bulkApproveAllPageData,
  createServiceTracker,
  deleteServiceTrackerById,
  fetchAllServiceTracker,
  fetchAllSubModuleNameByModuleId,
  updateServiceTrackerById,
  updateServiceTrackerByStatusId,
  updateServiceTrackerApprovalStatusById,
  fetchAllModule,
} from "../api/service";
import Snackbars from "../component/Snackbars";
import DeleteModal from "../component/DeleteModal";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import Toggle from "../component/Toggle";
import Modal from "./Modal";
import SingleSelectTextField from "./MuiInputs/SingleSelectTextField";
import MuiTextAreaField from "./MuiInputs/MuiTextAreaField";
import { useNavigate } from "react-router-dom";
import { AnimatedSearchBar } from "./AnimatedSearchBar";
import { decryptData } from "../page/utils/encrypt";
import { usePageAccess } from "../page/utils/usePageAccess";
import MultiSelectFilter from '../page/dashboardDrawerGridDetailPage/MultiSelectFilter';
import { flattenObject } from '../../Utils/tableColUtils';
// Register module
ModuleRegistry.registerModules([AllCommunityModule]);

const ServiceTrackers = () => {
  // Hide or disable actions the user's service_tracker grant doesn't allow
  const { canCreate, canUpdate, canDelete } = usePageAccess("service_tracker");
  const [data, setData] = useState([]);
  const [errors, setErrors] = useState({});
  const [current, setCurrent] = useState({
    _id: null,
    service_tracker_name: "",
    group_holding_id: null,
    group_name: "",
    company_name: "",
    company_id: null,
    location_name: "",
    location_id: "",
    module_name: "",
    module_id: null,
    sub_module_name: "",
    sub_module_id: null,
    service_tracker_description: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // const [userId, setUserId] = useState(null)
  const [issnackbarsOpen, setIsSnackbarsOpen] = useState({
    open: false,
    vertical: "top",
    horizontal: "center",
    message: "",
    severityType: "",
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

  const [serviceTrackerId, setServiceTrackerId] = useState(null);
  const [moduleName, setModuleName] = useState([]);
  const [subModuleName, setSubModuleName] = useState([]);
  const navigate = useNavigate();
  const SystemUserId = decryptData(localStorage.getItem("user_id"));
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrent((prev) => ({ ...prev, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const validate = () => {
    let tempErrors = {};
    if (!current?.service_tracker_name)
      tempErrors.service_tracker_name = "Tracker name is required";
    if (!current?.module_name)
      tempErrors.module_name = "Module name is required";
    if (!current?.sub_module_name)
      tempErrors.sub_module_name = "Sub Module name is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
  const handleApproveAll = async () => {
    try {
      const response = await bulkApproveAllPageData("service_tracker");
      const message = response?.message || "Status update successfully";
      // Show success snackbar
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message,
        severityType: "success",
      });
    } catch (error) {
      // Show error snackbar
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: error?.response?.data?.message,
        severityType: "error",
      });
    }
    const updatedData = await fetchAllServiceTracker();
    setData(updatedData);
  };
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default submit behavior
    if (!validate()) return; // Don't proceed if validation fails
    const CommonAttributes = {
      [isEditing ? "Updated_By" : "Created_By"]: SystemUserId || "",
    };
    const payload = {
      ServiceTrackerName: current?.service_tracker_name,
      ServiceTrackerDescription: current?.service_tracker_description,
      SubModuleID: current?.sub_module_id,
      ModuleID: current?.module_id,
      CommonAttributes: CommonAttributes,
    };
    try {
      let response;
      if (isEditing) {
        response = await updateServiceTrackerById(current?._id, payload);
        setIsEditing(false);
      } else {
        response = await createServiceTracker(payload);
      }

      const message = response?.message;
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: message,
        severityType: "success",
      });
      const updatedData = await fetchAllServiceTracker();
      setData(updatedData);
    } catch (error) {
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: error?.response?.data?.message,
        severityType: "error",
      });
    }
    // Reset form state
    setCurrent({
      _id: null,
      service_tracker_name: "",
      group_holding_account_owner: "",
      created_at: "",
      group_name: "",
    });
    setIsEditing(false);
    setIsModalOpen(false);
    setErrors({}); // ✅ Reset errors after submission
  };

  // Handle Delete
  const handleDelete = async (serviceTrackerId) => {
    try {
      const response = await deleteServiceTrackerById(serviceTrackerId);
      const message = response?.message || "Group holding  successfully";
      // Refresh data
      const updatedData = await fetchAllServiceTracker();
      setData(updatedData);
      setIsDeleteModalOpen(false);

      // Show success snackbar
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message,
        severityType: "success",
      });
    } catch (error) {
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: error?.response?.data?.message,
        severityType: "error",
      });
    }
  };

  // Function to open the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setErrors({});
    setCurrent({});
    setIsEditing(false);
  };
  // Active/InActive status
  const handleToggleChange = async (e, params) => {
    const newIsActive = {
      IsActive: e.target.checked,
    };
    try {
      const response = await updateServiceTrackerByStatusId(
        params.data._id,
        newIsActive,
      );
      const message = response?.message || "Status update successfully";
      // Show success snackbar
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message,
        severityType: "success",
      });
    } catch (error) {
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: error?.response?.data?.message,
        severityType: "error",
      });
    }
    const updatedData = await fetchAllServiceTracker();
    setData(updatedData);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          fetchAllServiceTracker(),
          fetchAllModule(),
        ]);

        const [serviceTrackerResult, moduleNameResult] = results;

        if (serviceTrackerResult.status === "fulfilled") {
          setData(serviceTrackerResult.value);
        } else {
          //  handle error silently
        }

        if (moduleNameResult.status === "fulfilled") {
          setModuleName(moduleNameResult.value);
        } else {
          // handle error silently
        }
      } catch {
        // handle error silently
      }
    };

    fetchData();
  }, []);

  // sub-module by module id
  useEffect(() => {
    const fetchSubModuleByModuleId = async () => {
      try {
        const data = await fetchAllSubModuleNameByModuleId(current?.module_id);
        if (data) {
          setSubModuleName(data);
        }
      } catch {
        // Handle error if needed
      }
    };

    if (current?.module_id) {
      fetchSubModuleByModuleId();
    }
  }, [current?.module_id]);

  const crudForm = () => {
    return (
      <div>
        <div className="d-lg-flex d-md-flex gap-2">
          <MuiTextField
            label="Service Tracker Name"
            type="text"
            isRequired={true}
            fieldName="service_tracker_name"
            handleChange={handleChange}
            value={current.service_tracker_name}
            error={!!errors.service_tracker_name}
            helperText={errors.service_tracker_name}
          />
        </div>
        <div className="d-lg-flex d-md-flex gap-2">
          <SingleSelectTextField
            name="module_name"
            label="Module"
            value={current.module_name}
            onChange={(e) => {
              const selectedName = e.target.value;
              const matchedGroup = moduleName.find(
                (g) => g.module_name === selectedName,
              );
              setCurrent((prev) => ({
                ...prev,
                module_name: selectedName,
                module_id: matchedGroup?._id || null,
              }));
            }}
            // names={moduleName}
            names={moduleName.map((item) => ({
              _id: item._id,
              name: item.module_name,
            }))}
            error={!!errors.module_name}
            helperText={errors.module_name}
          />
          <SingleSelectTextField
            name="sub_module_name"
            label="Sub-Module"
            value={current?.sub_module_name}
            onChange={(e) => {
              const selectedName = e.target.value;
              const matchedGroup = subModuleName.find(
                (g) => g.sub_module_name === selectedName,
              );
              setCurrent((prev) => ({
                ...prev,
                sub_module_name: selectedName,
                sub_module_id: matchedGroup?._id || null,
              }));
            }}
            names={subModuleName.map((item) => ({
              _id: item._id,
              name: item.sub_module_name,
            }))}
            error={!!errors.sub_module_name}
            helperText={errors.sub_module_name}
          />
        </div>
        <MuiTextAreaField
          value={current.service_tracker_description}
          handleChange={handleChange}
          name="service_tracker_description"
          label="Description"
        />

        <div className="row row-gap-2">
          <div className="col-6">
            <button
              type="button"
              className="btn btn-secondary"
               onClick={closeModal}
            >
              <span className="button-style">Cancel</span>
            </button>
          </div>
          <div className="col-6 d-flex justify-content-end">
            <button
              type="submit"
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              {isEditing ? (
                <span className="button-style">Save Changes</span>
              ) : (
                <span className="button-style">Create Service Tracker</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };
  const crudTitle = "Add New Service Tracker";
  const deleteModal = () => {
    return (
      <div>
        <div className="delete_message p-4">
          Are you sure you want to delete <DeleteIcon className="action_icon" />{" "}
          this service tracker?
        </div>

        <div className="row row-gap-2 mt-4">
          <div className="col-6">
            <button
              type="button"
              className="btn-sm btn btn-secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              <span className="button-style">Cancel</span>
            </button>
          </div>
          <div className="col-6 d-flex justify-content-end">
            <button
              type="submit"
              className="btn-sm btn btn-primary"
              onClick={() => handleDelete(serviceTrackerId)}
            >
              Yes, I'm sure
            </button>
          </div>
        </div>
      </div>
    );
  };


  const handleCheckboxClick = async (id) => {
    try {
      const response = await updateServiceTrackerApprovalStatusById(id, {
        ApprovalStatus: 1,
      });
      const message = response?.message || "Status update successfully";
      // Show success snackbar
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message,
        severityType: "success",
      });
    } catch (error) {
      // Show error snackbar
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: error?.response?.data?.message,
        severityType: "error",
      });
    }
    const updatedData = await fetchAllServiceTracker();
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
                    disabled={status === 1 || !canUpdate} // Approved hone ke baad disable
                    onChange={handleChange}
                    style={{
                      width: 15,
                      height: 15,
                      accentColor: "orange",
                      cursor: status === 1 || !canUpdate ? "not-allowed" : "pointer",
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
      headerName: "Actions",
      field: "actions",
      filter: false,
      editable: false,
      pinned: "left",
      cellStyle: { "background-color": "rgb(252 229 205 / 64%)" },
      cellRenderer: (params) => {
        return (
          <div className="d-flex justify-content-around align-items-center">
            {canUpdate && (
            <button
              className="btn btn-sm"
              onClick={() => {
                setCurrent(params.data);
                setIsEditing(true);
                setIsModalOpen(true);
                // setUserId(params.data._id);
              }}
            >
              <EditIcon fontSize="small" className="action_icon" />
            </button>
            )}
            {canDelete && (
            <button
              className="btn btn-sm"
              onClick={() => {
                setServiceTrackerId(params.data._id);
                setIsDeleteModalOpen(true);
              }}
            >
              <DeleteIcon fontSize="small" className="action_icon" />
            </button>
            )}
          </div>
        );
      },
    },
    {
      field: "service_tracker_name",
      headerName: "Service Tracker Name",
      filter: true,
      editable: false,
      cellRenderer: (params) => (
        <span
          style={{
            color: "#1976d2",
            cursor: "pointer",
            textDecoration: "underline",
          }}
          onClick={() =>
            navigate(
              `/service/${encodeURIComponent(params.data.service_tracker_name)}/${params.data._id}`,
            )
          }
        >
          {params.value}
        </span>
      ),
    },
    ...generateDynamicColDefs(data),

    {
      flex: 0,
      width: 120,
      minWidth: 120,
      maxWidth: 120,
      headerName: "Status",
      field: "common_attributes.is_active",
      editable: false,
      pinned: "right",
      valueGetter: (params) => params.data?.common_attributes?.is_active,
      cellRenderer: (params) => (
        <Toggle
          checked={!!params.value}
          onChange={(e) => handleToggleChange(e, params)}
          disabled={!canUpdate}
        />
      ),
    },
  ];

  const gridRef = useRef();
  const defaultColDef = {
    resizable: true,
    flex: 1,
    minWidth: 140,
    sortable: true,
    filter: true,
    // No inline editing: nothing saves cell edits; changes go through the Edit form
    editable: false,
    headerStyle: { color: "#515151", backgroundColor: "#ffffe24d" },
  };

  const onFilterTextBoxChanged = useCallback(() => {
    gridRef.current.api.setGridOption(
      "quickFilterText",
      document.getElementById("filter-text-box").value,
    );
  }, []);
  return (
    <div>
      <div className="service-tracker-inner-page-header d-lg-flex d-md-flex">
        <div className="notification-page-title">
          <div>
            <h1>{data?.length > 1 ? "Service Trackers" : "Service Tracker"}</h1>
          </div>
        </div>
        <div className="d-lg-flex d-md-flex gap-2 mt-2">
          {canCreate && (
          <button className="crud_btn w-100 mb-2" onClick={openModal}>
            <span>
              <AddIcon />
            </span>{" "}
            <span className="button-style">Add Service Tracker</span>
          </button>
          )}
          {canUpdate && (
          <div className="btn-wrap-div">
            <button
              className="button approve w-100 justify-content-center"
              onClick={() => handleApproveAll()}
            >
              <span className="icon">
                <svg viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12 3.41 13.41 9 19 21 7 19.59 5.59z" />
                </svg>
              </span>
              <span className="text">Approve </span>
            </button>
          </div>
          )}
        </div>
      </div>
      <Snackbars
        issnackbarsOpen={issnackbarsOpen}
        setIsSnackbarsOpen={setIsSnackbarsOpen}
      />
      <DeleteModal
        deleteForm={deleteModal}
        deleteTitle="Delete Service Tracker"
        isModalOpen={isDeleteModalOpen}
        setIsModalOpen={setIsDeleteModalOpen}
      />

      <Modal
        crudForm={crudForm}
        crudTitle={crudTitle}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        closeModal={closeModal}
      />

      <div className="table_div p-3">
        <div className='d-flex align-items-center gap-2'>
          <AnimatedSearchBar
            placeholder="Search..."
            type="text"
            id="filter-text-box"
            onInput={onFilterTextBoxChanged}
          />
          <MultiSelectFilter
            rowData={data}
            onFilterApply={handleFilterApply}
          />
        </div>
        <div
          className="ag-theme-quartz"
          style={{ height: "600px", width: "100%", marginTop: "1rem" }}
        >
          <AgGridReact
            theme="legacy"
            ref={gridRef}
            rowData={filteredRowData}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            rowSelection="single"
            pagination={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ServiceTrackers;
