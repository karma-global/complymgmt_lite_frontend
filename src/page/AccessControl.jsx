import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import "../style/useRole.css";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Modal from "../component/Modal";
import MuiTextField from "../component/MuiInputs/MuiTextField";
import AddIcon from "@mui/icons-material/Add";
import SingleSelectTextField from "../component/MuiInputs/SingleSelectTextField";
import MultipleSelectTextFields from "../component/MuiInputs/MultipleSelectTextFields";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import {
  bulkApproveAllPageData,
  createUserAccessLevel,
  deleteUserAccessLevelById,
  fetchAllAccessTypes,
  fetchAllGroupHolding,
  fetchAllInnerPageServiceTracker,
  fetchAllModule,
  fetchAllPages,
  fetchAllServiceTracker,
  fetchAllServiceTrackerSheetData,
  fetchAllSubModuleNameByModuleId,
  fetchAllUser,
  fetchAllUserAccessLevels,
  fetchCompaniesNameByGroupId,
  fetchLocationToModuleModule,
  fetchUserAccessById,
  getLocationByCompanyId,
  toggleUserAccessLevelStatus,
  updateUserAccessLevelById,
  approveUserAccess,
  companyWiseAccess,
  documentWiseAccess,
  fetchEntityById,
  getAllCompanyLocationByEntityId,
  getAllFileNamesByAccessType,
  createGroupwiseAccessByGroupId,
  createEntityWiseAccess,
  createLocationWiseAccess,
} from "../api/service";
import Toggle from "../component/Toggle";
import Snackbars from "../component/Snackbars";
import { AnimatedSearchBar } from "../component/AnimatedSearchBar";
import DeleteModal from "../component/DeleteModal";
import { decryptData } from "./utils/encrypt";
import MultiSelectFilter from "./dashboardDrawerGridDetailPage/MultiSelectFilter";
import { flattenObject } from "../../Utils/tableColUtils";
// Register module
ModuleRegistry.registerModules([AllCommunityModule]);

const AccessControl = () => {
  const [data, setData] = useState([]);
  const [current, setCurrent] = useState({
    user_id: null,
    user_name: "",
    group_name: "",
    group_name_id: null,
    company_name: "",
    company_id: null,
    entity_name: "",
    entity_id: null,
    location_name: "",
    location_id: null,
    location_to_module: "",
    location_to_module_id: null,
    module_name: "",
    module_id: null,
    sub_module_name: "",
    sub_module_id: null,
    access_type: "",
    access: [],
    isFilteredData: false,
    filter_user_name: "",
    filter_user_id: null,
    assign_user_name: "",
    assign_user_id: null,
    access_user_name: "",
    access_user_id: null,
    access_user_type: "",
    access_user_type_id: null,
    is_access_user_type_dropdown: false,
    file_name: "",
    file_id: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [groupHoldingData, setGroupHoldingData] = useState([]);
  const [companyNameByGroupHoldingId, setCompanyNameByGroupHoldingId] =
    useState([]);
  const [locationNameByCompanyId, setLocationNameByCompanyId] = useState([]);
  const [entityData, setEntityData] = useState([]);
  const [fileNameList, setFileNameList] = useState([]);
  const [moduleName, setModuleName] = useState([]);
  const [subModuleName, setSubModuleName] = useState([]);
  const [locationToModule, setLocationToModule] = useState([]);
  const [userNameListRes, setUserNameListRes] = useState([]);
  const [errors, setErrors] = useState({});
  const [accessTypeList, setAccessTypeList] = useState([]);
  const [allPageList, setAllPageList] = useState([]);
  const [allServiceTrackerList, setAllServiceTrackerList] = useState([]);
  const [allInnerPageServiceTrackerList, setAllInnerPageServiceTrackerList] =
    useState([]);
  const [serviceTrackerSheet, setServiceTrackerSheet] = useState([]);
  const [isSnackbarsOpen, setIsSnackbarsOpen] = useState({
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

  const currentUserId = decryptData(localStorage.getItem("user_id"));
  const handleEdit = async (data) => {
    const userData = await fetchUserAccessById(data._id);
    setCurrent((prev) => ({
      ...prev,
      id: data._id,
      user_id: data.UserId,
      access: userData.access || [],
      user_name: userData.user_full_name || "",
      group_name: userData.entity_name || "",
      group_name_id: userData.entity_id || null,
      company_name: userData.entity_name || "",
      company_id: userData.entity_id || null,
      entity_name: userData.entity_name || "",
      entity_id: userData.entity_id || null,
      location_name: userData.entity_name || "",
      location_id: userData.entity_id || null,
      module_name: userData.entity_name || "",
      module_id: userData.entity_id || null,
      sub_module_name: userData.entity_name || "",
      sub_module_id: userData.entity_id || null,
      service_tracker: userData.entity_name || "",
      service_tracker_id: userData.entity_id || null,
      service_tracker_wise: userData.entity_name || "",
      service_tracker_inner_id: userData.entity_id || null,
      page_name: userData.entity_name || "",
      page_id: userData.page_id || null,
      access_type: userData.entity_type || "",
      assign_user_name: userData.entity_name || "",
      assign_user_id: userData.entity_id || null,
      sheet_name_id: userData.entity_id || null,
      sheet_name: userData.entity_name || "",
      access_user_name: userData.entity_name || "",
      access_user_id: userData.entity_id || null,
      access_user_type: userData.entity_name || "",
      access_user_type_id: userData.entity_id || null,
      location_to_module: userData.entity_name || "",
      location_to_module_id: userData.entity_id || null,
      file_name: userData.entity_name || "",
      file_id: userData.entity_id || null,
    }));

    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleApproveAll = async () => {
    try {
      const response = await bulkApproveAllPageData("user_access");
      const message = response?.message || "Status update successfully";
      // Show success snackbar
      setIsSnackbarsOpen({
        ...isSnackbarsOpen,
        open: true,
        message,
        severityType: "success",
      });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update user_access sataus";

      // Show error snackbar
      setIsSnackbarsOpen({
        ...isSnackbarsOpen,
        open: true,
        message: errorMessage,
        severityType: "error",
      });
    }
    // Refresh data
    const updatedData = await fetchAllUserAccessLevels({
      system_user_id: currentUserId,
    });
    setData(updatedData);
  };

  const validate = () => {
    const tempErrors = {};
    if (!current.user_name) tempErrors.user_name = "User Name is required";
    if (!current.access_type)
      tempErrors.access_type = "Access Type is required";
    if (!current.access || current.access.length === 0)
      tempErrors.access = "At least one access permission is required";

    // Conditional validation based on access_type
    switch (current.access_type) {
      case "group":
        if (!current.group_name)
          tempErrors.group_name = "Group name is required";
        break;
      case "company":
        if (!current.group_name)
          tempErrors.group_name = "Group name is required";
        if (!current.company_name)
          tempErrors.company_name = "Company name is required";
        break;
      case "company_location":
        if (!current.group_name)
          tempErrors.group_name = "Group name is required";
        if (!current.company_name)
          tempErrors.company_name = "Company name is required";
        if (!current.location_name)
          tempErrors.location_name = "Location name is required";
        break;
      case "module":
        if (!current.module_name)
          tempErrors.module_name = "Module name is required";
        break;
      case "submodule":
        if (!current.module_name)
          tempErrors.module_name = "Module name is required";
        if (!current.sub_module_name)
          tempErrors.sub_module_name = "Sub-module name is required";
        break;
      case "service_tracker":
        if (!current.service_tracker)
          tempErrors.service_tracker = "Service Tracker is required";
        break;
      case "service_tracker_wise":
        if (!current.service_tracker)
          tempErrors.service_tracker = "Service Tracker is required";
        if (current.sheet_name && current.sheet_name.trim() === "") {
          tempErrors.sheet_name = "Sheet Name is required";
        }
        if (!current.service_tracker_wise)
          tempErrors.service_tracker_wise = "Service Tracker Wise is required";
        break;
      case "page":
        if (!current.page_name) tempErrors.page_name = "Page name is required";
        break;
      case "user":
        if (!current.assign_user_name)
          tempErrors.assign_user_name = "Assigned user is required";
        break;
      case "location_to_module":
        if (!current.location_to_module)
          tempErrors.location_to_module = "Location to module is required";
        break;
      case "document_repository":
        if (!current.file_name) tempErrors.file_name = "File Name is required";
        break;
      case "group-wise":
        if (!current.group_name)
          tempErrors.group_name = "Group name is required";
        break;
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Handle Add or Edit
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return; // Don't proceed if validation fails
    const companyWiseAccessPayload = {
      user_id: current?.user_id,
      company_id: current?.company_id,
      access_key: current?.access,
    };
    const groupWiseAccessPayload = {
      user_id: current?.user_id,
      group_id: current?.group_name_id,
      access_key: current?.access?.map((a) => a.toLowerCase()),
    };
    const entityWiseAccessPayload = {
      user_id: current?.user_id,
      entity_id: current?.entity_id,
      access_key: current?.access,
    };
    const documentWiseAccessPayload = {
      user_id: current?.user_id,
      access_key: current?.access,
    };
    const locationWiseAccessPayload = {
      user_id: current?.user_id,
      location_id: current?.location_id,
      access_key: current?.access?.map((a) => a.toLowerCase()),
    };
    const accessType = current?.access_type === "service_tracker_wise";
    const payload = {
      user_id: current?.user_id,
      entity_id:
        current?.group_name_id ||
        current?.company_id ||
        current?.location_id ||
        current?.module_id ||
        current?.sub_module_id ||
        current?.service_tracker_id ||
        current?.page_id ||
        current?.service_tracker_inner_id ||
        current?.assign_user_id ||
        current?.location_to_module_id,
      entity_name:
        current?.group_name ||
        current?.company_name ||
        current?.location_name ||
        current?.module_name ||
        current?.sub_module_name ||
        current?.service_tracker
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, "")
          .replace(/\s+/g, "_") ||
        current?.page_name ||
        current?.service_tracker_wise ||
        current?.assign_user_name ||
        current?.location_to_module,
      entity_type: current?.access_type,
      bo_user_id: currentUserId,
      access: Array.isArray(current?.access)
        ? current.access.map((a) => a.toLowerCase())
        : [],
    };
    if (current?.access_type === "company") {
      payload.entity_id = current?.company_id;
      payload.entity_name = current?.company_name;
    }
    if (current?.access_type === "submodule") {
      payload.entity_id = current?.sub_module_id;
      payload.entity_name = current?.sub_module_name;
    }
    if (current?.access_type === "company_location") {
      payload.entity_id = current?.location_id;
      payload.entity_name = current?.location_name;
    }
    if (current?.access_type === "entity") {
      payload.entity_id = current?.entity_id;
      payload.entity_name = current?.entity_name;
    }
    if (current?.access_type === "user_access") {
      payload.entity_id = current?.access_user_type_id;
      payload.entity_name = current?.access_user_name;
    }
    if (current?.access_type === "document_repository") {
      payload.entity_id = current?.file_id;
      payload.entity_name = current?.file_name;
    }
    if (accessType) {
      payload.entity_id = current?.service_tracker_inner_id;
      payload.entity_name = current?.service_tracker_wise;
      payload.entity_type = current?.service_tracker;
    }
    try {
      if (isEditing) {
        // Update existing AccessControl
        const response = await updateUserAccessLevelById(current.id, payload);
        const message = response?.message || "update successfully";
        // Show success snackbar
        setIsSnackbarsOpen({
          ...isSnackbarsOpen,
          open: true,
          message,
          severityType: "success",
        });
      } else {
        // Create new AccessControl
        const response =
          current?.access_type === "company-wise"
            ? await companyWiseAccess(companyWiseAccessPayload)
            : current?.access_type === "group-wise"
              ? await createGroupwiseAccessByGroupId(groupWiseAccessPayload)
              : current?.access_type === "entity-wise"
                ? await createEntityWiseAccess(entityWiseAccessPayload)
                : current?.access_type === "location-wise"
                  ? await createLocationWiseAccess(locationWiseAccessPayload)
                  : current?.access_type === "document-wise"
                    ? await documentWiseAccess(documentWiseAccessPayload)
                    : await createUserAccessLevel(payload);
        const message = response?.message || "create successfully";
        // Show success snackbar
        setIsSnackbarsOpen({
          ...isSnackbarsOpen,
          open: true,
          message,
          severityType: "success",
        });
      }
      // Refresh data
      const updatedData = await fetchAllUserAccessLevels({
        system_user_id: currentUserId,
      });
      setData(updatedData);
    } catch {
      //  handle error silently
    }
    setCurrent({
      id: null,
      sub_module_name: "",
      module_desc: "",
      created_at: "",
      location: "",
      updated_at: "",
      desc: "",
      access: [],
      sub_module_id: [],
    });
    setIsEditing(false);
    setIsModalOpen(false);
  };
  // Function to open the modal
  const openModal = () => {
    setIsModalOpen(true);
    // setIsEditing(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrent({}); // Reset to default
    setErrors({});
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleToggleChange = async (e, params) => {
    const newIsActive = {
      IsActive: e.target.checked,
    };
    try {
      const response = await toggleUserAccessLevelStatus(
        params.data._id,
        newIsActive,
      );
      const message = response?.message || "Status update successfully";
      // Show success snackbar
      setIsSnackbarsOpen({
        ...isSnackbarsOpen,
        open: true,
        message,
        severityType: "success",
      });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete AccessControl";

      // Show error snackbars
      setIsSnackbarsOpen({
        ...isSnackbarsOpen,
        open: true,
        message: errorMessage,
        severityType: "error",
      });
    }
    const updatedData = await fetchAllUserAccessLevels({
      system_user_id: currentUserId,
    });
    setData(updatedData);
  };

  const handleDelete = async (id) => {
    const payload = {
      bo_user_id: currentUserId,
    };

    try {
      await deleteUserAccessLevelById(id, payload);
      const updatedData = await fetchAllUserAccessLevels({
        system_user_id: currentUserId,
      });
      setData(updatedData);
      setIsSnackbarsOpen({
        ...isSnackbarsOpen,
        open: true,
        message: "Access control deleted successfully",
        severityType: "success",
      });
      setIsDeleteModalOpen(false);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete AccessControl";

      // Show error snackbar
      setIsSnackbarsOpen({
        ...isSnackbarsOpen,
        open: true,
        message: errorMessage,
        severityType: "error",
      });
    }
  };
  const accessControl = [
    { id: "1", name: "View" },
    { id: "2", name: "Create" },
    { id: "3", name: "Update" },
    { id: "4", name: "Delete" },
  ];

  const crudTitle = "Add New Access Control";
  const editCrudTitle = "Edit Access Control";

  const deleteModal = () => {
    return (
      <div>
        <div className="delete_message p-4">
          Are you sure you want to delete <DeleteIcon className="action_icon" />{" "}
          this company Location?
        </div>

        <div className="row row-gap-2 mt-4">
          <div className="col-6">
            <button
              type="button"
              className="btn-sm btn btn-secondary"
              onClick={closeDeleteModal}
            >
              <span className="button-style">Cancel</span>
            </button>
          </div>
          <div className="col-6 d-flex justify-content-end">
            <button
              type="submit"
              className="btn-sm btn btn-primary"
              onClick={() => handleDelete(current?._id)}
            >
              Yes, I'm sure
            </button>
          </div>
        </div>
      </div>
    );
  };
  const crudForm = () => {
    // Helper functions for conditional rendering based on current.access_type
    // If access_type is 'submodule', show only module and submodule dropdowns
    // If access_type is 'module', show only module dropdown
    const showOnlyModule = current.access_type === "module";
    const showOnlyModuleAndSubModule = current.access_type === "submodule";
    const isCompanyLocationEdit =
      current.access_type === "company_location" && isEditing;
    const isSubModuleEdit = current.access_type === "submodule" && isEditing;
    const showUser = current.access_type === "user";
    const showUser_access = current.access_type === "user_access";

    const showGroup =
      [
        "group",
        "company",
        "company_location",
        "company-wise",
        "group-wise",
        "entity",
        "entity",
        "entity-wise",
        "location-wise",
      ].includes(current.access_type) &&
      !showOnlyModule &&
      !showOnlyModuleAndSubModule &&
      !isCompanyLocationEdit;

    const showCompany =
      [
        "company",
        "company_location",
        "company-wise",
        "entity",
        "entity-wise",
        "location-wise",
      ].includes(current.access_type) &&
      [
        "company",
        "company_location",
        "company-wise",
        "entity",
        "entity-wise",
        "location-wise",
      ].includes(current.access_type) &&
      !showOnlyModule &&
      !showOnlyModuleAndSubModule &&
      !isCompanyLocationEdit;

    const showEntity = [
      "company_location",
      "entity",
      "entity-wise",
      "location-wise",
    ].includes(current.access_type);
    const showLocation =
      ["company_location", "location-wise"].includes(current.access_type) &&
      !showOnlyModule &&
      !showOnlyModuleAndSubModule;

    // const showModule = showOnlyModule || showOnlyModuleAndSubModule;
    const showModule =
      (showOnlyModule || showOnlyModuleAndSubModule) && !isSubModuleEdit;
    const showSubModule = current.access_type === "submodule";
    const showServiceTracker = current.access_type === "service_tracker";
    const showLocationToModule = current.access_type === "location_to_module";
    const showPage = current.access_type === "page";
    const showDocumentRepository =
      current.access_type === "document_repository";

    // Add service_tracker_wise logic
    const showServiceTrackerWise =
      current.access_type === "service_tracker_wise";

    return (
      <div>
        <div className="d-lg-flex d-md-flex justify-content-between gap-3">
          {isEditing ? (
            <MuiTextField
              name="user_name"
              label="User Name"
              value={current.user_name}
              isdisabled={true}
              onChange={(e) => {
                const selectedName = e.target.value;
                setCurrent((prev) => ({
                  ...prev,
                  user_name: selectedName,
                }));
              }}
              error={!!errors.user_name}
              helperText={errors.user_name}
              // isRequired={true}
            />
          ) : (
            <SingleSelectTextField
              name="user_name"
              label="User Name"
              value={current.user_name}
              onChange={(e) => {
                const selectedName = e.target.value;
                const matchedUser = userNameListRes.find(
                  (item) => item.full_name === selectedName,
                );
                setCurrent((prev) => ({
                  ...prev,
                  user_name: selectedName,
                  user_id: matchedUser?._id || null,
                }));
              }}
              names={userNameListRes.map((item) => ({
                _id: item._id,
                name: item.full_name,
              }))}
              error={!!errors.user_name}
              helperText={errors.user_name}
            />
          )}
          {isEditing ? (
            <MuiTextField
              name="access_type"
              label="Access Type"
              value={current?.access_type}
              isdisabled={true}
              onChange={(e) => {
                const selectedName = e.target.value;
                setCurrent((prev) => ({
                  ...prev,
                  access_type: selectedName,
                  group_name: "",
                  group_name_id: null,
                  company_name: "",
                  company_id: null,
                  location_name: "",
                  location_id: null,
                  module_name: "",
                  module_id: null,
                  sub_module_name: "",
                  sub_module_id: null,
                  service_tracker: "",
                  service_tracker_wise: "",
                  page: "",
                  file_name: "",
                  file_id: null,
                }));
              }}
              error={!!errors.access_type}
              helperText={errors.access_type}
            />
          ) : (
            <SingleSelectTextField
              name="access_type"
              label="Access Type"
              value={current?.access_type}
              isdisable={isEditing ? true : false}
              onChange={(e) => {
                const selectedName = e.target.value;
                setCurrent((prev) => ({
                  ...prev,
                  access_type: selectedName,
                  group_name: "",
                  group_name_id: null,
                  company_name: "",
                  company_id: null,
                  location_name: "",
                  location_id: null,
                  module_name: "",
                  module_id: null,
                  sub_module_name: "",
                  sub_module_id: null,
                  service_tracker: "",
                  service_tracker_wise: "",
                  page: "",
                  file_name: "",
                  file_id: null,
                }));
              }}
              names={accessTypeList.map((item) => ({
                _id: item._id,
                name: item.name,
                // name: item.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
              }))}
              error={!!errors.access_type}
              helperText={errors.access_type}
            />
          )}
        </div>
        <div className="d-lg-flex d-md-flex justify-content-between gap-3">
          {showGroup && (
            <SingleSelectTextField
              name="group_name"
              label="Group Holding Name"
              value={current?.group_name}
              isdisable={isEditing ? true : false}
              onChange={(e) => {
                const selectedName = e.target.value;

                // reset when none selected
                if (!selectedName) {
                  setCurrent((prev) => ({
                    ...prev,
                    group_name: "",
                    group_name_id: null,
                    company_name: "",
                    company_id: null,
                    entity_name: "",
                    entity_id: null,
                    location_name: "",
                    location_id: null,
                    module_name: "",
                    module_id: null,
                    sub_module_name: "",
                    sub_module_id: null,
                  }));

                  setCompanyNameByGroupHoldingId([]);
                  setEntityData([]);
                  setLocationNameByCompanyId([]);

                  return;
                }

                const matchedGroup = groupHoldingData.find(
                  (g) => g.name === selectedName,
                );

                setCurrent((prev) => ({
                  ...prev,
                  group_name: selectedName,
                  group_name_id: matchedGroup?._id || null,
                  company_name: "",
                  company_id: null,
                  entity_name: "",
                  entity_id: null,
                  location_name: "",
                  location_id: null,
                  module_name: "",
                  module_id: null,
                  sub_module_name: "",
                  sub_module_id: null,
                }));

                setEntityData([]);
                setLocationNameByCompanyId([]);
              }}
              names={groupHoldingData.map((item) => ({
                _id: item._id,
                name: item.name,
              }))}
              error={!!errors.group_name}
              helperText={errors.group_name}
            />
          )}
          {showCompany && (
            <SingleSelectTextField
              name="company_name"
              label="Company"
              value={current?.company_name}
              isdisable={isEditing ? true : false}
              onChange={(e) => {
                const selectedName = e.target.value;

                // reset when company cleared
                if (!selectedName) {
                  setCurrent((prev) => ({
                    ...prev,
                    company_name: "",
                    company_id: null,
                    entity_name: "",
                    entity_id: null,
                    location_name: "",
                    location_id: null,
                    module_name: "",
                    module_id: null,
                    sub_module_name: "",
                    sub_module_id: null,
                  }));

                  setEntityData([]);
                  setLocationNameByCompanyId([]);

                  return;
                }

                const matchedCompany = companyNameByGroupHoldingId.find(
                  (g) => g.company_name === selectedName,
                );

                setCurrent((prev) => ({
                  ...prev,
                  company_name: selectedName,
                  company_id: matchedCompany?._id || null,
                  entity_name: "",
                  entity_id: null,
                  location_name: "",
                  location_id: null,
                  module_name: "",
                  module_id: null,
                  sub_module_name: "",
                  sub_module_id: null,
                }));

                setLocationNameByCompanyId([]);
                setEntityData([]);
              }}
              names={companyNameByGroupHoldingId?.map((data) => ({
                _id: data?._id,
                name: data?.company_name,
              }))}
              error={!!errors.company_name}
              helperText={errors.company_name}
            />
          )}

          {isEditing && showEntity ? (
            <MuiTextField
              name="entity_name"
              label="Entity"
              value={current?.entity_name}
              isdisable={isEditing ? true : false}
              onChange={async (e) => {
                setCurrent((prev) => ({
                  ...prev,
                  entity_name: e.target.value,
                }));
              }}
              error={!!errors.entity_name}
              helperText={errors.entity_name}
            />
          ) : (
            showEntity && (
              <SingleSelectTextField
                name="entity_name"
                label="Entity"
                value={current?.entity_name}
                isdisable={isEditing ? true : false}
                onChange={async (e) => {
                  const selectedEntity = e.target.value;

                  const matchedEntity =
                    entityData.find(
                      (entity) => entity.name === selectedEntity,
                    ) || {};

                  const selectedEntityId = matchedEntity.id || null;

                  setCurrent((prev) => ({
                    ...prev,
                    entity_name: selectedEntity,
                    entity_id: selectedEntityId,
                    location_name: "",
                    location_id: null,
                  }));

                  if (!selectedEntityId) {
                    const allLocations = await getLocationByCompanyId(
                      current?.company_id,
                    );

                    setLocationNameByCompanyId(allLocations || []);

                    return;
                  }

                  try {
                    const entityLocations =
                      await getAllCompanyLocationByEntityId(selectedEntityId);

                    setLocationNameByCompanyId(entityLocations || []);
                  } catch {
                    setLocationNameByCompanyId([]);
                  }
                }}
                names={entityData?.map((entity) => ({
                  _id: entity?.id,
                  name: entity?.name,
                }))}
                error={!!errors.entity_name}
                helperText={errors.entity_name}
              />
            )
          )}
        </div>
        <div className="d-lg-flex d-md-flex justify-content-between gap-3">
          {isEditing && showLocation ? (
            <MuiTextField
              name="location_name"
              label="Location Name"
              value={current.location_name}
              isdisable={isEditing ? true : false}
              isdisabled={true}
              onChange={(e) => {
                const selectedName = e.target.value;
                setCurrent((prev) => ({
                  ...prev,
                  location_name: selectedName,
                }));
              }}
              error={!!errors.location_name}
              helperText={errors.location_name}
            />
          ) : (
            showLocation && (
              <SingleSelectTextField
                name="location_name"
                label="Location"
                value={current?.location_name}
                isdisable={isEditing ? true : false}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const matchedLocation = locationNameByCompanyId.find(
                    (g) => g.location_name === selectedName,
                  );
                  setCurrent((prev) => ({
                    ...prev,
                    location_name: selectedName,
                    location_id: matchedLocation?._id || null,
                    module_name: "",
                    module_id: null,
                    sub_module_name: "",
                    sub_module_id: null,
                  }));
                }}
                names={locationNameByCompanyId?.map((data) => ({
                  _id: data?._id,
                  name: data?.location_name,
                }))}
                error={!!errors.location_name}
                helperText={errors.location_name}
              />
            )
          )}

          {showModule && (
            <SingleSelectTextField
              name="module_name"
              label="Module"
              value={current.module_name}
              isdisable={isEditing ? true : false}
              onChange={(e) => {
                const selectedName = e.target.value;
                const matchedModule = moduleName.find(
                  (g) => g.module_name === selectedName,
                );
                setCurrent((prev) => ({
                  ...prev,
                  module_name: selectedName,
                  module_id: matchedModule?._id || null,
                  sub_module_name: "",
                  sub_module_id: null,
                }));
              }}
              names={moduleName?.map((data) => ({
                _id: data?._id,
                name: data?.module_name,
              }))}
              error={!!errors.module_name}
              helperText={errors.module_name}
            />
          )}
        </div>
        <div className="d-lg-flex d-md-flex justify-content-between gap-3">
          {isEditing && showSubModule ? (
            <MuiTextField
              name="sub_module_name"
              label="Sub-Module Name"
              value={current.sub_module_name}
              isdisable={isEditing ? true : false}
              isdisabled={true}
              onChange={(e) => {
                const selectedName = e.target.value;
                setCurrent((prev) => ({
                  ...prev,
                  sub_module_name: selectedName,
                }));
              }}
              error={!!errors.sub_module_name}
              helperText={errors.sub_module_name}
            />
          ) : (
            showSubModule && (
              <SingleSelectTextField
                name="sub_module_name"
                label="Sub-Module"
                value={current?.sub_module_name}
                isdisable={isEditing ? true : false}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const matchedSubModule = subModuleName.find(
                    (g) => g.sub_module_name === selectedName,
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
                error={!!errors.sub_module_name}
                helperText={errors.sub_module_name}
              />
            )
          )}
          {showServiceTracker && (
            <SingleSelectTextField
              name="service_tracker"
              label="Service Tracker"
              value={current?.service_tracker}
              isdisable={isEditing ? true : false}
              onChange={(e) => {
                const selectedName = e.target.value;
                const matchedServiceTracker = allServiceTrackerList.find(
                  (g) => g.service_tracker_name === selectedName,
                );
                setCurrent((prev) => ({
                  ...prev,
                  service_tracker: selectedName,
                  service_tracker_id: matchedServiceTracker?._id || null,
                }));
              }}
              names={allServiceTrackerList?.map((data) => ({
                _id: data?._id,
                name: data?.service_tracker_name,
              }))}
              error={!!errors.service_tracker}
              helperText={errors.service_tracker}
            />
          )}
          {/* Service Tracker Wise dropdowns */}
          {showServiceTrackerWise && (
            <>
              <SingleSelectTextField
                name="service_tracker"
                label="Service Tracker"
                value={current?.service_tracker}
                isdisable={isEditing ? true : false}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const matchedServiceTracker = allServiceTrackerList.find(
                    (g) => g.service_tracker_name === selectedName,
                  );
                  setCurrent((prev) => ({
                    ...prev,
                    service_tracker: selectedName,
                    service_tracker_id: matchedServiceTracker?._id || null,
                  }));
                }}
                names={allServiceTrackerList?.map((data) => ({
                  _id: data?._id,
                  name: data?.service_tracker_name,
                }))}
                error={!!errors.service_tracker}
                helperText={errors.service_tracker}
              />
              <SingleSelectTextField
                name="sheet_name"
                label="Sheet Name"
                value={current?.sheet_name}
                isdisable={isEditing ? true : false}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const matchedServiceTracker = serviceTrackerSheet.find(
                    (g) => g.company_name === selectedName,
                  );
                  setCurrent((prev) => ({
                    ...prev,
                    sheet_name: selectedName,
                    sheet_name_id: matchedServiceTracker?._id || null,
                  }));
                }}
                names={serviceTrackerSheet?.map((data) => ({
                  _id: data?.name,
                  name: data?.name,
                }))}
                error={!!errors.sheet_name}
                helperText={errors.sheet_name}
              />
              <SingleSelectTextField
                name="service_tracker_wise"
                label="Service Tracker Wise"
                value={current?.service_tracker_wise}
                isdisable={isEditing ? true : false}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const matchedServiceTracker =
                    allInnerPageServiceTrackerList.find(
                      (g) => g.company_name === selectedName,
                    );
                  setCurrent((prev) => ({
                    ...prev,
                    service_tracker_wise: selectedName,
                    service_tracker_inner_id:
                      matchedServiceTracker?._id || null,
                  }));
                }}
                names={allInnerPageServiceTrackerList?.map((data) => ({
                  _id: data?._id,
                  name: data?.company_name,
                  optionalValue: data?.location,
                }))}
                error={!!errors.service_tracker_wise}
                helperText={errors.service_tracker_wise}
              />
            </>
          )}
        </div>
        <div className="d-lg-flex d-md-flex justify-content-between gap-3">
          {showLocationToModule && (
            <SingleSelectTextField
              name="location_to_module"
              label="Location To Module"
              value={current?.location_to_module || ""}
              isdisable={isEditing ? true : false}
              onChange={(e) => {
                const selectedName = e.target.value;
                const matchedLocation = locationToModule.find(
                  (g) => g.location_name === selectedName,
                );
                setCurrent((prev) => ({
                  ...prev,
                  location_to_module: selectedName,
                  location_to_module_id: matchedLocation?._id || null,
                }));
              }}
              names={locationToModule?.map((data) => ({
                _id: data?._id,
                name: data?.location_name,
              }))}
              error={!!errors.location_to_module}
              helperText={errors.location_to_module}
            />
          )}
          {showPage && (
            <SingleSelectTextField
              name="page_name"
              label="Page"
              value={current?.page_name}
              isdisable={isEditing ? true : false}
              onChange={(e) => {
                const selectedName = e.target.value;
                const matchedPage = allPageList.find(
                  (g) => g.page_name === selectedName,
                );
                setCurrent((prev) => ({
                  ...prev,
                  page_name: selectedName,
                  page_id: matchedPage?._id || null,
                }));
              }}
              names={allPageList?.map((data) => ({
                _id: data?._id,
                name: data?.page_name,
              }))}
              error={!!errors.page_name}
              helperText={errors.page_name}
            />
          )}

          {showDocumentRepository && (
            <SingleSelectTextField
              name="file_name"
              label="File Name"
              value={current?.file_name || ""}
              isdisable={isEditing ? true : false}
              onChange={(e) => {
                const selectedName = e.target.value;

                const matchedFile = fileNameList.find(
                  (item) => item.file_name === selectedName,
                );

                setCurrent((prev) => ({
                  ...prev,
                  file_name: selectedName,
                  file_id: matchedFile?._id || null,
                }));
              }}
              names={fileNameList?.map((data) => ({
                _id: data?._id,
                name: data?.name,
              }))}
              error={!!errors.file_name}
              helperText={errors.file_name}
            />
          )}
        </div>
        {showUser && (
          <SingleSelectTextField
            name="assign_user_name"
            label="User"
            value={current?.assign_user_name}
            isdisable={isEditing ? true : false}
            onChange={(e) => {
              const selectedName = e.target.value;
              const matchedUser = userNameListRes.find(
                (item) => item.full_name === selectedName,
              );
              setCurrent((prev) => ({
                ...prev,
                assign_user_name: selectedName,
                assign_user_id: matchedUser?._id || null,
              }));
            }}
            names={userNameListRes?.map((data) => ({
              _id: data?._id,
              name: data?.full_name,
            }))}
            error={!!errors.assign_user_name}
            helperText={errors.assign_user_name}
          />
        )}
        {showUser_access && (
          <>
            <SingleSelectTextField
              name="access_user_name"
              label="Access User Name"
              value={current.access_user_name}
              isdisable={isEditing ? true : false}
              onChange={async (e) => {
                const selectedName = e.target.value;
                const matchedUser = userNameListRes.find(
                  (item) => item.full_name === selectedName,
                );

                if (matchedUser?._id) {
                  try {
                    const filterUpdateData = await fetchAllUserAccessLevels({
                      system_user_id: matchedUser._id,
                    });

                    setData(filterUpdateData);
                  } catch {
                    // handle error silently
                  }
                }

                setCurrent((prev) => ({
                  ...prev,
                  access_user_name: selectedName,
                  access_user_id: matchedUser?._id || null,
                  is_access_user_type_dropdown: true,
                }));
              }}
              names={userNameListRes.map((item) => ({
                _id: item._id,
                name: item.full_name,
              }))}
            />

            <SingleSelectTextField
              name="access_user_type"
              label="Access User Type"
              value={current.access_user_type}
              isdisable={isEditing ? true : false}
              onChange={async (e) => {
                const selectedName = e.target.value;
                const matchedUser = data.find(
                  (item) => item.EntityName === selectedName,
                );

                setCurrent((prev) => ({
                  ...prev,
                  access_user_type: selectedName,
                  access_user_type_id: matchedUser?._id || null,
                }));
              }}
              names={data?.map((item) => ({
                _id: item._id,
                name: item.EntityName,
                optionalValue: item.EntityType,
              }))}
            />
          </>
        )}

        <div>
          <MultipleSelectTextFields
            label="Access Control"
            value={current.access || []}
            onChange={(selectedValues) => {
              setCurrent((prev) => ({
                ...prev,
                access: selectedValues,
              }));
            }}
            names={accessControl.map((item) => ({
              _id: item.id,
              name: item.name,
              // optionalValue: item.full_name
            }))}
            error={!!errors.access}
            helperText={errors.access}
            isRequired={true}
          />
        </div>
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
                <span className="button-style">Create Access Control</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleCheckboxClick = async (id) => {
    try {
      const response = await approveUserAccess(id);
      const message = response?.message;
      // Show success snackbar
      setIsSnackbarsOpen({
        ...isSnackbarsOpen,
        open: true,
        message,
        severityType: "success",
      });
    } catch (error) {
      // Show error snackbar
      setIsSnackbarsOpen({
        ...isSnackbarsOpen,
        open: true,
        message: error?.response?.data?.message,
        severityType: "error",
      });
    }
    const updatedData = await fetchAllUserAccessLevels();
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
        if (key === "Approval_Status") {
          return {
            field: key,
            headerName: "Approval Status",
            filter: true,
            editable: false,
            valueGetter: (params) => params.data?.Approval_Status,
            cellRenderer: (params) => {
              const status = params.value ?? 0;

              const handleChange = async (e) => {
                const checked = e.target.checked;

                // UI Update Immediately (Optimistic Update)
                params.node.setDataValue("Approval_Status", checked ? 1 : 0);

                // Optional: API Call
                try {
                  await handleCheckboxClick(params.data._id, checked ? 1 : 0);
                } catch {
                  // Revert if API fails
                  params.node.setDataValue("Approval_Status", status);
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
      headerName: "Actions",
      field: "actions",
      filter: false,
      editable: false,
      pinned: "left",
      cellStyle: { "background-color": "rgb(252 229 205 / 64%)" },
      cellRenderer: (params) => {
        return (
          <div className="d-flex justify-content-around align-items-center">
            <button
              className="btn btn-sm"
              onClick={() => {
                handleEdit(params.data);
              }}
            >
              <EditIcon fontSize="small" className="action_icon" />
            </button>
            <button
              className="btn btn-sm"
              onClick={() => {
                setCurrent({ _id: params.data._id });
                setIsDeleteModalOpen(true);
              }}
            >
              <DeleteIcon fontSize="small" className="action_icon" />
            </button>
          </div>
        );
      },
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
      valueGetter: (params) => params.data?.IsActive,
      cellRenderer: (params) => (
        <Toggle
          checked={!!params.value}
          onChange={(e) => handleToggleChange(e, params)}
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
    editable: true,
    headerStyle: { color: "#515151", backgroundColor: "#ffffe24d" },
  };
  useEffect(() => {
    const trackerSource =
      current?.service_tracker || current?.location_to_module;

    const formattedTrackerName = trackerSource
      ?.toLowerCase()
      ?.replace(/[^a-z0-9\s-]/g, "")
      ?.replace(/\s+/g, "_");

    const fetchData = async () => {
      const [
        userAccessDataRes,
        groupHoldingRes,
        userNameListRes,
        accessTypeListRes,
        allPageListRes,
        allServiceTrackerListRes,
        allInnerPageServiceTrackerListRes,
        serviceTrackerSheet,
      ] = await Promise.allSettled([
        fetchAllUserAccessLevels({ system_user_id: currentUserId }),
        fetchAllGroupHolding(),
        fetchAllUser(),
        fetchAllAccessTypes(),
        fetchAllPages(),
        fetchAllServiceTracker(),
        fetchAllInnerPageServiceTracker(
          formattedTrackerName,
          current?.sheet_name,
        ),
        fetchAllServiceTrackerSheetData(formattedTrackerName),
      ]);

      if (
        userAccessDataRes.status === "fulfilled" &&
        current?.isFilteredData === false &&
        current?.is_access_user_type_dropdown === false
      ) {
        setData(userAccessDataRes.value);
      } else {
        // intentionally ignored
      }

      if (groupHoldingRes.status === "fulfilled") {
        const groupHolding = groupHoldingRes.value;
        if (groupHolding && groupHolding.length > 0) {
          setGroupHoldingData(groupHolding);
        }
      } else {
        // intentionally ignored
      }
      if (userNameListRes.status === "fulfilled") {
        const userNameList = userNameListRes.value;
        if (userNameList && userNameList.length > 0) {
          setUserNameListRes(userNameList);
        } else {
          // intentionally ignored
        }
      }
      if (accessTypeListRes.status === "fulfilled") {
        setAccessTypeList(accessTypeListRes.value);
      } else {
        // intentionally ignored
      }
      if (allPageListRes.status === "fulfilled") {
        setAllPageList(allPageListRes.value);
      } else {
        // intentionally ignored
      }
      if (allServiceTrackerListRes.status === "fulfilled") {
        setAllServiceTrackerList(allServiceTrackerListRes.value);
      } else {
        // intentionally ignored
      }
      if (allServiceTrackerListRes.status === "fulfilled") {
        setAllServiceTrackerList(allServiceTrackerListRes.value);
      } else {
        // intentionally ignored
      }
      if (allInnerPageServiceTrackerListRes.status === "fulfilled") {
        setAllInnerPageServiceTrackerList(
          allInnerPageServiceTrackerListRes.value,
        );
      } else {
        // intentionally ignored
      }
      if (serviceTrackerSheet.status === "fulfilled") {
        setServiceTrackerSheet(serviceTrackerSheet.value);
      } else {
        // intentionally ignored
      }
    };

    fetchData();
  // Loads the page once on mount; `current` here is only the initial form state. Re-running on form
  // edits would refetch all eight endpoints and overwrite the table.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetch company by group id
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const data = await fetchCompaniesNameByGroupId(current?.group_name_id);
        if (data) {
          setCompanyNameByGroupHoldingId(data);
        }
      } catch {
        // handle error silently
      }
    };

    if (current?.group_name_id) {
      fetchCompany();
    }
  }, [current?.group_name_id]);

  // fetch location by company id
  useEffect(() => {
    const fetchLocationByCompanyId = async () => {
      try {
        const data = await getLocationByCompanyId(current?.company_id);
        if (data) {
          setLocationNameByCompanyId(data);
        }
      } catch {
        // handle error silently
      }
    };

    if (current?.company_id) {
      fetchLocationByCompanyId();
    }
  }, [current?.company_id]);

  useEffect(() => {
    const fetchEntityData = async () => {
      try {
        const data = await fetchEntityById(current?.company_id);

        if (data) {
          setEntityData(data);
        }
      } catch {
        // handle error silently
      }
    };
    setEntityData([]);

    if (current?.company_id) {
      fetchEntityData();
    }
  }, [current?.company_id]);

  // module
  useEffect(() => {
    const fetchModuleByLocationId = async () => {
      try {
        const data = await fetchAllModule();
        if (data) {
          setModuleName(data);
        }
      } catch {
        // handle error silently
      }
    };
    fetchModuleByLocationId();
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
        // handle error silently
      }
    };

    if (current?.module_id) {
      fetchSubModuleByModuleId();
    }
  }, [current?.module_id]);

  // Fetch all location to module
  useEffect(() => {
    const fetchLocationToModule = async () => {
      try {
        const data = await fetchLocationToModuleModule();
        if (data) {
          setLocationToModule(data);
        }
      } catch {
        // handle error silently
      }
    };
    fetchLocationToModule();
  }, []);
  useEffect(() => {
    const fetchFileNames = async () => {
      try {
        const data = await getAllFileNamesByAccessType(current?.access_type);

        if (data) {
          setFileNameList(data);
        }
      } catch {
        setFileNameList([]);
      }
    };

    if (current?.access_type === "document_repository") {
      fetchFileNames();
    }
  }, [current?.access_type]);

  const onFilterTextBoxChanged = useCallback(() => {
    gridRef.current.api.setGridOption(
      "quickFilterText",
      document.getElementById("filter-text-box").value,
    );
  }, []);
  return (
    <div>
      <Snackbars
        issnackbarsOpen={isSnackbarsOpen}
        setIsSnackbarsOpen={setIsSnackbarsOpen}
      />
      <DeleteModal
        deleteForm={deleteModal}
        deleteTitle="Delete AccessControl"
        isModalOpen={isDeleteModalOpen}
        setIsModalOpen={setIsDeleteModalOpen}
      />

      {/* Table to display data */}
      <div className="service-tracker-inner-page-header d-lg-flex d-md-flex">
        <div className="notification-page-title">
          <div>
            <h1>Access Control</h1>
          </div>
        </div>
        <div className="d-lg-flex d-md-flex gap-2 mt-2">
          <button className="crud_btn w-100 mb-2" onClick={openModal}>
            <span>
              <AddIcon />
            </span>{" "}
            <span className="button-style">Add Access Control</span>
          </button>
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
              <span className="text">Approve</span>
            </button>
          </div>
        </div>
      </div>
      <div className="table_div p-3">
        <div className="d-flex align-items-center gap-2">
          <AnimatedSearchBar
            placeholder="Search..."
            type="text"
            id="filter-text-box"
            onInput={onFilterTextBoxChanged}
          />
          <MultiSelectFilter rowData={data} onFilterApply={handleFilterApply} />
          <div className="w-25 ms-auto">
            <SingleSelectTextField
              name="filter_user_name"
              label="User Name"
              value={current.filter_user_name}
              onChange={async (e) => {
                const selectedName = e.target.value;
                const matchedUser = userNameListRes.find(
                  (item) => item.full_name === selectedName,
                );

                if (matchedUser?._id) {
                  try {
                    const filterUpdateData = await fetchAllUserAccessLevels({
                      system_user_id: matchedUser._id,
                    });
                    setData(filterUpdateData);
                  } catch {
                    // handle error silently
                  }
                }

                setCurrent((prev) => ({
                  ...prev,
                  filter_user_name: selectedName,
                  filter_user_id: matchedUser?._id || null,
                  isFilteredData:
                    matchedUser?._id || selectedName ? true : false, // Set to true to indicate filtered data
                }));
              }}
              names={userNameListRes.map((item) => ({
                _id: item._id,
                name: item.full_name,
              }))}
            />

            <Modal
              crudForm={crudForm}
              closeModal={closeModal}
              crudTitle={crudTitle}
              isEditing={isEditing}
              editCrudTitle={editCrudTitle}
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
            />
          </div>
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
            editType="fullRow"
            rowSelection="single"
            pagination={true}
            // rowBuffer={rowBuffer}
          />
        </div>
      </div>
    </div>
  );
};

export default AccessControl;
