import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Edit2 as EditIcon,
  Trash2 as DeleteIcon,
  ArrowBigLeft,
  PlusIcon,
  Upload,
} from "lucide-react";
import "../style/notificationList.css";
import {
  bulkApproveAllPageData,
  createNotification,
  deleteNotificationById,
  fetchAllGroupHolding,
  fetchAllNotifications,
  fetchAllNotificationTemplates,
  fetchAllUser,
  fetchCompaniesNameByGroupId,
  getLocationByCompanyId,
  updateNotificationApprovalStatusById,
  updateNotificationById,
  updateNotificationStatusById,
  uploadBulkNotification,
} from "../api/service";
import Snackbars from "../component/Snackbars";
import DeleteModal from "../component/DeleteModal";
import Toggle from "../component/Toggle";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import ResponsiveDatePickers from "../component/DatePicker";
import MultipleSelectTextFields from "../component/MuiInputs/MultipleSelectTextFields";
import SingleSelectTextField from "../component/MuiInputs/SingleSelectTextField";
import Modal from '../component/Modal';
import { AnimatedSearchBar } from "../component/AnimatedSearchBar";
import dayjs from "dayjs";
import MultiFileUpload from "../component/MultiFileUpload";
import SmallSizeModal from "../component/SmallSizeModal";
import { decryptData } from "./utils/encrypt";

// Register module
ModuleRegistry.registerModules([AllCommunityModule]);

const CreateNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [editForm, setEditForm] = useState({});
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [notificationId, setNotificationId] = useState(null);
  const [issnackbarsOpen, setIsSnackbarsOpen] = useState({
    open: false,
    vertical: "top",
    horizontal: "center",
    message: "",
    severityType: "",
  });
  const [groupHoldingName, setGroupHoldingName] = useState([])
  const [companyName, setCompanyName] = useState([])
  const [locationName, setLocationName] = useState([])
  const [templateName, setTemplateName] = useState([]);
  const [userName, setUserName] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const gridRef = useRef();
  const crudTitle = "Create Notification Template";
  const editCrudTitle = "Edit Notification Template";
  const SystemUserId = decryptData(localStorage.getItem("user_id"));
  // ✅ Default column settings
  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      resizable: true,
      sortable: true,
      filter: true,
    }),
    []
  );

  // ✅ Fetch notifications
  useEffect(() => {
    fetchAllNotifications()
      .then((data) => setNotifications(data))
      .catch();
  }, []);
  const validate = () => {
    const newErrors = {};
    if (!editForm.group_name) newErrors.group_name = 'Group Holding is required';
    if (!editForm.company_name) newErrors.company_name = 'Company Name is required';
    if (!editForm.location_name) newErrors.location_name = 'Location Name is required';
    if (!editForm.template_name) newErrors.template_name = 'Template Name is required';
    if (!editForm.priority) newErrors.priority = 'Template Priority is required';
    if (!editForm.send_to || editForm.send_to.length === 0) newErrors.send_to = 'At least one recipient is required';
    return Object.keys(newErrors).length === 0;
  };
  const priorities = [
    { value: 'LOW', label: 'Low Priority', color: '#6b7280' },
    { value: 'MEDIUM', label: 'Medium Priority', color: '#2563eb' },
    { value: 'HIGH', label: 'High Priority', color: '#dc2626' }
  ];
  // Fetch group holdings on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([fetchAllGroupHolding(), fetchAllUser()]);
        if (results[0].status === "fulfilled") {
          setGroupHoldingName(results[0].value);
        }

        if (results[1].status === "fulfilled") {
          setUserName(results[1].value);
        }

        results.forEach((result) => {
          if (result.status === "rejected") {
            // // console.error(`Error fetching data at index ${idx}:`, result.reason);
          }
        });
      } catch  {
        // Handle error silently
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const data = await fetchCompaniesNameByGroupId(editForm?.group_holding_id);
        if (data) {
          setCompanyName(data);
        }
      } catch {
        // Handle error silently
      }
    };

    if (editForm?.group_holding_id) {
      fetchCompany();
    }
  }, [editForm?.group_holding_id]);

  useEffect(() => {
    const fetchLocationByCompanyId = async () => {
      try {
        const data = await getLocationByCompanyId(editForm?.company_id);
        if (data) {
          setLocationName(data);
        }
      } catch  {
        // Handle error silently
      }
    };

    if (editForm?.company_id) {
      fetchLocationByCompanyId();
    }
  }, [editForm?.company_id]);

  useEffect(() => {
    const fetchTemplateNames = async () => {
      try {
        const data = await fetchAllNotificationTemplates();
        if (data) {
          setTemplateName(data);
        }
      } catch {
        // Handle error silently
      }
    };
    fetchTemplateNames();
  }, []);
  // ✅ Delete handler
  const handleDelete = async (id) => {
    try {
      const response = await deleteNotificationById(id);
      const message =
        response?.message || "Notification deleted successfully";
      const updatedData = await fetchAllNotifications();
      setNotifications(updatedData);
      setIsDeleteModalOpen(false);
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

  // ✅ Approve all
  const handleApproveAll = async () => {
    try {
      const response = await bulkApproveAllPageData("notification");
      const message = response?.message || "Status updated successfully";
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message,
        severityType: "success",
      });
      const updatedData = await fetchAllNotifications();
      setNotifications(updatedData);
    } catch (error) {
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: error?.response?.data?.message,
        severityType: "error",
      });
    }
  };

  // ✅ Approve single
  const handleSingleApprove = async (id) => {
    try {
      const response = await updateNotificationApprovalStatusById(id);
      const message = response?.message || "Status updated successfully";
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message,
        severityType: "success",
      });
      const updatedData = await fetchAllNotifications();
      setNotifications(updatedData);
    } catch (error) {
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: error?.response?.data?.message,
        severityType: "error",
      });
    }
  };
  const handleFileUpload = async () => {
    if (!uploadedFiles?.length) {
      alert("Please select at least one file.");
      return;
    }
    try {
      // const result = await uploadFile(uploadedFiles);
      const result = await uploadBulkNotification(uploadedFiles, notificationId)
      setIsFileUploadModalOpen(false);
      const message = result?.message || "Status update successfully"
      // Show success snackbar
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message,
        severityType: 'success',
      });
      const updatedData = await fetchAllNotifications();
      setNotifications(updatedData);
    } catch (error) {
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: error?.response?.data?.message,
        severityType: 'error',
      });
    }

  };
  const handleToggleChange = async (e, params) => {
    const newIsActive = {
      "IsActive": e.target.checked
    };
    try {
      const response = await updateNotificationStatusById(params.data._id, newIsActive);
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
    const updatedData = await fetchAllNotifications();
    setNotifications(updatedData);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return; // Don't proceed if validation fails
    const CommonAttributes = {
      [isEditing ? "Updated_By" : "Created_By"]: SystemUserId || "",
    };
    const payload = {
      "group_holding_id": editForm?.group_holding_id || "",
      "group_name": editForm?.group_name || "",
      "company_id": editForm?.company_id || "",
      "company_name": editForm?.company_name || "",
      "location_id": editForm?.location_id || "",
      "location_name": editForm?.location_name || "",
      "template_id": editForm?.template_id || "",
      "template_name": editForm?.template_name || "",
      "send_on": selectedDate ? selectedDate.format("YYYY-MM-DD") : "",
      "send_to": editForm?.send_to || [],
      "cc": editForm?.cc || [],
      "priority": editForm?.priority || ""
    };

    try {
      let response;
      if (isEditing) {
        // Update existing company
        response = await updateNotificationById(notificationId, payload);

      } else {
        // Create new company
        response = await createNotification(payload);
      }
      // ✅ Get the message from response
      const message = response?.message;
      setIsSnackbarsOpen({ ...issnackbarsOpen, open: true, message: message, severityType: 'success' });
      // Refresh data
      const updatedData = await fetchAllNotifications();
      setNotifications(updatedData);
    } catch (error) {
      setIsSnackbarsOpen({ ...issnackbarsOpen, open: true, message: error?.response?.data?.message, severityType: 'error' });
    }

    // Reset form state
    setEditForm({});
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
    setEditForm({});
    setIsFileUploadModalOpen(false);
  };
  const getRoleColorForFileStatus = (status) => {
    switch (status) {
      case 1:
        return { color: "#4CAF50" }; // green
      case 0:
        return { color: "#F44336" }; // red
      default:
        return { color: "#41464b" }; // gray
    }
  };
  const onFilterTextBoxChanged = useCallback(() => {
    gridRef.current.api.setGridOption(
      'quickFilterText',
      document.getElementById('filter-text-box').value
    );
  }, []);
  // ✅ Column definitions
  const colDefs = [
    {
      flex: 0,
      width: 130,
      minWidth: 130,
      maxWidth: 130,
      headerName: "Actions",
      field: "actions",
      pinned: "left",
      editable: false,
      filter: true,
      headerStyle: { color: '#515151', backgroundColor: '#ffffe24d' },
      cellStyle: { backgroundColor: "rgb(252 229 205 / 64%)" },
      cellRenderer: (params) => (
        <div className="d-flex justify-content-around align-items-center">
          <button
            className="btn btn-sm"
            onClick={() => {
              setIsEditing(true);
              setIsModalOpen(true);
              setEditForm(params.data);
              setNotificationId(params.data._id);
            }}
          >
            <EditIcon size={16} className="action_icon" />
          </button>
          <button
            className="btn btn-sm"
            onClick={() => {
              setNotificationId(params.data._id);
              setIsDeleteModalOpen(true);
            }}
          >
            <DeleteIcon size={16} className="action_icon" />
          </button>
          <button
            disabled
            title="Feature coming soon"
            className="btn btn-sm"
            onClick={() => {
              setNotificationId(params.data.template_id);
              setIsFileUploadModalOpen(true);
            }}
          >
            <Upload size={16} className="action_icon" />
          </button>
        </div>
      ),
    },
    {
      field: "template_name",
      headerName: "Template Name",
      editable: false,
      filter: true,
      headerStyle: { color: '#515151', backgroundColor: '#ffffe24d' },

    },
    {
      field: "company_name", headerName: "Company Name",
      editable: false,
      filter: true,
      headerStyle: { color: '#515151', backgroundColor: '#ffffe24d' },
    },
    {
      field: "group_name", headerName: "Group Name",
      editable: false,
      filter: true,
      headerStyle: { color: '#515151', backgroundColor: '#ffffe24d' },
    },
    {
      field: "location_name", headerName: "Location Name",
      editable: false,
      filter: true,
      headerStyle: { color: '#515151', backgroundColor: '#ffffe24d' },
    },
    {
      field: "priority", headerName: "Priority",
      editable: false,
      filter: true,
      headerStyle: { color: '#515151', backgroundColor: '#ffffe24d' },
    },
    {
      field: "send_on", headerName: "Send On",
      editable: false,
      filter: true,
      headerStyle: { color: '#515151', backgroundColor: '#ffffe24d' },
    },
    {
      field: "sent_timestamp", headerName: "Sent Timestamp",
      editable: false,
      filter: true,
      headerStyle: { color: '#515151', backgroundColor: '#ffffe24d' },
    },
    {
      field: "status", headerName: "Status",
      editable: false,
      filter: true,
      headerStyle: { color: '#515151', backgroundColor: '#ffffe24d' },
    },
    {
      field: "approval_status",
      headerName: "Approval Status",
      editable: false,
      filter: true,
      headerStyle: { color: '#515151', backgroundColor: '#ffffe24d' },
      cellRenderer: (params) => {
        const status = params.value;
        const { color } = getRoleColorForFileStatus(status || 0);
        const getApprovalStatusText = (s) =>
          s === 1 ? "Approved" : s === 0 ? "Pending" : "-";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={status === 1}
              readOnly={status === 1}
              style={{
                cursor: "pointer",
                width: 15,
                height: 15,
                accentColor: "orange",
              }}
              onChange={
                status !== 1 ? () => handleSingleApprove(params.data._id) : null
              }
            />
            <span style={{ color, fontSize: "0.8rem", fontWeight: 500 }}>
              {getApprovalStatusText(status)}
            </span>
          </div>
        );
      },
    },
    {
      flex: 0,
      width: 100,
      minWidth: 100,
      maxWidth: 100,
      headerName: "Active",
      field: "is_active",
      pinned: "right",
      editable: false,
      filter: true,
      headerStyle: { color: '#515151', backgroundColor: '#ffffe24d' },
      cellRenderer: (params) => (
        <Toggle
          checked={!!params.value}
          onChange={(e) => handleToggleChange(e, params)}
        />
      ),
    },
    {
      field: "created_by", headerName: "Created By",
      editable: false,
      filter: true,
      headerStyle: { color: '#515151', backgroundColor: '#ffffe24d' },
    },
    {
      field: "created_at", headerName: "Created At",
      editable: false,
      filter: true,
      headerStyle: { color: '#515151', backgroundColor: '#ffffe24d' },
    },
    {
      field: "updated_by", headerName: "Updated By", editable: false,
      filter: true,
      headerStyle: { color: '#515151', backgroundColor: '#ffffe24d' },
    },
    {
      field: "updated_at", headerName: "Updated At", editable: false,
      filter: true,
      headerStyle: { color: '#515151', backgroundColor: '#ffffe24d' },
    },
    {
      field: "approved_by", headerName: "Approved By", editable: false,
      filter: true,
      headerStyle: { color: '#515151', backgroundColor: '#ffffe24d' },
    },
    {
      field: "approved_at", headerName: "Approved At", editable: false,
      filter: true,
      headerStyle: { color: '#515151', backgroundColor: '#ffffe24d' },
    },
  ];
  const fileUploadForm = () => {
    return (
      <div>
        <div className="mb-3 ps-3 pe-3 pb-3 mt-4">
          <div className="button-wrap">
            <MultiFileUpload setUploadedFiles={setUploadedFiles} uploadedFiles={uploadedFiles} />
          </div>
        </div>

        <div className="row row-gap-2">
          <div className="col-12 col-md-6">
            <button type="button" className="btn btn-secondary w-100" onClick={() => setIsFileUploadModalOpen(false)}>Cancel</button>
          </div>
          <div className="col-12 col-md-6">
            <button type="submit" className="btn btn-primary w-100" onClick={handleFileUpload}>Upload</button>
          </div>
        </div>
      </div>

    )

  }
  // ✅ Delete modal
  const deleteModal = () => (
    <div>
      <div className="delete_message p-4">
        Are you sure you want to delete this Template?
      </div>
      <div className="row row-gap-2 mt-4">
        <div className="col-6">
          <button
            type="button"
            className="btn-sm btn btn-secondary"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </button>
        </div>
        <div className="col-6 d-flex justify-content-end">
          <button
            type="submit"
            className="btn-sm btn btn-primary"
            onClick={() => handleDelete(notificationId)}
          >
            Yes, I'm sure
          </button>
        </div>
      </div>
    </div>
  );

  const templateModal = () => (
    <div>
      <div className='d-lg-flex d-md-flex justify-content-between gap-3'>
        <SingleSelectTextField
          name="group_name"
          label="Group Holding"
          value={editForm.group_name}
          onChange={(e) => {
            const selectedName = e.target.value;
            const matchedGroup = groupHoldingName.find(
              (g) => g.name === selectedName
            );
            setEditForm((prev) => ({
              ...prev,
              group_name: selectedName,
              group_holding_id: matchedGroup?._id || null,
              company_name: '',
              location_name: '',
            }));
          }}
          names={groupHoldingName}
        // error={!!errors.group_name}
        // helperText={errors.group_name}
        />
        <SingleSelectTextField name="company_name" label="Company Name" value={editForm?.company_name}
          onChange={(e) => {
            const selectedName = e.target.value;
            const matchedCompany = companyName.find(
              (g) => g.company_name === selectedName
            );
            setEditForm((prev) => ({
              ...prev,
              company_name: selectedName,
              company_id: matchedCompany?._id || null,
            }));
          }}
          names={companyName.map((item) => ({
            _id: item._id,
            name: item.company_name,
          }))}
        // error={!!errors.company_name}
        // helperText={errors.company_name}
        // isdisable={isEditing ? true : false}

        />
        <SingleSelectTextField name="location_name" label="Location" value={editForm?.location_name}
          onChange={(e) => {
            const selectedName = e.target.value;
            const matchedLocation = locationName.find(
              (g) => g.location_name === selectedName
            );
            setEditForm((prev) => ({
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
        // error={!!errors.location_name}
        // helperText={errors.location_name}

        />
      </div>
      <div className='d-lg-flex d-md-flex justify-content-between gap-3'>
        {/* <MuiTextField
                    name="template_name"
                    label="Template Name"
                    value={editForm?.template_name}
                    isdisabled={true}
                    onChange={(e) => {
                        const selectedName = e.target.value;
                        const matchedTemplate = templateName.find(
                            (g) => g.name === selectedName
                        );
                        setEditForm((prev) => ({
                            ...prev,
                            template_name: selectedName,
                            template_id: matchedTemplate?._id || null,
                        }));
                    }}
                    error={!!errors.template_name}
                    helperText={errors.template_name}
                /> */}
        <SingleSelectTextField name="template_name" label="Template" value={editForm?.template_name}
          onChange={(e) => {
            const selectedName = e.target.value;
            const matchedTemplate = templateName.find(
              (g) => g.template_name === selectedName
            );
            setEditForm((prev) => ({
              ...prev,
              template_name: selectedName,
              template_id: matchedTemplate?._id || null,
            }));
          }}
          names={templateName.map((item) => ({
            _id: item._id,
            name: item.template_name,
          }))}
        />
        <SingleSelectTextField name="priority" label="Template Status" value={editForm?.priority}
          onChange={(e) => {
            const selectedName = e.target.value;
            setEditForm((prev) => ({
              ...prev,
              priority: selectedName,
            }));
          }}
          names={priorities.map((item) => ({
            _id: item.label,
            name: item.value,
          }))}
        // isdisable={isEditing ? true : false}
        // error={!!errors.template_status}
        // helperText={errors.template_status}

        />
      </div>

      <MultipleSelectTextFields
        label="Send To"
        value={editForm?.send_to || []}   // always an array
        onChange={(selectedValues) => {
          setEditForm((prev) => ({
            ...prev,
            send_to: selectedValues, // store emails
          }));
        }}

        names={userName.map((item) => ({
          _id: item._id,
          name: item.email,
          optionalValue: item.full_name
        }))}
      // isdisable={isEditing ? true : false}
      // error={!!errors.template_name}
      // helperText={errors.template_name}

      />
      <MultipleSelectTextFields
        label="cc"
        value={editForm.cc || []}   // always an array
        onChange={(selectedValues) => {
          setEditForm((prev) => ({
            ...prev,
            cc: selectedValues, // store emails
          }));
        }}
        names={userName.map((item) => ({
          _id: item._id,
          name: item.email,         // used for selection
          optionalValue: item.full_name, // extra info if needed later
        }))}


      // error={!!errors.access}
      // helperText={errors.access}
      // isRequired={false}
      />
      <ResponsiveDatePickers setSelectedDate={setSelectedDate} selectedDate={selectedDate} />
      <div className="row row-gap-2 mt-3">
        <div className='col-6'>
          <button type="button" className="btn btn-secondary" onClick={closeModal}><span className='button-style'>Cancel</span></button>
        </div>
        <div className='col-6 d-flex justify-content-end'>
          <button type="submit" className="btn btn-primary" onClick={handleSubmit}>{isEditing ? <span className='button-style'>Save Changes</span> : <span className='button-style'>Create Template</span>}</button>
        </div>
      </div>
    </div>
  )
  return (
    // <div className="show-notifications-container">
    // <Snackbars
    //   issnackbarsOpen={issnackbarsOpen}
    //   setIsSnackbarsOpen={setIsSnackbarsOpen}
    // />
    // <DeleteModal
    //   deleteForm={deleteModal}
    //   deleteTitle="Delete Notification Template"
    //   isModalOpen={isDeleteModalOpen}
    //   setIsModalOpen={setIsDeleteModalOpen}
    // />
    // <Modal
    //   crudForm={templateModal}
    //   closeModal={closeModal}
    //   crudTitle={crudTitle}
    //   isEditing={isEditing}
    //   editCrudTitle={editCrudTitle}
    //   isModalOpen={isModalOpen}
    //   setIsModalOpen={setIsModalOpen} />

    //   <div className="notifications-header">
    //     <div className="header-content">
    //       <h1>
    //         {notifications?.length > 0
    //           ? `${notifications.length} Notifications`
    //           : "No Notification"}
    //       </h1>
    //       <p>Manage and monitor all your notification templates</p>
    //     </div>
    //     <div className="d-lg-flex d-md-flex gap-2">
    //       <button
    //         onClick={openModal}
    //         className="create-button"
    //       >
    //         <PlusIcon />
    //         Create Template
    //       </button>
    //       <button onClick={handleApproveAll} className="approve-all-button">
    //         ✅ Approve All
    //       </button>
    //     </div>
    //   </div>

    //   <div
    //     className="ag-theme-quartz" style={{ height: '600px', width: '100%', marginTop: '1rem' }}
    //   >
    //     <AgGridReact
    //       theme="legacy"
    //       ref={gridRef}
    //       rowData={notifications}
    //       columnDefs={colDefs}
    //       defaultColDef={defaultColDef}
    //       pagination={true}
    //     />
    //   </div>
    // </div >


    <div>
      <Snackbars
        issnackbarsOpen={issnackbarsOpen}
        setIsSnackbarsOpen={setIsSnackbarsOpen}
      />
      <DeleteModal
        deleteForm={deleteModal}
        deleteTitle="Delete Notification Template"
        isModalOpen={isDeleteModalOpen}
        setIsModalOpen={setIsDeleteModalOpen}
      />
      <Modal
        crudForm={templateModal}
        closeModal={closeModal}
        crudTitle={crudTitle}
        isEditing={isEditing}
        editCrudTitle={editCrudTitle}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen} />
      <SmallSizeModal crudForm={fileUploadForm} crudTitle='Upload Notification' isEditing={isEditing} editCrudTitle={editCrudTitle} isModalOpen={isFileUploadModalOpen} setIsModalOpen={setIsFileUploadModalOpen} closeModal={closeModal} />

      <div className='service-tracker-inner-page-header d-lg-flex d-md-flex'>
        <div className="notification-page-title">
          <div>
            <h1>{notifications?.length > 0
              ? `${notifications.length} Notifications`
              : "No Notification"}</h1>
          </div>
        </div>
        <div className='d-lg-flex d-md-flex gap-2 mt-2'>
          <button
            onClick={openModal}
            className="create-button"
          >
            <PlusIcon />
            Create Notification
          </button>
          <div className='btn-wrap-div'>
            <button onClick={handleApproveAll} className="approve-all-button">
              ✅ Approve All
            </button>
          </div>
        </div>
      </div>

      <div className='table_div p-3'>
        <div className='d-lg-flex d-md-flex  justify-content-between'>
          <AnimatedSearchBar placeholder="Search..." type="text" id="filter-text-box" onInput={onFilterTextBoxChanged} />
          {/* <div>
            <button className="reject upload-wrapper upload-label" onClick={() => setIsFileUploadModalOpen(true)}>
              <span className="icon">
                <svg viewBox="0 0 24 24">
                  <path d="M5 20h14v-2H5v2zm7-18l-5.5 5.5h4v6h3v-6h4L12 2z" />
                </svg>
              </span>
              <span className="text">Upload File</span>
            </button>
          </div> */}
        </div>
        <div className="ag-theme-quartz" style={{ height: '600px', width: '100%', marginTop: '1rem' }}>
          <AgGridReact
            theme="legacy"
            ref={gridRef}
            rowData={notifications}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            editType="fullRow"
            rowSelection="single"
            pagination={true}
          // rowBuffer={rowBuffer}
          // onRowValueChanged={onRowValueChanged}

          />
        </div>
      </div>
    </div>
  );
};

export default CreateNotification;
