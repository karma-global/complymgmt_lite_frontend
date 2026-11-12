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
import MultipleSelectTextFields from "./MuiInputs/MultipleSelectTextFields";
import Chip from "@mui/material/Chip";
import MuiTextAreaField from "./MuiInputs/MuiTextAreaField";
import { useNavigate } from "react-router-dom";
import { AnimatedSearchBar } from "./AnimatedSearchBar";
import { decryptData } from "../page/utils/encrypt";
import { usePageAccess } from "../page/utils/usePageAccess";
import MultiSelectFilter from '../page/dashboardDrawerGridDetailPage/MultiSelectFilter';
import { blankAsDash } from '../dashboards/common/dashboardUtils';
import dayjs from "dayjs";
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
    // A tracker covers one or more sub-modules of its module
    sub_module_id: [],
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
        const cell = row[column];
        // Array columns (sub_module_name) match when any element is chosen
        return Array.isArray(cell)
          ? cell.some((v) => values.includes(v))
          : values.includes(cell);
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
    if (!current?.sub_module_id?.length)
      tempErrors.sub_module_id = "Select at least one sub-module";
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
      // Update replaces the whole list, so always send every selected sub-module
      SubModuleIDs: current?.sub_module_id ?? [],
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
      // Keep the form open so the user can fix what the backend rejected
      return;
    }
    // Reset form state
    setCurrent({
      _id: null,
      service_tracker_name: "",
      group_holding_account_owner: "",
      created_at: "",
      group_name: "",
      sub_module_id: [],
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
                sub_module_id: [],
              }));
              setSubModuleName([]);
            }}
            // names={moduleName}
            names={moduleName.map((item) => ({
              _id: item._id,
              name: item.module_name,
            }))}
            error={!!errors.module_name}
            helperText={errors.module_name}
          />
          <MultipleSelectTextFields
            label="Sub-Modules"
            isRequired={true}
            value={subModuleName
              .filter((item) => (current?.sub_module_id ?? []).includes(item._id))
              .map((item) => item.sub_module_name)}
            onChange={(selectedNames) => {
              const selectedIds = subModuleName
                .filter((item) => selectedNames.includes(item.sub_module_name))
                .map((item) => item._id);
              setCurrent((prev) => ({ ...prev, sub_module_id: selectedIds }));
              setErrors((prevErrors) => ({ ...prevErrors, sub_module_id: "" }));
            }}
            names={subModuleName.map((item) => ({
              _id: item._id,
              name: item.sub_module_name,
            }))}
            error={!!errors.sub_module_id}
            helperText={errors.sub_module_id}
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

  const approvalStatusRenderer = (params) => {
    const status = params.value ?? 0;

    const handleChange = async (e) => {
      const checked = e.target.checked;

      // UI Update Immediately (Optimistic Update)
      params.node.setDataValue(
        "common_attributes.approval_status",
        checked ? 1 : 0,
      );

      try {
        await handleCheckboxClick(params.data._id, checked ? 1 : 0);
      } catch {
        // Revert if API fails
        params.node.setDataValue("common_attributes.approval_status", status);
      }
    };

    return (
      <div className="d-flex align-items-center gap-2 h-100">
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
  };

  // A fixed set of readable columns sized to fit the card; raw ids and audit user ids stay out
  const colDefs = [
    {
      flex: 0,
      width: 96,
      headerName: "Actions",
      field: "actions",
      filter: false,
      sortable: false,
      resizable: false,
      pinned: "left",
      cellStyle: { "background-color": "rgb(252 229 205 / 64%)" },
      cellRenderer: (params) => {
        return (
          <div className="d-flex justify-content-around align-items-center h-100">
            {canUpdate && (
            <button
              className="btn btn-sm p-1"
              onClick={() => {
                setCurrent(params.data);
                setIsEditing(true);
                setIsModalOpen(true);
              }}
            >
              <EditIcon fontSize="small" className="action_icon" />
            </button>
            )}
            {canDelete && (
            <button
              className="btn btn-sm p-1"
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
      headerName: "Service Tracker",
      flex: 1.2,
      minWidth: 150,
      tooltipField: "service_tracker_name",
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
    {
      field: "module_name",
      headerName: "Module",
      minWidth: 110,
      tooltipField: "module_name",
      valueFormatter: blankAsDash,
    },
    {
      field: "sub_module_name",
      headerName: "Sub Modules",
      flex: 1.5,
      minWidth: 140,
      // Joined text drives the column filter, quick search and the hover tooltip
      valueGetter: (params) => (params.data?.sub_module_name ?? []).join(", "),
      tooltipValueGetter: (params) => params.value,
      // One line at the normal row height; extra chips are cut off, full list on hover
      cellRenderer: (params) => (
        <div className="d-flex flex-nowrap align-items-center gap-1 h-100 overflow-hidden">
          {(params.data?.sub_module_name ?? []).map((name) => (
            <Chip key={name} label={name} size="small" sx={{ flexShrink: 0 }} />
          ))}
        </div>
      ),
    },
    {
      field: "service_tracker_description",
      headerName: "Description",
      flex: 1.5,
      minWidth: 140,
      tooltipField: "service_tracker_description",
      valueFormatter: blankAsDash,
    },
    {
      field: "common_attributes.approval_status",
      headerName: "Approval",
      flex: 0,
      width: 120,
      valueGetter: (params) => params.data?.common_attributes?.approval_status,
      cellRenderer: approvalStatusRenderer,
    },
    {
      colId: "last_updated",
      headerName: "Last Updated",
      flex: 0,
      width: 120,
      filter: false,
      // Raw "YYYY-MM-DD HH:mm:ss" sorts correctly; shown as a short date
      valueGetter: (params) =>
        params.data?.common_attributes?.updated_at ||
        params.data?.common_attributes?.created_at ||
        "",
      valueFormatter: (params) =>
        params.value ? dayjs(params.value).format("DD MMM YYYY") : "—",
      tooltipValueGetter: (params) =>
        params.value ? dayjs(params.value).format("DD MMM YYYY, hh:mm A") : null,
    },
    {
      flex: 0,
      width: 96,
      headerName: "Status",
      field: "common_attributes.is_active",
      filter: false,
      resizable: false,
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
    minWidth: 100,
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
            filterColumns={["service_tracker_name", "module_name", "sub_module_name"]}
          />
        </div>
        <div
          className="ag-theme-quartz service-tracker-grid"
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
            tooltipShowDelay={300}
          />
        </div>
      </div>
    </div>
  );
};

export default ServiceTrackers;
