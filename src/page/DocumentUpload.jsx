import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import "../style/useRole.css";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SingleSelectTextField from "../component/MuiInputs/SingleSelectTextField";
import { useSearchParams } from "react-router-dom";
import { Tab, Tabs } from "@mui/material";
import Toggle from "../component/Toggle";
import { usePageAccess } from "./utils/usePageAccess";
import {
  uploadFileGolang,
  fetchAllFiles,
  deleteFileById,
  updateFileById,
  bulkApproveAllPageData,
  fetchAllGroup,
  fetchCompaniesNameByGroupId,
  getLocationByCompanyId,
  fetchAllModulesNameByLocationId,
  fetchAllSubModuleNameByModuleId,
  fetchServiceTrackerByModuleId,
  fetchDocumentDropdownTypes,
  fetchDocumentDropdownStages,
  downloadFile,
  fetchEntityById,
  getAllCompanyLocationByEntityId,
  updateDocumentApprovalStatusById,
} from "../api/service";
import DeleteModal from "../component/DeleteModal";
import Snackbars from "../component/Snackbars";
import FilePresentIcon from "@mui/icons-material/FilePresent";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PaginatedGrid from "../component/PaginatedGrid";
import PageSelectHeader from "../component/PageSelectHeader";
import MultiFileUpload from "../component/MultiFileUpload";
import RightDrawer from "../component/RightDrawer";
import { ReactPDFViewer } from "../component/ReactPDFViewer";
import SmallSizeModal from "../component/SmallSizeModal";
import { AnimatedSearchBar } from "../component/AnimatedSearchBar";
import { Download } from "lucide-react";
import MultiSelectFilter from "./dashboardDrawerGridDetailPage/MultiSelectFilter";
import { flattenObject } from "../../Utils/tableColUtils";
import MonthYearCalander from "../component/MonthYearCalander";
import { decryptData } from "./utils/encrypt";
import { zipDocuments } from "./utils/bulkDownload";
import { downloadBlob } from "./utils/bulkUpload";

// Every file is held in memory while the zip is built, so keep a ceiling
const MAX_BULK_DOWNLOAD = 100;

// Views of the repository, kept in the URL (?view=) so /tagged_documents etc. can link to them.
// "Tagged" means company, entity, location, module, document type and stage are all filled (backend rule).
const VIEWS = [
  { key: "all", label: "All", params: {} },
  { key: "tagged", label: "Tagged", params: { tagged: "true" } },
  { key: "untagged", label: "Untagged", params: { tagged: "false" } },
  { key: "pending", label: "Pending approval", params: { approval_status: 0 } },
];

const DocumentUpload = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = VIEWS.find((v) => v.key === searchParams.get("view")) || VIEWS[0];
  const fetchViewPage = useCallback(
    (page, limit, search) => fetchAllFiles(page, limit, search, view.params),
    [view],
  );
  const changeView = (key) => {
    setSelectedDocs([]); // the grid remounts for the new view, dropping its selection
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (key === "all") next.delete("view");
        else next.set("view", key);
        return next;
      },
      { replace: true },
    );
  };
  // Hide or disable actions the user's document_repository grant doesn't allow
  const { canCreate, canUpdate, canDelete } = usePageAccess("document_repository");
  // Rows of the page currently shown; used for dynamic columns and MultiSelectFilter
  const [data, setData] = useState([]);
  const gridRef = useRef();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});

  // The search box goes to the API (?search=...), so it covers every record.
  // MultiSelectFilter still only applies to the rows of the page on screen.
  const rowFilter = useCallback(
    (row) =>
      Object.entries(filters).every(
        ([column, values]) => !values?.length || values.includes(row[column]),
      ),
    [filters],
  );

  // Reload the current page from the API (after edit/delete/upload/approve)
  const loadFiles = useCallback(async () => {
    gridRef.current?.refresh();
  }, []);

  // Re-apply the column filters to the page on screen
  useEffect(() => {
    gridRef.current?.refresh();
  }, [rowFilter]);
  const [uploading, setUploading] = useState(false);
  const [current, setCurrent] = useState({
    group_name: "",
    group_holdings_id: null,
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
    service_tracker_name: "",
    service_tracker_id: null,
    document_type_name: "",
    document_type_id: null,
    stage: "",
    stage_id: null,
    document_month: null,
    document_year: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isPdfView, setIsPdfView] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFileUploadModalOpen, setIsFileUploadModalModalOpen] =
    useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [documentId, setDocumentId] = useState(null);
  const [previewFile, setPreviewFile] = useState({
    documentId: null,
    fileName: "",
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [issnackbarsOpen, setIsSnackbarsOpen] = useState({
    open: false,
    vertical: "top",
    horizontal: "center",
    message: "",
    severityType: "",
  });
  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
  };
  const [isAutoUpload, setIsAutoUpload] = useState(true);
  const [errors, setErrors] = useState({});
  const [groupHoldingName, setGroupHoldingName] = useState([]);
  const [companyName, setCompanyName] = useState([]);
  const [locationName, setLocationName] = useState([]);
  const [entityName, setEntityName] = useState([]);
  const [moduleName, setModuleName] = useState([]);
  const [subModuleName, setSubModuleName] = useState([]);
  const [serviceTrackerName, setServiceTrackerName] = useState([]);
  const [documentDropdownTypes, setDocumentDropdownTypes] = useState([]);
  const [documentDropdownStages, setDocumentDropdownStages] = useState([]);
  const searchTimerRef = useRef(null);
  const [selectedDocs, setSelectedDocs] = useState([]);
  // { done, total } while a bulk download is running, otherwise null
  const [bulkProgress, setBulkProgress] = useState(null);

  const validate = () => {
    let tempErrors = {};
    if (!current?.group_name)
      tempErrors.group_name = "Group Holding is required";
    if (!current?.company_name) tempErrors.company_name = "Company is required";
    if (!current?.location_name)
      tempErrors.location_name = "Location is required";
    if (!current?.module_name) tempErrors.module_name = "Module is required";
    // if (!current?.sub_module_name)
    // tempErrors.sub_module_name = "Sub Module is required";
    if (!current?.service_tracker_name)
      tempErrors.service_tracker_name = "Service Tracker is required";
    if (!current?.document_type_name)
      tempErrors.document_type_name = "Document Type is required";
    if (!current?.stage_name) tempErrors.stage_name = "Stage is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
  const crudTitle = "Upload Your File";
  const editCrudTitle = "Edit Your Uploaded File";
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return; // Don't proceed if validation fails
    const payload = current;

    try {
      let response;
      // Update existing company
      response = await updateFileById(documentId, payload);
      // ✅ Get the message from response
      const message = response?.message;
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: message,
        severityType: "success",
      });

      // Refresh data
      await loadFiles();
    } catch (error) {
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: error?.response?.data?.message,
        severityType: "error",
      });
    }
    setIsEditing(false);
    setIsModalOpen(false);
  };

  // Handle Delete
  const handleDelete = async (documentId) => {
    try {
      const response = await deleteFileById(documentId);
      const message = response?.message;

      // Refresh data
      await loadFiles();
      setIsDeleteModalOpen(false);

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
  };
  // Function to open the modal
  const openModal = () => {
    setIsFileUploadModalModalOpen(true);
  };

  const closeModal = () => {
    setIsFileUploadModalModalOpen(false);
    setIsDeleteModalOpen(false);
    setUploadedFiles([]);
  };
  const toggleDrawer = (newOpen) => () => {
    setIsModalOpen(newOpen);
    if (!newOpen) setIsPdfView(false);
  };

  //  =============================   auto file upload logic   =================================================
  //  const handleFileUpload = async () => {
  //   if (!uploadedFiles?.length) {
  //     alert("Please select at least one file.");
  //     return;
  //   }

  //   try {
  //     const firstApiResponse = await uploadFile(uploadedFiles);
  //     const secondApiResponse = await uploadFileGolang({
  //       files: uploadedFiles,
  //       previousResponse: firstApiResponse,
  //     });

  //     setIsFileUploadModalModalOpen(false);
  //     const message = secondApiResponse?.message || "Status updated successfully";
  //     setIsSnackbarsOpen({
  //       ...issnackbarsOpen,
  //       open: true,
  //       message,
  //       severityType: 'success',
  //     });
  //     const updatedData = await fetchAllFiles();
  //     setData(updatedData);
  //   } catch (error) {
  //     setIsSnackbarsOpen({
  //       ...issnackbarsOpen,
  //       open: true,
  //       message: error?.response?.data?.message || "Upload failed. Please try again.",
  //       severityType: 'error',
  //     });
  //   }
  // };

  const handleFileUpload = async () => {
    if (!uploadedFiles?.length) {
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: "Please select at least one file.",
        severityType: "warning",
      });
      return;
    }

    try {
      setUploading(true); // ✅ WAIT start

      const result = await uploadFileGolang(uploadedFiles, isAutoUpload);

      setIsFileUploadModalModalOpen(false);

      const message = result?.message || "Status update successfully";

      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message,
        severityType: "success",
      });

      await loadFiles();
      setUploadedFiles([]);
    } catch (error) {
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: error?.response?.data?.message,
        severityType: "error",
      });
    } finally {
      setUploading(false); // ✅ WAIT end (very important)
    }
  };

  const handleToggleChange = async (e, params) => {
    const newIsActive = {
      module_id: params.data.module_id,
      submodule_id: params.data.submodule_id,
      company_name: params.data.company_name,
      company_location: params.data.company_location,
      document_type_name: params.data.document_type_name,
      stage: params.data.stage,
      is_active: e.target.checked,
      approval_status: params.data.approval_status,
    };
    try {
      const response = await updateFileById(
        params.data.document_id,
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
      await loadFiles();
    } catch (error) {
      // Show error snackbar
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: error?.response?.data?.message,
        severityType: "error",
      });
    }
  };
  // With an id (a row's Mongo _id) approves that document only; without one, every pending document
  const handleApproveAll = async (id) => {
    try {
      const response = id
        ? await updateDocumentApprovalStatusById(id, 1)
        : await bulkApproveAllPageData("document_repository");
      const message = response?.message || "Status update successfully";
      // Show success snackbar
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message,
        severityType: "success",
      });
      // Refresh data
      await loadFiles();
    } catch (error) {
      // Show error snackbar
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: error?.response?.data?.message,
        severityType: "error",
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const groups = await fetchAllGroup();
        setGroupHoldingName(groups);
      } catch {
        // Handle error silently
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const data = await fetchCompaniesNameByGroupId(
          current?.group_holdings_id,
        );
        if (data) {
          setCompanyName(data);
        }
      } catch {
        // Handle error silently
      }
    };

    if (current?.group_holdings_id) {
      fetchCompany();
    }
  }, [current?.group_holdings_id]);

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const data = await fetchEntityById(current?.company_id);

        if (data) {
          setEntityName(data);
        } else {
          setEntityName([]);
        }
      } catch {
        setEntityName([]);
      }
    };

    if (current?.company_id) {
      fetchEntities();
    }
  }, [current?.company_id]);

  useEffect(() => { // const response = id
      //   ? await updateDocumentApprovalStatusById(id, 1)
      //   : await bulkApproveAllPageData("document_repository");
    const fetchLocationByCompanyId = async () => {
      try {
        const data = await getLocationByCompanyId(current?.company_id);
        if (data) {
          setLocationName(data);
        }
      } catch {
        // Handle error silently
      }
    };

    if (current?.company_id) {
      fetchLocationByCompanyId();
    }
  }, [current?.company_id]);

  useEffect(() => {
    const fetchModuleByLocationId = async () => {
      try {
        const data = await fetchAllModulesNameByLocationId(
          current?.location_id,
        );
        if (data) {
          setModuleName(data);
        }
      } catch {
        // Handle error silently
      }
    };

    if (current?.location_id) {
      fetchModuleByLocationId();
    }
  }, [current?.location_id]);

  // sub-module by module id
  useEffect(() => {
    const fetchSubModuleByModuleId = async () => {
      try {
        const data = await fetchAllSubModuleNameByModuleId(current?.module_id);
        if (data) {
          setSubModuleName(data);
        }
      } catch {
        // Handle error silently
      }
    };

    if (current?.module_id) {
      fetchSubModuleByModuleId();
    }
  }, [current?.module_id]);
  // Fetch service tracker by module ID
  useEffect(() => {
    const getServiceTrackerByModuleId = async (id) => {
      try {
        const data = await fetchServiceTrackerByModuleId(id);
        if (data) {
          setServiceTrackerName(data);
        }
      } catch {
        // Handle error silently
      }
    };

    if (current?.module_id) {
      getServiceTrackerByModuleId(current?.module_id);
    }
  }, [current?.module_id]);

  useEffect(() => {
    const getDocumentDropdownTypes = async (service_tracker_name) => {
      try {
        const data = await fetchDocumentDropdownTypes(service_tracker_name);
        if (data) {
          setDocumentDropdownTypes(data);
        }
      } catch {
        // Handle error silently
      }
    };

    if (current?.service_tracker_name) {
      getDocumentDropdownTypes(current?.service_tracker_name);
    }
  }, [current?.service_tracker_name]);

  useEffect(() => {
    const getDocumentDropdownStages = async (service_tracker_name) => {
      try {
        const data = await fetchDocumentDropdownStages(service_tracker_name);
        if (data) {
          setDocumentDropdownStages(data);
        }
      } catch {
        // Handle error silently
      }
    };

    if (current?.service_tracker_name) {
      getDocumentDropdownStages(current?.service_tracker_name);
    }
  }, [current?.service_tracker_name]);

  const handleBulkDownload = async () => {
    if (!selectedDocs.length || bulkProgress) return;
    if (selectedDocs.length > MAX_BULK_DOWNLOAD) {
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: `You can download at most ${MAX_BULK_DOWNLOAD} files at a time.`,
        severityType: "warning",
      });
      return;
    }

    const docs = selectedDocs.map(({ document_id, file_name }) => ({
      document_id,
      file_name,
    }));
    setBulkProgress({ done: 0, total: docs.length });
    try {
      // A single file doesn't need a zip around it
      if (docs.length === 1) {
        const blob = await downloadFile(docs[0].document_id);
        downloadBlob(blob, docs[0].file_name || "document");
        return;
      }

      const { zip, failed } = await zipDocuments(docs, (done, total) =>
        setBulkProgress({ done, total }),
      );
      if (zip) {
        const date = new Date().toISOString().slice(0, 10);
        downloadBlob(zip, `documents_${date}.zip`);
      }

      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: !failed.length
          ? `Downloaded ${docs.length} files`
          : zip
            ? `Downloaded ${docs.length - failed.length} of ${docs.length} files. Failed: ${failed
                .map((d) => d.file_name || d.document_id)
                .join(", ")}`
            : "Download failed. Please try again.",
        severityType: !failed.length ? "success" : zip ? "warning" : "error",
      });
    } catch (error) {
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: error?.response?.data?.message || "Download failed. Please try again.",
        severityType: "error",
      });
    } finally {
      setBulkProgress(null);
    }
  };

  const getRoleColorForFileStatus = (status) => {
    switch (status) {
      case 0:
        return { color: "#FFC107" }; // amber
      case 1:
        return { color: "#4CAF50" }; // green
      default:
        return { color: "#41464b" }; // gray
    }
  };
  // Internal ids / audit fields that should never become their own column,
  // matched on the leaf of a flattened key (so `ai_data._id` is caught too).
  const HIDDEN_DYNAMIC_LEAVES = new Set([
    "_id",
    "is_active",
    "is_deleted",
    "is_archived",
    "deleted_at",
    "deleted_by",
    "created_by",
    "updated_by",
    "approved_by",
  ]);

  // "ai_data.created_at" -> "AI Data Created At" (prefixing the parent keeps
  // nested fields from colliding with the top level ones)
  const buildHeaderName = (key) =>
    key
      .split(".")
      .map((part) =>
        part
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())
          .replace(/\bAi\b/g, "AI"),
      )
      .join(" ");

  const generateDynamicColDefs = (data, existingColDefs = []) => {
    if (!data || data.length === 0) return [];

    // Union the keys of the first rows: an empty `ai_data` on row 0 would
    // otherwise hide those columns entirely.
    const sample = data
      .slice(0, 20)
      .reduce((acc, row) => Object.assign(acc, flattenObject(row)), {});

    // Anything already declared as a static column is skipped, matched on both
    // the field path and the header text.
    const takenFields = new Set(
      existingColDefs.map((col) => col.field).filter(Boolean),
    );
    const takenHeaders = new Set(
      existingColDefs
        .map((col) => col.headerName?.toLowerCase())
        .filter(Boolean),
    );

    return Object.keys(sample)
      .map((key) => {
        const leaf = key.split(".").pop();

        if (HIDDEN_DYNAMIC_LEAVES.has(leaf)) return null;

        // Drop raw ObjectId columns that already have a readable `_name` twin
        // (company_id, entity_id, module_id, …). `document_id` has no twin, so
        // it survives.
        if (leaf.endsWith("_id") && key.replace(/_id$/, "_name") in sample)
          return null;

        // Nested foreign keys that just repeat a top level id (ai_data.document_id)
        if (key.includes(".") && leaf.endsWith("_id") && leaf in sample)
          return null;

        // Objects/arrays have no sensible cell rendering (e.g. a null `ai_data`)
        if (sample[key] !== null && typeof sample[key] === "object")
          return null;

        const headerName = buildHeaderName(key);

        if (takenFields.has(key) || takenHeaders.has(headerName.toLowerCase()))
          return null;

        takenFields.add(key);
        takenHeaders.add(headerName.toLowerCase());

        return {
          field: key,
          headerName,
          filter: true,
          editable: false,
          headerStyle: {
            color: "#515151",
            backgroundColor: "#ffffe24d",
          },

          valueGetter: (params) => {
            const value = key
              .split(".")
              .reduce((acc, part) => acc?.[part], params.data);

            if (value === null || value === undefined || value === "")
              return "-";
            if (typeof value === "boolean") return value ? "Yes" : "No";
            return value;
          },
        };
      })
      .filter(Boolean);
  };
  const staticColDefs = [
    {
      flex: 0,
      width: 130,
      minWidth: 130,
      maxWidth: 130,
      headerName: "Actions",
      field: "actions",
      filter: false,
      editable: false,
      pinned: "right",
      cellStyle: { "background-color": "rgb(252 229 205 / 64%)" },
      cellRenderer: (params) => {
        return (
          <div className="d-flex justify-content-around align-items-center">
            <button
              className="btn btn-sm"
              title="Preview document"
              onClick={() => {
                setPreviewFile({
                  documentId: params.data.document_id,
                  fileName: params.data.file_name || "",
                });
                setIsPdfView(true);
                setIsModalOpen(true);
              }}
            >
              <VisibilityIcon fontSize="small" className="action_icon" />
            </button>
            {canDelete && (
            <button
              className="btn btn-sm"
              onClick={() => {
                setDocumentId(params.data.document_id);
                setIsDeleteModalOpen(true);
              }}
            >
              <DeleteIcon fontSize="small" className="action_icon" />
            </button>
            )}
            {canUpdate && (
            <button
              className="btn btn-sm"
              onClick={() => {
                setCurrent(params.data);
                setIsEditing(true);
                setIsModalOpen(true);
                setIsPdfView(false);

                setDocumentId(params.data.document_id); // OR .user_id based on your data
              }}
            >
              <EditIcon fontSize="small" className="action_icon" />
            </button>
            )}
            {/* <VisibilityIcon/> */}
          </div>
        );
      },
    },

    {
      field: "file_path",
      headerName: "File Path",
      editable: false,
      cellRenderer: (params) => {
        const handleDownload = async () => {
          try {
            const blob = await downloadFile(params.data.document_id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = params.data.file_name || "report.xlsx";
            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          } catch (error) {
            console.error("File download failed:", error);
          }
        };

        return (
          <button onClick={handleDownload} style={{ display: "contents" }}>
            <Download
              style={{
                height: "21px",
                width: "21px",
                color: "cadetblue",
                cursor: "pointer",
              }}
            />
          </button>
        );
      },
    },
    {
      field: "ai_data.doc_type",
      headerName: "AI Document Type",
      editable: false,
      valueGetter: (params) => params.data?.ai_data?.doc_type || "-",
    },
    {
      field: "ai_data.confidence",
      headerName: "AI Confidence Score",
      editable: false,
      valueGetter: (params) =>
        params.data?.ai_data?.confidence !== undefined
          ? `${params.data.ai_data.confidence}%`
          : "-",
    },
    {
      field: "group_holdings_id",
      headerName: "Document Status",
      editable: false,
      cellRenderer: (params) => (
        <span style={{ color: params.value !== "" ? "black" : "gray" }}>
          {params.value !== "" ? "Taged" : "Untaged"}
        </span>
      ),
    },
    {
      flex: 0,
      width: 120,
      minWidth: 120,
      maxWidth: 120,
      editable: false,
      field: "is_active",
      headerName: "Status",
      pinned: "left",
      valueGetter: (params) => params.data?.is_active,
      cellRenderer: (params) => (
        <Toggle
          checked={!!params.value}
          onChange={(e) => handleToggleChange(e, params)}
          disabled={!canUpdate}
        />
      ),
    },
    {
      field: "approval_status",
      headerName: "Approval Status",
      editable: false,
      width: 150,
      valueGetter: (params) => params.data?.approval_status, // safer access
      cellRenderer: (params) => {
        const getApprovalStatusText = (status) => {
          switch (status) {
            case 0:
              return "Pending";
            case 1:
              return "Approved";
            default:
              return "-"; // fallback
          }
        };

        const status = params.value;
        const { color } = getRoleColorForFileStatus(status || 0); // Fallback to 0 (Pending) if undefined

        return (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={status === 1}
              disabled={status === 1 || !canUpdate}
              style={{
                cursor: status === 1 || !canUpdate ? "default" : "pointer",
                width: 15,
                height: 15,
                accentColor: "orange",
              }}
              onChange={() => handleApproveAll(params.data._id)}
            />
            <span
              style={{
                color,
                fontSize: "0.8rem",
                fontWeight: 500,
              }}
            >
              {getApprovalStatusText(status)}
            </span>
          </div>
        );
      },
    },
  ];
  const colDefs = [
    ...staticColDefs,
    ...generateDynamicColDefs(data, staticColDefs),
  ];
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
  // quickFilterText doesn't work with the infinite row model, so the text is
  // sent to the API instead; debounced so every keystroke isn't a request
  const onFilterTextBoxChanged = useCallback((e) => {
    const value = e.target.value;
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setSearch(value), 400);
  }, []);
  const fileUploadForm = () => {
    return (
      <div>
        <div className="d-flex align-items-center">
          <span>
            <Toggle
              checked={isAutoUpload}
              onChange={() => setIsAutoUpload(!isAutoUpload)}
            />
          </span>
          <span className="fs-12 ms-2 mt-1">AI Processed</span>
        </div>

        <div className="mb-3 ps-3 pe-3 pb-3 mt-4">
          <div className="button-wrap">
            <div style={{ fontSize: 14, marginBottom: 7, color: "gray" }}>
              <span>Note: </span>
              <span>You can upload a maximum of 5 files at a time.</span>
            </div>
            <MultiFileUpload
              setUploadedFiles={setUploadedFiles}
              uploadedFiles={uploadedFiles}
            />
          </div>
        </div>

        <div className="row row-gap-2">
          <div className="col-12 col-md-6">
            <button
              type="button"
              className="btn btn-secondary w-100"
              onClick={closeModal}
            >
              Cancel
            </button>
          </div>
          <div className="col-12 col-md-6">
            <button
              type="submit"
              className="btn btn-primary w-100"
              onClick={handleFileUpload}
              disabled={uploading}
            >
              {uploading ? "Wait..." : "Upload"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const deleteModal = () => {
    return (
      <div>
        <div className="delete_message p-4">
          Are you sure you want to delete <DeleteIcon className="action_icon" />{" "}
          this user role?
        </div>

        <div className="row row-gap-2 mt-4">
          <div className="col-6">
            <button
              type="button"
              className="btn-sm btn btn-secondary"
              onClick={closeModal}
            >
              <span className="button-style">Cancel</span>
            </button>
          </div>
          <div className="col-6 d-flex justify-content-end">
            <button
              type="submit"
              className="btn-sm btn btn-primary"
              onClick={() => handleDelete(documentId)}
            >
              Yes, I'm sure
            </button>
          </div>
        </div>
      </div>
    );
  };

  const drawerHeader = () => {
    if (isPdfView) {
      return (
        <div className="p-3 fs-14 fw-600">
          <FilePresentIcon style={{ color: "deepskyblue" }} />
          Document Preview
        </div>
      );
    }
    return (
      <div className="p-3 fs-14 fw-600">
        <AttachFileIcon style={{ color: "green" }} />
        Tag Document
      </div>
    );
  };
  const drawerFilePreviewHeader = () => {
    return (
      <div className="p-3 fs-14 fw-600">
        {/* <FilePresentIcon style={{ color: "deepskyblue" }} />
        Document Preview */}
      </div>
    );
  };
  const drawerBody = () => {
    return (
      <div className="p-3">
        <div className="d-lg-flex d-md-flex gap-3 mb-3">
          <SingleSelectTextField
            name="group_name"
            label="Group Holding"
            value={current.group_name}
            onChange={(e) => {
              const selectedName = e.target.value;
              const matchedGroup = groupHoldingName?.find(
                (g) => g.group_name === selectedName,
              );
              setCurrent((prev) => ({
                ...prev,
                group_name: selectedName,
                group_holdings_id: matchedGroup?._id || null,
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
                service_tracker_name: "",
                service_tracker_id: null,
              }));

              setCompanyName([]);
              setEntityName([]);
              setLocationName([]);
              setModuleName([]);
              setSubModuleName([]);
              setServiceTrackerName([]);
              setErrors((prevErrors) => ({ ...prevErrors, group_name: "" }));
            }}
            names={groupHoldingName?.map((item) => ({
              _id: item._id,
              name: item.group_name,
            }))}
            error={!!errors.group_name}
            helperText={errors.group_name}
          />
          <SingleSelectTextField
            name="company_name"
            label="Company Name"
            value={current?.company_name}
            onChange={(e) => {
              const selectedName = e.target.value;
              const matchedCompany = companyName.find(
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
                service_tracker_name: "",
                service_tracker_id: null,
              }));

              setEntityName([]);
              setLocationName([]);
              setModuleName([]);
              setSubModuleName([]);
              setServiceTrackerName([]);
              setErrors((prevErrors) => ({ ...prevErrors, company_name: "" }));
            }}
            names={companyName.map((item) => ({
              _id: item._id,
              name: item.company_name,
              optionalValue: item?.company_common_name,
            }))}
            error={!!errors.company_name}
            helperText={errors.company_name}
          />
        </div>

        <div className="d-lg-flex d-md-flex gap-3 mb-3">
          <SingleSelectTextField
            name="entity_name"
            label="Entity"
            value={current?.entity_name || ""}
            onChange={async (e) => {
              const selectedEntity = e.target.value;

              const matchedEntity =
                entityName.find((entity) => entity.name === selectedEntity) ||
                {};

              const selectedEntityId = matchedEntity.id || null;

              setCurrent((prev) => ({
                ...prev,
                entity_name: selectedEntity,
                entity_id: selectedEntityId,
                location_name: "",
                location_id: null,
                module_name: "",
                module_id: null,
                sub_module_name: "",
                sub_module_id: null,
                service_tracker_name: "",
                service_tracker_id: null,
              }));

              setModuleName([]);
              setSubModuleName([]);
              setServiceTrackerName([]);
              if (!selectedEntityId) {
                const allLocations = await getLocationByCompanyId(
                  current?.company_id,
                );

                setLocationName(allLocations || []);

                return;
              }

              try {
                const entityLocations =
                  await getAllCompanyLocationByEntityId(selectedEntityId);

                setLocationName(entityLocations || []);
              } catch {
                setLocationName([]);
              }
            }}
            names={entityName?.map((entity) => ({
              _id: entity?.id,
              name: entity?.name,
            }))}
          />
          <SingleSelectTextField
            name="location_name"
            label="Location"
            value={current?.location_name}
            onChange={(e) => {
              const selectedName = e.target.value;
              const matchedLocation = locationName.find(
                (g) => g.location_name === selectedName,
              );
              setCurrent((prev) => ({
                ...prev,
                location_name: selectedName,
                location_id: matchedLocation?._id || null,
              }));
              setErrors((prevErrors) => ({ ...prevErrors, location_name: "" }));
            }}
            names={locationName.map((item) => ({
              _id: item._id,
              name: item.location_name,
            }))}
            // isdisable={isEditing ? true : false}
            error={!!errors.location_name}
            helperText={errors.location_name}
          />
          <SingleSelectTextField
            name="module_name"
            label="Module"
            value={current?.module_name}
            onChange={(e) => {
              const selectedName = e.target.value;
              const matchedLocation = moduleName.find(
                (g) => g.name === selectedName,
              );
              setCurrent((prev) => ({
                ...prev,
                module_name: selectedName,
                module_id: matchedLocation?._id || null,
              }));
              setErrors((prevErrors) => ({ ...prevErrors, module_name: "" }));
            }}
            names={moduleName}
            // isdisable={isEditing ? true : false}
            error={!!errors.module_name}
            helperText={errors.module_name}
          />
        </div>

        <div className="d-lg-flex d-md-flex gap-3 mb-3">
          <SingleSelectTextField
            name="sub_module_name"
            label="Sub-Module"
            value={current?.sub_module_name}
            onChange={(e) => {
              const selectedName = e.target.value;
              const matchedLocation = subModuleName.find(
                (g) => g.sub_module_name === selectedName,
              );
              setCurrent((prev) => ({
                ...prev,
                sub_module_name: selectedName,
                sub_module_id: matchedLocation?._id || null,
              }));
              setErrors((prevErrors) => ({
                ...prevErrors,
                sub_module_name: "",
              }));
            }}
            names={subModuleName?.map((item) => ({
              _id: item._id,
              name: item.sub_module_name,
            }))}
            // isdisable={isEditing ? true : false}
            error={!!errors.sub_module_name}
            helperText={errors.sub_module_name}
          />

          {/* <SingleSelectTextField name="company_common_name" label="Sub-Module" value={current.company_common_name} onChange={(e) => setCurrent((prev) => ({ ...prev, company_common_name: e.target.value }))} names={userStatus} /> */}
          <SingleSelectTextField
            name="service_tracker_name"
            label="Service Tracker"
            value={current?.service_tracker_name}
            onChange={(e) => {
              const selectedName = e.target.value;
              const matchedLocation = serviceTrackerName.find(
                (g) => g.service_tracker_name === selectedName,
              );
              setCurrent((prev) => ({
                ...prev,
                service_tracker_name: selectedName,
                service_tracker_id: matchedLocation?._id || null,
              }));
              setErrors((prevErrors) => ({
                ...prevErrors,
                service_tracker_name: "",
              }));
            }}
            names={serviceTrackerName?.map((item) => ({
              _id: item._id,
              name: item.service_tracker_name,
            }))}
            // isdisable={isEditing ? true : false}
            error={!!errors.service_tracker_name}
            helperText={errors.service_tracker_name}
          />
        </div>
        <div className="d-lg-flex d-md-flex gap-3 mb-3">
          <SingleSelectTextField
            name="document_type_name"
            label="Document Type"
            value={current?.document_type_name}
            onChange={(e) => {
              const selectedName = e.target.value;
              const matchedLocation = documentDropdownTypes.find(
                (g) => g.value === selectedName,
              );
              setCurrent((prev) => ({
                ...prev,
                document_type_name: selectedName,
                document_type_id: matchedLocation?._id || null,
              }));
              setErrors((prevErrors) => ({
                ...prevErrors,
                document_type_name: "",
              }));
            }}
            names={documentDropdownTypes?.map((item) => ({
              _id: item._id,
              name: item.value,
            }))}
            // isdisable={isEditing ? true : false}
            error={!!errors.document_type_name}
            helperText={errors.document_type_name}
          />
          <SingleSelectTextField
            name="stage"
            label="Stage"
            value={current?.stage_name}
            onChange={(e) => {
              const selectedName = e.target.value;
              const matchedLocation = documentDropdownStages.find(
                (g) => g.value === selectedName,
              );
              setCurrent((prev) => ({
                ...prev,
                stage_name: selectedName,
                stage_id: matchedLocation?._id || null,
              }));
              setErrors((prevErrors) => ({ ...prevErrors, stage_name: "" }));
            }}
            names={documentDropdownStages?.map((item) => ({
              _id: item._id,
              name: item.value,
            }))}
            // isdisable={isEditing ? true : false}
            error={!!errors.stage_name}
            helperText={errors.stage_name}
          />
        </div>
        <div className="d-lg-flex d-md-flex gap-3 mb-3">
          <MonthYearCalander
            label="Document Month"
            views={["month"]}
            format="MMMM"
            outputFormat="M"
            size="medium"
            fullWidth
            value={current?.document_month ?? null}
            onChange={(val) => {
              setCurrent((prev) => ({
                ...prev,
                document_month: val ? Number(val) : null,
              }));
              setErrors((prevErrors) => ({
                ...prevErrors,
                document_month: "",
              }));
            }}
            error={!!errors.document_month}
            helperText={errors.document_month}
          />
          <MonthYearCalander
            label="Document Year"
            views={["year"]}
            format="YYYY"
            size="medium"
            fullWidth
            value={current?.document_year ?? null}
            onChange={(val) => {
              setCurrent((prev) => ({
                ...prev,
                document_year: val ? Number(val) : null,
              }));
              setErrors((prevErrors) => ({ ...prevErrors, document_year: "" }));
            }}
            error={!!errors.document_year}
            helperText={errors.document_year}
          />
        </div>

        <div className="d-lg-flex d-md-flex d-flex justify-content-between">
          <div>
            <button
              type="submit"
              className="btn btn-secondary"
              onClick={toggleDrawer(false)}
            >
              Cancel
            </button>
          </div>
          <div>
            <button
              type="submit"
              className="btn btn btn-primary"
              onClick={handleSubmit}
            >
              {isEditing ? "Save Changes" : "Save"}
            </button>
          </div>
        </div>
      </div>
    );
  };
  const drawerFilePreviewBody = () => {
    return (
      <div className="p-3">
        {/* <div className="row mb-4">
          <div className="col col-4">
            <div className="pdf-tab">
              <div className="fs-12">Document2</div>
              <div className="fs-12">
                <span style={{ color: "gray" }}>Uploaded By :</span> Rupa
              </div>
            </div>
          </div>
          <div className="col col-4">
            <div className="pdf-tab">
              <div className="fs-12">Document2</div>
              <div className="fs-12">
                <span style={{ color: "gray" }}>Uploaded By :</span> Rupa
              </div>
            </div>
          </div>
          <div className="col col-4">
            <div className="pdf-tab">
              <div className="fs-12">Document2</div>
              <div className="fs-12">
                <span style={{ color: "gray" }}>Uploaded By :</span> Rupa
              </div>
            </div>
          </div>
        </div> */}

        {/* <div className="mb-2 card_div p-3 w-auto card-border-blue">
          <div className="row align-items-center">
            <div className="col-3 col-md-2">
              <div
                className="p-2 rounded"
                style={{
                  background: "#FEEED2",
                  color: "#F68E3F",
                  textAlign: "center",
                }}
              >
                v1
              </div>
            </div>

            <div className="col-9 col-md-10">
              <div className="mb-1">
                <span className="fs-14" style={{ color: "gray" }}>
                  Tagged by -{" "}
                </span>
                <span className="fs-14 fw-semibold">Mayank</span>
              </div>

              <div className="d-flex align-items-center gap-1 fs-14 text-muted">
                <CalendarMonthIcon fontSize="small" />
                <span>12/06/2025</span>
              </div>
            </div>
          </div>
        </div> */}

        {/* <div className="mb-2 card_div p-3 w-auto card-border-blue">
          <div className="row align-items-center">
            <div className="col-3 col-md-2">
              <div
                className="p-2 rounded"
                style={{
                  background: "#FEEED2",
                  color: "#F68E3F",
                  textAlign: "center",
                }}
              >
                v2
              </div>
            </div>

            <div className="col-9 col-md-10">
              <div className="mb-1">
                <span className="fs-14" style={{ color: "gray" }}>
                  Re-Uploaded by -{" "}
                </span>
                <span className="fs-14 fw-semibold">Harsh Rana</span>
              </div>

              <div className="d-flex align-items-center gap-1 fs-14 text-muted">
                <CalendarMonthIcon fontSize="small" />
                <span>12/06/2025</span>
              </div>
            </div>
          </div>
        </div> */}

        {/* <div className="mb-2 card_div p-3 w-auto card-border-blue">
          <div className="row align-items-center">
            <div className="col-3 col-md-2">
              <div
                className="p-2 rounded"
                style={{
                  background: "#FEEED2",
                  color: "#F68E3F",
                  textAlign: "center",
                }}
              >
                v3
              </div>
            </div>

            <div className="col-9 col-md-10">
              <div className="mb-1">
                <span className="fs-14" style={{ color: "gray" }}>
                  Uploaded by -{" "}
                </span>
                <span className="fs-14 fw-semibold">Rahul Singh</span>
              </div>

              <div className="d-flex align-items-center gap-1 fs-14 text-muted">
                <CalendarMonthIcon fontSize="small" />
                <span>12/06/2025</span>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    );
  };

  const pdfFile = () => {
    return (
      <div className="p-3 w-100">
        <ReactPDFViewer
          documentId={previewFile.documentId}
          fileName={previewFile.fileName}
        />
      </div>
    );
  };
  const userType = decryptData(localStorage.getItem("user_type"));
  
  return (
    <div>
      <RightDrawer
        width={isPdfView ? "900px" : "500px"}
        isPdfView={isPdfView}
        toggleDrawer={toggleDrawer}
        drawerHeader={drawerHeader}
        drawerBody={drawerBody}
        drawerFilePreviewHeader={drawerFilePreviewHeader}
        drawerFilePreviewBody={drawerFilePreviewBody}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        pdfFile={pdfFile}
      />
      <div className="service-tracker-inner-page-header d-lg-flex d-md-flex">
        <div className="notification-page-title">
          <div>
            <h1>Document Repository</h1>
          </div>
        </div>
        <div className="d-lg-flex d-md-flex  justify-content-end mb-3">
          <div className="pe-2 d-lg-flex d-md-flex gap-3">
            {userType === "0" && canCreate && (
              <div>
                <button
                  className="reject upload-wrapper upload-label"
                  onClick={openModal}
                >
                  <span className="icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M5 20h14v-2H5v2zm7-18l-5.5 5.5h4v6h3v-6h4L12 2z" />
                    </svg>
                  </span>
                  <span className="text">Upload File</span>
                </button>
              </div>
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
                <span className="text">Approve</span>
              </button>
            </div>
            )}
          </div>
        </div>
      </div>

      <Snackbars
        issnackbarsOpen={issnackbarsOpen}
        setIsSnackbarsOpen={setIsSnackbarsOpen}
      />
      <DeleteModal
        deleteForm={deleteModal}
        deleteTitle="Delete User"
        isModalOpen={isDeleteModalOpen}
        setIsModalOpen={setIsDeleteModalOpen}
      />
      <SmallSizeModal
        crudForm={fileUploadForm}
        crudTitle={crudTitle}
        isEditing={isEditing}
        editCrudTitle={editCrudTitle}
        isModalOpen={isFileUploadModalOpen}
        setIsModalOpen={setIsFileUploadModalModalOpen}
        closeModal={closeModal}
      />
      <div className="table_div p-3">
        <Tabs
          value={view.key}
          onChange={(_, key) => changeView(key)}
          variant="scrollable"
          scrollButtons="auto"
          className="mb-2"
        >
          {VIEWS.map((v) => (
            <Tab key={v.key} value={v.key} label={v.label} />
          ))}
        </Tabs>
        <div className="d-flex align-items-center gap-2">
          <AnimatedSearchBar
            placeholder="Search..."
            type="text"
            id="filter-text-box"
            onInput={onFilterTextBoxChanged}
          />
          <MultiSelectFilter rowData={data} onFilterApply={handleFilterApply} />
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 ms-auto"
            onClick={handleBulkDownload}
            disabled={!selectedDocs.length || !!bulkProgress}
          >
            <Download size={16} />
            {bulkProgress
              ? `Downloading ${bulkProgress.done}/${bulkProgress.total}...`
              : `Download selected${selectedDocs.length ? ` (${selectedDocs.length})` : ""}`}
          </button>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <PaginatedGrid
            key={view.key} // a new view is a new result set: start again from page 1
            ref={gridRef}
            fetchPage={fetchViewPage}
            search={search}
            rowFilter={rowFilter}
            onPageLoaded={setData}
            pageSize={20}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            // AG Grid's header checkbox isn't supported by the infinite row
            // model, so PageSelectHeader selects the current page instead;
            // getRowId keeps the selection across page changes and refreshes.
            rowSelection={{
              mode: "multiRow",
              headerCheckbox: false,
              enableClickSelection: false,
            }}
            selectionColumnDef={{ headerComponent: PageSelectHeader }}
            getRowId={(params) => String(params.data.document_id)}
            onSelectionChanged={(e) =>
              setSelectedDocs(e.api.getSelectedRows())
            }
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
