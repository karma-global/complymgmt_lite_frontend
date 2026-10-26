import { ArrowLeft, Upload } from 'lucide-react';
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ModuleRegistry, AllCommunityModule, ColumnAutoSizeModule } from 'ag-grid-community';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatedSearchBar } from '../component/AnimatedSearchBar';
import SmallSizeModal from '../component/SmallSizeModal';
import { bulkApproveAllServiceTrackerData, createTrackerRecord, fetchAllInnerPageServiceTracker, fetchAllServiceTrackerSheetData, updateServiceTrackerData, uploadTrackerFile } from '../api/service';
import Toggle from '../component/Toggle';
import Snackbars from '../component/Snackbars';
import DeleteModal from '../component/DeleteModal';
import Modal from '../component/Modal';
import SingleSelectTextField from '../component/MuiInputs/SingleSelectTextField';
import { useEntityAccess, usePageAccess } from './utils/usePageAccess';
import { Autocomplete, TextField } from '@mui/material';
import MultiSelectFilter from './dashboardDrawerGridDetailPage/MultiSelectFilter';

// Register modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Internal fields set by the backend on every record; not data the user should see or edit
const HIDDEN_TRACKER_FIELDS = ['sheet'];

// System fields the create endpoint ignores; never offered in the add-record form
const SYSTEM_TRACKER_FIELDS = ['_id', 'sheet', 'is_active', 'is_deleted', 'approval_status'];
const SYSTEM_FIELD_PREFIXES = ['created_', 'updated_', 'deleted_', 'approved_'];
const isSystemField = (key) =>
    SYSTEM_TRACKER_FIELDS.includes(key) || SYSTEM_FIELD_PREFIXES.some((prefix) => key.startsWith(prefix));

// Column names the create endpoint accepts: non-empty, no leading "$", no "."
const invalidFieldName = (key) => !key || key.startsWith('$') || key.includes('.');

// The "Sheet Upload" menu: values are what the code switches on, labels what the user sees
const UPLOAD_ACTIONS = [
    { _id: 'append', name: 'append', label: 'Upload – add rows' },
    { _id: 'replace', name: 'replace', label: 'Upload – replace sheets' },
    { _id: 'add_record', name: 'add_record', label: 'Add single record' },
];

const titleCaseSheet = (name) => String(name ?? '').replace(/\b\w/g, (c) => c.toUpperCase());

const ServiceTrackerInnerPage = () => {
    // Record edits, deletes (soft, via is_deleted), toggles and approvals are all PUTs, so the server
    // checks service_tracker "update" for them; uploads add records ("create").
    // The backend also checks the grant on this tracker (entity id = the :id in the URL), so an
    // action needs both the page permission and the tracker permission.
    const { trackerName, id } = useParams();
    const pageAccess = usePageAccess('service_tracker');
    const trackerAccess = useEntityAccess('service_tracker', id);
    const canCreate = pageAccess.canCreate && trackerAccess.canCreate;
    const canUpdate = pageAccess.canUpdate && trackerAccess.canUpdate;
    const canViewTracker = trackerAccess.loading || trackerAccess.canView;
    // Grid cell renderers are built inside async fetches, so they read the latest value from a ref
    const canUpdateRef = useRef(canUpdate);
    canUpdateRef.current = canUpdate;
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fileName, setFileName] = useState('');
    const [isEditing, setIsEditing] = useState(null);
    const [editData, setEditData] = useState(null);
    const [addData, setAddData] = useState(null);
    const [trackerId, setTrackerId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [issnackbarsOpen, setIsSnackbarsOpen] = useState({
        open: false,
        vertical: 'top',
        horizontal: 'center',
        message: '',
        severityType: '',
    });
    const [current, setCurrent] = useState({
        sheet_name: '',
        sheet_id: null,
        isFilteredData: false,
    });
    // Chosen "Sheet Upload" action ('append' | 'replace' | 'add_record'); kept apart from `current`
    // so opening or closing a modal never resets the selected sheet
    const [uploadType, setUploadType] = useState('');
    const [confirmReplace, setConfirmReplace] = useState(false);
    const [newFieldName, setNewFieldName] = useState('');
    const [addError, setAddError] = useState('');
    // // console.log(current?.sheet_name?.[0], 'sheet_name');
    const [uploadStatus, setUploadStatus] = useState("idle");
    const [serviceTrackerSheet, setServiceTrackerSheet] = useState([]);
    const [filters, setFilters] = useState({});

    const gridRef = useRef();
    const openModal = () => {
        setIsModalOpen(true);
        // setIsEditing(null);/
        setAddData(null);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditing(null);
        setEditData(null);
        setAddData(null);
        setUploadType('');
        setConfirmReplace(false);
        setFileName('');
        setAddError('');
    };

    const formattedTrackerName = trackerName.toLowerCase().replace(/\s+/g, '_');
    const navigate = useNavigate();
    const defaultColDef = {
      resizable: true,
      minWidth: 140,
        sortable: true,
        filter: true,
        // No inline editing: nothing saves cell edits; changes go through the Edit form
        editable: false,
        headerStyle: { color: '#515151', backgroundColor: '#ffffe24d' },
        flex: 1,
        filterParams: {
            maxNumConditions: 10,
        },
    };
    // Handle Delete
    const handleDelete = async (userId) => {
        try {
            const rowToDelete = rowData.find((row) => row._id === userId);
            if (!rowToDelete) {
                throw new Error("Row not found for deletion.");
            }
            const deletePayload = {
                ...rowToDelete,
                is_deleted: true,
            };
            const response = await updateServiceTrackerData(userId, formattedTrackerName, deletePayload);
            const message = response?.message || "Deleted successfully";
            const updatedData = await fetchAllInnerPageServiceTracker(formattedTrackerName, current?.sheet_name);
            setRowData(updatedData);
            setIsDeleteModalOpen(false);
            setIsSnackbarsOpen({
                open: true,
                message,
                severityType: 'success',
                vertical: 'top',
                horizontal: 'center'
            });
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete user";
            setIsSnackbarsOpen({
                open: true,
                message: errorMessage,
                severityType: 'error',
                vertical: 'top',
                horizontal: 'center'
            });
        }
    };

    // Handle Toggle
    const handleToggleChange = async (e, userId) => {
        try {
            const row = rowData.find((r) => r._id === userId);
            if (!row) throw new Error("Row not found");
            const updatedPayload = {
                ...row,
                is_active: !row.is_active,
            };
            const response = await updateServiceTrackerData(userId, formattedTrackerName, updatedPayload);
            const message = response?.message || "Status updated";
            const updatedData = await fetchAllInnerPageServiceTracker(formattedTrackerName, current?.sheet_name);
            setRowData(updatedData);
            setIsSnackbarsOpen({
                open: true,
                message,
                severityType: 'success',
                vertical: 'top',
                horizontal: 'center'
            });
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || "Update failed";
            setIsSnackbarsOpen({
                open: true,
                message: errorMessage,
                severityType: 'error',
                vertical: 'top',
                horizontal: 'center'
            });
        }
    };
    const handleFilterApply = (newFilters,) => {
        setFilters(newFilters);
    };
    const filteredRowData = useMemo(() => {
        if (Object.keys(filters).length === 0) return rowData;

        return rowData.filter((row) => {
            return Object.entries(filters).every(([column, values]) => {
                return values.includes(row[column]);
            });
        });
    }, [rowData, filters]);
    // Fetch and Set Tracker Data
    const fetchAndSetTrackerData = async (trackerName, sheetName = null) => {
        try {
            const response = await fetchAllInnerPageServiceTracker(trackerName, sheetName);
            setRowData(response || []);
            const dataSample = response?.[0] || {};
            const dynamicCols = Object.keys(dataSample).filter((key) => !HIDDEN_TRACKER_FIELDS.includes(key)).map((key) => {
                if (key === 'approval_status' && dataSample.approval_status !== undefined) {
                    return {
                        field: 'approval_status',
                        headerName: 'Approval Status',
                        editable: false,
                        headerStyle: { color: '#515151', backgroundColor: '#ffffe24d' },
                        filter: true,
                        minWidth: 160,
                        valueGetter: (params) => params.data?.approval_status,
                        cellRenderer: (params) => {
                            const getApprovalStatusText = (status) => {
                                switch (status) {
                                    case 0: return 'Pending';
                                    case 1: return 'Approved';
                                    default: return '-';
                                }
                            };
                            const status = params.value;
                            const { color } = getRoleColorForFileStatus(status ?? 0);
                            return (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={status === 1}
                                        readOnly
                                        style={{ cursor: 'default', width: 15, height: 15, accentColor: 'orange' }}
                                    />
                                    <span style={{ color, fontSize: '0.8rem', fontWeight: 500 }}>
                                        {getApprovalStatusText(status)}
                                    </span>
                                </div>
                            );
                        }
                    };
                }
                if (key === 'is_active') {
                    return {
                      flex: 0,
                      width: 120,
                      minWidth: 120,
                      maxWidth: 120,
                        headerName: 'Status',
                        field: 'is_active',
                        editable: false,
                        pinned: "right",
                        valueGetter: (params) => params.data?.is_active,
                        cellRenderer: (params) => (
                            <Toggle
                                checked={!!params.value}
                                onChange={(e) => handleToggleChange(e, params.data._id)}
                                disabled={!canUpdateRef.current}
                            />
                        )
                    };
                }
                return {
                    headerName: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    field: key,
                    minWidth: 150,
                };
            });
            const actionCol = {
              flex: 0,
              width: 130,
              minWidth: 130,
              maxWidth: 130,
                headerName: 'Actions',
                field: 'actions',
                pinned: "left",
                cellStyle: { 'background-color': 'rgb(252 229 205 / 64%)' },
                filter: false,
                editable: false,
                cellRenderer: (params) => !canUpdateRef.current ? null : (
                    <div className="d-flex gap-2">
                        <button className="btn btn-sm" onClick={() => {
                            setEditData(params.data);
                            setTrackerId(params.data._id);
                            setIsEditing(true);
                            setIsModalOpen(true);
                            setUploadType('')
                        }}>
                            <EditIcon fontSize="small" className="action_icon" />
                        </button>
                        <button className="btn btn-sm" onClick={() => {
                            setTrackerId(params.data._id);
                            setIsDeleteModalOpen(true);
                        }}>
                            <DeleteIcon fontSize="small" className="action_icon" />
                        </button>
                    </div>
                )
            };
            setColumnDefs([...dynamicCols, actionCol]);
        } catch (error) {
            // The data endpoint answers 404 when the tracker / sheet has no rows (e.g. after a replace)
            if (error?.response?.status === 404) {
                setRowData([]);
                setColumnDefs([]);
            }
            // console.error("Error fetching tracker data:", error);
        }
    };


    //    const fetchAndSetTrackerData = async (trackerName, sheetName = null) => {
    //     try {
    //         const response = await fetchAllInnerPageServiceTracker(trackerName, sheetName);
    //     
    //         setRowData(response || []);

    //         const dataSample = response?.[0];
    //          

    //         if (!dataSample || Object.keys(dataSample).length === 0) {
    //             setColumnDefs([]);
    //             return;
    //         }

    //         const dynamicCols = Object.keys(dataSample).map(key => {
    //             // Simplified columns for debug:
    //             return {
    //                 headerName: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    //                 field: key,
    //                 editable: false,
    //                 minWidth: 150,
    //             };
    //         });

    //         const actionCol = {
    //             headerName: 'Actions',
    //             field: 'actions',
    //             pinned: 'left',
    //             width: 130,
    //             cellStyle: { backgroundColor: 'rgb(252 229 205 / 64%)' },
    //             filter: false,
    //             editable: false,
    //             cellRenderer: (params) => (
    //                 <div className="d-flex gap-2">
    //                     <button className="btn btn-sm" onClick={() => {
    //                         setEditData(params.data);
    //                         setTrackerId(params.data._id);
    //                         setIsEditing(true);
    //                         setIsModalOpen(true);
    //                     }}>
    //                         <EditIcon fontSize="small" className="action_icon" />
    //                     </button>
    //                     <button className="btn btn-sm" onClick={() => {
    //                         setTrackerId(params.data._id);
    //                         setIsDeleteModalOpen(true);
    //                     }}>
    //                         <DeleteIcon fontSize="small" className="action_icon" />
    //                     </button>
    //                 </div>
    //             )
    //         };

    //         setColumnDefs([...dynamicCols, actionCol]);
    //          
    //     } catch (error) {
    //        
    //         setColumnDefs([]);
    //     }
    // };

    // Reload the sheet list and the grid; switch to `sheet` if given (e.g. a sheet a record was just
    // added to), else keep the current sheet while it still exists
    const refreshSheetsAndData = async (sheet) => {
        let sheets = serviceTrackerSheet || [];
        try {
            sheets = (await fetchAllServiceTrackerSheetData(formattedTrackerName)) || [];
            setServiceTrackerSheet(sheets);
        } catch {
            // keep the old list
        }
        const names = sheets.map((s) => s?.name);
        const target = sheet || (names.includes(current?.sheet_name) ? current?.sheet_name : names[0] || '');
        if (target !== current?.sheet_name) {
            // changing the sheet reloads the grid through the effects below
            setCurrent((prev) => ({ ...prev, sheet_name: target, isFilteredData: !!target }));
        } else {
            await fetchAndSetTrackerData(formattedTrackerName, target || null);
        }
    };

    // Empty form from the columns on screen (no _id / sheet / audit fields); the sheet starts as the
    // one selected, and new columns can be added in the form
    const handleAddSingleRecord = () => {
        setIsEditing(false);
        const keys = new Set();
        rowData.forEach((row) => Object.keys(row || {}).forEach((key) => !isSystemField(key) && keys.add(key)));
        setAddData({ sheet_name: current?.sheet_name || '', data: Object.fromEntries([...keys].map((key) => [key, ''])) });
        setNewFieldName('');
        setAddError('');
        setIsModalOpen(true);
    };

    const handleReplaceSheet = () => {
        openModal();
    };

    // Handle File Change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFileName(file || '');
        setConfirmReplace(false); // a different file needs its own confirmation
    };

    // Handle File Upload
    const handleFileUpload = async () => {
        if (!fileName) {
            alert("Please select a file.");
            return;
        }
        const mode = uploadType === 'replace' ? 'replace' : 'append';
        // A replace removes rows: ask once more before sending
        if (mode === 'replace' && !confirmReplace) {
            setConfirmReplace(true);
            return;
        }
        try {
            setUploadStatus("pending");
            setIsSnackbarsOpen({
                ...issnackbarsOpen,
                open: true,
                message: "Uploading file...",
                severityType: 'info',
            });
            const result = await uploadTrackerFile(formattedTrackerName, fileName, mode);
            setUploadStatus("success");
            const parts = [result?.message || 'Upload completed'];
            if (mode === 'replace') {
                const sheets = (result?.replaced_sheets || []).map(titleCaseSheet).join(', ');
                if (sheets) parts.push(`Replaced sheets: ${sheets}.`);
                if (result?.archived_count != null) parts.push(`${result.archived_count} old rows archived.`);
            }
            const notSaved = result?.pending_upload?.length || 0;
            if (notSaved) parts.push(`${notSaved} ${notSaved === 1 ? 'row' : 'rows'} couldn't be saved.`);
            setIsSnackbarsOpen({
                ...issnackbarsOpen,
                open: true,
                message: parts.join(' '),
                severityType: notSaved ? 'warning' : 'success',
            });
            closeModal();
            await refreshSheetsAndData();
        } catch (error) {
            setUploadStatus("error");
            setIsSnackbarsOpen({
                ...issnackbarsOpen,
                open: true,
                message: error?.response?.data?.message || "Upload failed.",
                severityType: 'error',
            });
        }

    };

    // Handle Approve All
    const handleApproveAll = async () => {
        try {
            const response = await bulkApproveAllServiceTrackerData(formattedTrackerName);
            const message = response?.message || "Status updated successfully";
            setIsSnackbarsOpen({
                ...issnackbarsOpen,
                open: true,
                message,
                severityType: 'success',
            });
            const responseData = await fetchAllInnerPageServiceTracker(formattedTrackerName, current?.sheet_name);
            setRowData(responseData || []);
            await fetchAndSetTrackerData(formattedTrackerName, current?.sheet_name);
        } catch (error) {
            setIsSnackbarsOpen({
                ...issnackbarsOpen,
                open: true,
                message: error?.response?.data?.message || "Approval failed.",
                severityType: 'error',
            });
        }
    };

    // Handle Edit Submission
    const handleEditSubmit = async () => {
        try {
            const response = await updateServiceTrackerData(trackerId, formattedTrackerName, editData);
            const message = response?.message || "Tracker updated successfully";
            const updatedData = await fetchAllInnerPageServiceTracker(formattedTrackerName, current?.sheet_name);
            setRowData(updatedData);
            setIsSnackbarsOpen({
                open: true,
                message,
                severityType: 'success',
                vertical: 'top',
                horizontal: 'center'
            });
        } catch (error) {
            setIsSnackbarsOpen({
                open: true,
                message: error?.response?.data?.message,
                severityType: 'error',
                vertical: 'top',
                horizontal: 'center'
            });
            setIsModalOpen(false);
            setIsEditing(false);
            setEditData(null);
        }
    };
    const handleAddSubmit = async () => {
        const sheet = (addData?.sheet_name || '').trim();
        if (!sheet) {
            setAddError('Sheet is required. Pick a sheet or type a new sheet name.');
            return;
        }
        // Empty inputs are sent as null; the sheet goes in sheet_name, never inside data
        const data = Object.fromEntries(
            Object.entries(addData?.data || {}).map(([key, value]) => [key.trim(), value === '' ? null : value])
        );
        try {
            const response = await createTrackerRecord(formattedTrackerName, sheet, data);
            const ignored = response?.ignored_fields?.length ? ` Ignored fields: ${response.ignored_fields.join(', ')}.` : '';
            setIsSnackbarsOpen({
                open: true,
                message: `${response?.message || 'Record added'}. It is pending approval.${ignored}`,
                severityType: 'success',
                vertical: 'top',
                horizontal: 'center',
            });

            closeModal();
            setIsEditing(false);
            setEditData(null);
            // Show the sheet the record went to (stored lower-cased)
            await refreshSheetsAndData(sheet.toLowerCase());
        } catch (error) {
            setIsSnackbarsOpen({
                open: true,
                message: error?.response?.data?.message || 'Failed to add record',
                severityType: 'error',
                vertical: 'top',
                horizontal: 'center',
            });
        }
    };

    // Handle Edit Input Change
    const handleEditChange = (e, key) => {
        setEditData({ ...editData, [key]: e.target.value });
    };
    const handleAddChange = (e, key) => {
        setAddData((prev) => ({ ...prev, data: { ...prev.data, [key]: e.target.value } }));
    };

    const addField = () => {
        const key = newFieldName.trim();
        if (invalidFieldName(key)) {
            setAddError('A field name can\'t be empty, start with "$" or contain ".".');
            return;
        }
        if (isSystemField(key) || key in (addData?.data || {})) {
            setAddError(`"${key}" is already in the form or is a system field.`);
            return;
        }
        setAddData((prev) => ({ ...prev, data: { ...prev.data, [key]: '' } }));
        setNewFieldName('');
        setAddError('');
    };

    const onFilterTextBoxChanged = useCallback(() => {
        gridRef.current.api.setGridOption(
            'quickFilterText',
            document.getElementById('filter-text-box').value
        );
    }, []);

    const deleteModal = () => (
        <div>
            <div className='delete_message p-4'>
                Are you sure you want to delete <DeleteIcon className='action_icon' /> this tracker?
            </div>
            <div className="row row-gap-2 mt-4">
                <div className='col-6'>
                    <button type="button" className="btn-sm btn btn-secondary" onClick={closeModal}>
                        <span className='button-style'>Cancel</span>
                    </button>
                </div>
                <div className='col-6 d-flex justify-content-end'>
                    <button type="submit" className="btn-sm btn btn-primary" onClick={() => handleDelete(trackerId)}>
                        Yes, I'm sure
                    </button>
                </div>
            </div>
        </div>
    );

    const fileUploadForm = () => (
        <div>
            <div className="mb-3 ps-3 pe-3 pb-3 mt-4">
                <div className="button-wrap">
                    <label className="upload_button" htmlFor="upload">
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
                {uploadType === 'replace' && (
                    <div className={`alert ${confirmReplace ? 'alert-danger' : 'alert-warning'} small mt-3 mb-0`}>
                        Rows in the sheets in this file will be replaced (the old rows are archived). Other sheets are kept.
                        {confirmReplace && <div className="fw-semibold mt-1">Click "Replace sheets" again to continue.</div>}
                    </div>
                )}
            </div>
            <div className="row row-gap-2">
                <div className="col-12 col-md-6">
                    <button type="button" className="btn btn-secondary w-100" onClick={closeModal}>Cancel</button>
                </div>
                <div className="col-12 col-md-6">
                    <button type="submit" className="btn btn-primary w-100" disabled={uploadStatus === "pending"} onClick={handleFileUpload}>
                        {uploadType === 'replace' ? 'Replace sheets' : 'Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
    const editServiceTracker = () => (
        <div className="p-3">
            <div className="mb-3">
                {editData &&
                    Object.keys(editData).map((key) => {
                        // Skip certain fields
                        if (
                            [
                                '_id',
                                'created_at',
                                'updated_at',
                                'deleted_at',
                                'deleted_by',
                                'is_deleted',
                                'is_active',
                                ...HIDDEN_TRACKER_FIELDS,
                            ].includes(key)
                        ) {
                            return null;
                        }

                        // Format label by replacing underscores and capitalizing words
                        const label = key
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, (l) => l.toUpperCase());

                        // Determine if the field should be disabled
                        const isDisabled = [
                            // 'approval_status',
                            'approval_status_by_karma',
                            'approved_by',
                            'approved_at',
                            'created_by',
                            'updated_by',
                        ].includes(key);

                        // Render select dropdown for approval_status
                        if (key === 'approval_status') {
                            return (
                                <div key={key} className="mb-3">
                                    <label className="form-label">{label}</label>
                                    <select
                                        className="form-select"
                                        value={editData[key] || ''}
                                        onChange={(e) => handleEditChange(e, key)}
                                        disabled={isDisabled}
                                    >
                                        <option value="">Select Status</option>
                                        <option value="0">Pending</option>
                                        <option value="1">Approved</option>
                                    </select>
                                </div>
                            );
                        }

                        // Render input for other fields
                        return (
                            <div key={key} className="mb-3">
                                <label className="form-label">{label}</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editData[key] || ''}
                                    onChange={(e) => handleEditChange(e, key)}
                                    disabled={isDisabled}
                                />
                            </div>
                        );
                    })}
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
                        onClick={handleEditSubmit}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );

    const getRoleColorForFileStatus = (status) => {
        switch (status) {
            case 0: return { color: 'orange' };
            case 1: return { color: 'green' };
            default: return { color: 'gray' };
        }
    };

    // previous code
    //    useEffect(() => {
    //         if (formattedTrackerName && current?.sheet_name)  {
    //             fetchAndSetTrackerData(formattedTrackerName, current.sheet_name);
    //         }
    //     }, [formattedTrackerName, current?.sheet_name]);

    // last updated code
    const hasRows = rowData.length > 0;
    useEffect(() => {
        if (!canViewTracker) return;
        if ((formattedTrackerName && current?.sheet_name) || hasRows) {
            fetchAndSetTrackerData(formattedTrackerName, current.sheet_name);
        }
    // fetchAndSetTrackerData is recreated on every render; listing it would refetch in a loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formattedTrackerName, current?.sheet_name, hasRows, canViewTracker]);



    useEffect(() => {
        if (!canViewTracker) return;
        const fetchData = async () => {
            const [serviceTrackerInnerPageData, serviceTrackerSheetResult] = await Promise.allSettled([
                fetchAllInnerPageServiceTracker(formattedTrackerName, current?.sheet_name),
                fetchAllServiceTrackerSheetData(formattedTrackerName)
            ]);

            // Set sheet data
            if (serviceTrackerSheetResult.status === 'fulfilled') {
                // The API sorts sheets and returns [] when there are none; kept defensive anyway
                const sheets = [...(serviceTrackerSheetResult.value || [])].sort((a, b) => String(a?.name).localeCompare(String(b?.name)));
                setServiceTrackerSheet(sheets);

                // If no sheet is selected yet, default to the first one
                if (!current?.sheet_name && sheets?.length > 0) {
                    const firstSheet = sheets[0];
                    setCurrent({
                        sheet_name: firstSheet.name,
                        sheet_id: firstSheet.id || null,
                        isFilteredData: true,
                    });

                    try {
                        const filterUpdateData = await fetchAllInnerPageServiceTracker(
                            formattedTrackerName,
                            firstSheet.name
                        );
                        setRowData(filterUpdateData);
                    } catch {
                        // console.error("Error fetching default sheet data:", error);
                    }

                    return; // Skip rest of the function because default sheet already handled
                }
            } else {
                // console.warn("fetchAllServiceTrackerSheet failed:", serviceTrackerSheetResult.reason);
            }

            // Fetch data only if not filtered and the sheet name is already set
            if (serviceTrackerInnerPageData.status === 'fulfilled' && current?.isFilteredData === false) {
                setRowData(serviceTrackerInnerPageData.value);
            } else if (serviceTrackerInnerPageData.status === 'rejected') {
                // console.warn("fetchAllServiceTrackerInnerPage failed:", serviceTrackerInnerPageData.reason);
            }
        };

        fetchData();
    }, [current, canViewTracker, formattedTrackerName]);

    const onFilterOpened = (params) => {
        const field = params.column.getColId();

        const rowData = [];

        params.api.forEachNode((node) => {
            if (node.data && node.data[field] !== undefined) {
                rowData.push(node.data[field]);
            }
        });

        const uniqueValues = [...new Set(rowData)];

       

        const filterComponent = document.querySelectorAll('.ag-filter')

        const filterDiv = document.createElement('div');

        filterDiv.style.padding = '10px';
        filterDiv.innerHTML = `
            <div><strong>Unique Values:</strong></div>
            <div style="max-height: 150px; overflow-y: auto;">
                ${uniqueValues.map(value => `
                    <div>
                        <label style="display:flex; align-items:center; gap:6px;">
                            <input type="checkbox" value="${value}" class="form-check-input"/>
                            <span>${value}</span>
                        </label>
                    </div>
                `).join('')}
            </div>
        `;

        filterComponent[0].appendChild(filterDiv);

        const checkboxes = filterDiv.querySelectorAll('.form-check-input');

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const checkedValues = Array.from(filterDiv.querySelectorAll('.form-check-input:checked')).map(checkbox => checkbox.value);

                const conditions = checkedValues.map(val => ({
                    filterType: 'text',
                    type: 'equals',
                    filter: val
                }));

                if (conditions.length > 0) {
                    gridRef.current.api.setFilterModel({
                        [field]: {
                            filterType: 'text',
                            operator: 'OR',
                            conditions: conditions
                        }
                    });
                } else {
                    // clear filter if nothing selected
                    gridRef.current.api.setFilterModel(null);
                }

                gridRef.current.api.onFilterChanged();

                // gridRef.current.api.setFilterModel({
                //     ...gridRef.current.api.getFilterModel(),
                //     [field]: {
                //         type: 'set',
                //         filter: checkedValues,
                //     }
                // });
                // gridRef.current.api.onFilterChanged();
            });
        });
    };
    // Add one record: sheet (required; existing or new), the visible columns, and optional new fields
    const addRecordForm = () => (
        <div className="p-3">
            <div className="mb-3">
                <Autocomplete
                    freeSolo
                    options={(serviceTrackerSheet || []).map((sheet) => sheet?.name).filter(Boolean)}
                    getOptionLabel={(option) => titleCaseSheet(option)}
                    inputValue={addData?.sheet_name || ''}
                    onInputChange={(_, value) => {
                        setAddData((prev) => ({ ...prev, sheet_name: value }));
                        setAddError('');
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Sheet"
                            required
                            size="small"
                            error={!!addError && !(addData?.sheet_name || '').trim()}
                            helperText="Pick a sheet or type a new sheet name"
                        />
                    )}
                />
            </div>

            {Object.keys(addData?.data || {}).length === 0 && (
                <div className="text-muted small mb-3">No columns yet. Add the fields this record needs below.</div>
            )}
            {Object.keys(addData?.data || {}).map((key) => (
                <div key={key} className="mb-3">
                    <label className="form-label">{key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</label>
                    <input
                        type="text"
                        className="form-control"
                        value={addData.data[key] ?? ''}
                        onChange={(e) => handleAddChange(e, key)}
                    />
                </div>
            ))}

            <div className="d-flex gap-2 mb-3">
                <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="New field name"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addField()}
                />
                <button type="button" className="btn btn-sm btn-outline-secondary text-nowrap" onClick={addField}>
                    Add field
                </button>
            </div>

            {addError && <div className="alert alert-danger py-2 small">{addError}</div>}

            <div className="row row-gap-2">
                <div className="col-12 col-md-6">
                    <button type="button" className="btn btn-secondary w-100" onClick={closeModal}>
                        Cancel
                    </button>
                </div>
                <div className="col-12 col-md-6">
                    <button type="button" className="btn btn-primary w-100" onClick={handleAddSubmit}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );

    const getCrudForm = () => {
        if (isEditing) {
            return editServiceTracker;
        }

        if (addData) {
            return addRecordForm;
        }

        if (uploadType === 'append' || uploadType === 'replace') {
            return fileUploadForm;
        }

        return null;
    };

    // No grant on this tracker: say so instead of showing an empty grid (the data calls would 403)
    if (!canViewTracker) {
        return (
            <div className="p-3">
                <div className="alert alert-warning mt-3">You don't have access to this tracker.</div>
            </div>
        );
    }

    return (
        <div>
            <Snackbars issnackbarsOpen={issnackbarsOpen} setIsSnackbarsOpen={setIsSnackbarsOpen} uploadStatus={uploadStatus} />
            <DeleteModal deleteForm={deleteModal} deleteTitle='Delete Tracker' isModalOpen={isDeleteModalOpen} setIsModalOpen={setIsDeleteModalOpen} />
            <SmallSizeModal
                crudForm={getCrudForm()}
                crudTitle={
                    isEditing
                        ? 'Edit Tracker'
                        : addData
                            ? 'Add Record'
                            : uploadType === 'replace'
                                ? 'Upload – replace sheets'
                                : 'Upload – add rows'
                }
                isEditing={isEditing}
                editCrudTitle="Edit Tracker"
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                closeModal={closeModal}
            />

            <div className='service-tracker-inner-page-header d-lg-flex d-md-flex align-items-center'>
                <div className="notification-page-title">
                    <button
                        className="back-button"
                        onClick={() => navigate("/service_trackers")}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1>{trackerName}</h1>
                    </div>
                </div>
                <div className='d-lg-flex d-md-flex gap-2 mt-2'>
                    {canCreate && (
                    <div style={{ width: '250px' }}>
                        <SingleSelectTextField
                            name="sheet_upload_type"
                            label="Sheet Upload"
                            value={uploadType}
                            onChange={(e) => {
                                const action = e.target.value;
                                setUploadType(action);
                                setConfirmReplace(false);
                                if (action === 'append' || action === 'replace') handleReplaceSheet();
                                if (action === 'add_record') handleAddSingleRecord();
                            }}
                            names={UPLOAD_ACTIONS}
                        />

                    </div>
                    )}
                    {/* <button
                        className="w-100 mb-2 justify-content-center reject upload-wrapper upload-label mt-lg-2 mt-md-2"
                        onClick={() => {
                            setIsEditing(false);

                            // editData se keys le kar empty object banana
                            if (rowData.length > 0) {
                                const emptyObj = {};
                                Object.keys(rowData[0]).forEach((key) => {
                                    emptyObj[key] = '';
                                });
                                setAddData(emptyObj);
                            }

                            setIsModalOpen(true);
                        }}
                    >
                        <span className="text" style={{ whiteSpace: 'nowrap' }}>Add Record</span>
                    </button> */}

                    {/* <button className="w-100 mb-2 justify-content-center reject upload-wrapper upload-label" onClick={openModal}>
                        <Upload size={20} />
                        <span className="text">Upload</span>
                    </button> */}
                    {canUpdate && (
                    <div className='btn-wrap-div mt-lg-2 mt-md-2'>
                        <button className="button approve w-100 justify-content-center" onClick={handleApproveAll}>
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
            <div className="client-onboarding-2">
                <div className="table_div p-3">
                    <div className='d-lg-flex d-md-flex  justify-content-between'>
                        <div className='d-flex'>
                            <AnimatedSearchBar placeholder="Search..." type="text" id="filter-text-box" onInput={onFilterTextBoxChanged} />
                            <div className='ps-3 mt-1'>
                                <MultiSelectFilter
                                    rowData={rowData}
                                    filterColumns={rowData.length > 0 ? Object.keys(rowData[0]).filter((key) => !HIDDEN_TRACKER_FIELDS.includes(key)) : []}
                                    onFilterApply={handleFilterApply}
                                />
                            </div>

                        </div>

                        {/* With one sheet there is nothing to pick, but that sheet is still passed when fetching */}
                        {serviceTrackerSheet?.length > 1 && (
                        <div style={{ width: '250px' }}>
                            <SingleSelectTextField
                                name="sheet_name"
                                label="Sheet Name"
                                value={current?.sheet_name || ''}
                                onChange={async (e) => {
                                    const selectedName = e.target.value;
                                    setCurrent((prev) => ({
                                        ...prev,
                                        sheet_name: selectedName,
                                        isFilteredData: !!selectedName,
                                    }));

                                    try {
                                        // Call fetchAndSetTrackerData with selectedName filter
                                        await fetchAndSetTrackerData(formattedTrackerName, selectedName || null);
                                    } catch {
                                        // console.error("Error fetching service tracker data:", error);
                                    }
                                }}
                                names={
                                    serviceTrackerSheet?.map((data) => ({
                                        _id: data?.name,
                                        name: data?.name,
                                        label: titleCaseSheet(data?.name), // names come back lower-cased
                                    })) || []
                                }
                            />
                        </div>
                        )}

                    </div>
                    <div className="ag-theme-quartz" style={{ height: '600px', width: '100%', marginTop: '1rem' }}>
                        <AgGridReact
                            theme="legacy"
                            ref={gridRef}
                            rowData={filteredRowData || []}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            rowSelection="single"
                            pagination={true}
                            onFilterOpened={onFilterOpened}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceTrackerInnerPage;