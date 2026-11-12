import API from "./axios";
import {
  CREATE_COMPANY,
  DELETE_COMPANY_BY_ID,
  GET_ALL_COMPANY,
  GET_GROUP_HOLDING_BY_NAME,
  UPDATE_COMPANY_BY_ID,
  GET_ALL_LOCATION,
  CREATE_LOCATION,
  UPDATE_LOCATION_BY_ID,
  DELETE_LOCATION_BY_ID,
  GET_ALL_COMPANY_NAME,
  GET_ALL_GROUP,
  CREATE_GROUP,
  UPDATE_GROUP,
  DELETE_GROUP,
  GET_ALL_USER,
  DELETE_USER_BY_ID,
  GET_ALL_ROLE_NAME,
  CREATE_USER,
  GET_LOCATION_NAME,
  GET_COMPANY_BY_GROUP_HOLDING_ID,
  GET_ALL_MODULE,
  UPDATE_GROUP_STATUS,
  UPDATE_COMPANY_STATUS_BY_ID,
  UPDATE_LOCATION_STATUS_BY_ID,
  LOGIN_API,
  GET_COMPANY_NAME_BY_GROUP_ID,
  CREATE_MODELE,
  UPDATE_MODULE_STATUS_BY_ID,
  UPDATE_MODULE_BY_ID,
  DELETE_MODULE_BY_ID,
  GET_ALL_SUB_MODULE,
  CREATE_SUB_MODULE,
  UPDATE_SUB_MODULE_STATUS_BY_ID,
  VIEW_MODULE_NAME,
  DELETE_SUB_MODULE_BY_ID,
  UPDATE_SUB_MODULE_BY_ID,
  GET_ALL_SERVICE_TRACKER,
  GET_LOCATION_BY_COMPANY_ID,
  UPDATE_USER_BY_ID,
  UPDATE_USER_STATUS_BY_ID,
  GET_ALL_ROLE,
  DELETE_ROLE_BY_ID,
  CREATE_ROLE,
  UPDATE_ROLE_BY_ID,
  UPDATE_ROLE_STATUS_BY_ID,
  VIEW_LOCATION_TO_MODULE_ID,
  CREATE_LOCATION_TO_MODULE,
  UPDATE_LOCATION_TO_MODULE_BY_ID,
  GET_ALL_LOCATION_TO_MODULE,
  UPDATE_LOCATION_TO_MODULE_STATUS_BY_ID,
  DELETE_LOCATION_TO_MODULE_BY_ID,
  GET_SUB_MODULE_NAME_BY_MODULE_ID,
  AUTO_FILE_UPLOAD_PYTHON,
  DELETE_SERVICE_TRACKER_BY_ID,
  UPDATE_SERVICE_TRACKER,
  CREATE_SERVICE_TRACKER,
  UPDATE_SERVICE_TRACKER_BY_STATUS_ID,
  GET_USER_ACCESS_LEVEL_BY_USER_ID,
  CREATE_USER_ACCESS_LEVEL,
  UPDATE_USER_ACCESS_LEVEL,
  DELETE_USER_ACCESS_LEVEL,
  GET_ALL_INNER_PAGE_SERVICE_TRACKER,
  GET_ALL_SERVICE_TRACKER_NAME,
  GET_ALL_SERVICE_TRACKER_FIELDS,
  CREATE_SERVICE_TRACKER_SPECIFICS,
  GET_ALL_ACCESS_TYPES,
  TOGGLE_USER_ACCESS_LEVEL_STATUS,
  GET_ALL_PAGE,
  GET_USER_ACCESS_BY_ID,
  UPDATE_SERVICE_TRACKER_DATA,
  BULK_APPROVE_ALL_SERVICE_TRACKER_DATA,
  APPROVE_ALL_BY_ENTITY_TYPE,
  GET_ALL_SERVICE_TRACKER_SHEET_DATA,
  UPDATE_USER_APPROVAL_STATUS_BY_ID,
  UPDATE_GROUP_APPROVAL_STATUS_BY_ID,
  UPDATE_COMPANY_APPROVAL_STATUS_BY_ID,
  UPDATE_COMPANY_LOCATION_APPROVAL_STATUS_BY_ID,
  UPDATE_MODULE_APPROVAL_STATUS_BY_ID,
  UPDATE_LOCATION_TO_MODULES_APPROVAL_STATUS_BY_ID,
  UPDATE_APPROVAL_STATUS_SUBMODULES_BY_ID,
  APPROVE_USER_ACCESS,
  UPDATE_SERVICE_TRACKER_APPROVAL_STATUS_BY_ID,
  AUTO_FILE_UPLOAD_GOLANG,
  GET_ALL_FILES,
  DELETE_FILE_ID,
  UPDATE_FILE,
  GET_ALL_NOTIFICATION_TEMPLATE,
  CREATE_NOTIFICATION_TEMPLATE,
  UPDATE_NOTIFICATION_TEMPLATE,
  DELETE_NOTIFICATION_TEMPLATE_BY_ID,
  UPDATE_NOTIFICATION_TEMPLATE_APPROVAL_STATUS_BY_ID,
  CREATE_NOTIFICATION,
  GET_ALL_NOTIFICATION,
  DELETE_NOTIFICATION_BY_ID,
  UPDATE_NOTIFICATION_BY_ID,
  UPDATE_NOTIFICATION_APPROVAL_STATUS_BY_ID,
  UPDATE_NOTIFICATION_STATUS_BY_ID,
  UPLOAD_BULK_NOTIFICATION,
  GET_SERVICE_TRACKER_BY_SUBMODULE_ID,
  GET_SERVICE_TRACKER_BY_MODULE_ID,
  GET_DOCUMENT_DROPDOWNS_TYPES,
  GET_DOCUMENT_DROPDOWNS_STAGE,
  CHANGE_PASSWORD_AFTER_LOGIN,
  GET_INAPP_NOTIFICATION,
  READ_INAPP_NOTIFICATION,
  DELETE_INAPP_NOTIFICATION,
  DELETE_ALL_INAPP_NOTIFICATION,
  READ_ALL_INAPP_NOTIFICATION,
  GET_GENERAL_COMPLIANCE_PORTFOLIO,
  GET_CLIENT_ONBOARDING_PORTFOLIO,
  CHANGE_TEMPORARY_PASSWORD_STATUS,
  FORGET_PASSWORD,
  GET_INVESTMENT_DECLARATION_STATUS_BY_COMPANY,
  GET_DISTRIBUTION_OF_EMPLOYEE_ACROSS_MULTIPLE_ENTITIES_OR_LOCATIONS,
  GET_GENERAL_COMPLIANCE_BY_COMPANY,
  GET_CLIENT_ONBOARDING_BY_COMPANY,
  GET_TYPE_OF_SYSTEMS_USED_BY_EMPLOYER,
  GET_TOTAL_EMPLOYEE_COUNT,
  GET_PAYROLLS_CLOSED_ON_OR_AHEAD_OF_SLA_PERCENTAGE,
  GET_AVERAGE_DELAY_BETWEEN_DATA_REQUEST_DATE_AND_CLIENT_DATA_RECEIVED_DATE,
  GET_EXPLANATION_OF_EMPLOYEE_COUNT,
  GET_TOTAL_COUNT_OF_COMMUNICATION_TYPES,
  GET_HELPDESK_TICKETS_RAISED_BY_COMPANY,
  GET_HELPDESK_STATUS_BASED_ON_ISSUE_SUB_TYPE,
  GET_TICKETS_DISTRIBUTION_ASSIGNED_TO_COUNT,
  GET_AUDIT_PLATFORMS_COUNT_BY_STATE_SEGMENTED,
  GET_AUDIT_BY_SERVICE_TYPE,
  // GET_AUDIT_VISIT_FINDINGS_BY_SEVERITY,
  GET_ESCALATION_TRIGGERED_RATE_BY_STATE,
  GET_COUNT_OF_AUDIT_STATUS,
  GET_RISK_LEVEL_BASED_ON_SERVICE_TYPE,
  GET_AUDIT_MEETING_SLA_BY_RESPONSIBLE_TEAM,
  GET_CHECKLIST_APPROVAL_BY_COMPANY_NAME,
  GET_COUNT_OF_RISK_LEVEL,
  GET_AUTHORITY_DISTRIBUTION_COUNT,
  GET_STATE_WISE_NOTICE_COUNT,
  GET_TYPES_OF_NOTICE_OR_INSPECTION,
  GET_ANALYSIS_OF_APPLICABLE_ACT,
  GET_NOTICES_ASSIGNED_TO,
  GET_COUNT_OF_ACKNOWLEDGMENT_RATES,
  GET_COUNT_OF_CLIENT_DOC_SUBMISSION,
  GET_DISTRIBUTION_OF_RESPONSE_STATUS,
  GET_STATUS_COUNT_OF_OPEN_VS_CLOSED_CASES,
  GET_ASSIGNED_INDIVIDUALS_LIST,
  GET_DOCUMENTS_PENDING_FROM,
  GET_ISSUE_CATEGORY_BY_STATUS,
  GET_CHALLAN_FILTERS,
  GET_CHALLAN_SUMMARY,
  GET_CHALLAN_TREND,
  GET_CHALLAN_COMPANY_WISE,
  GET_CHALLAN_ACT_WISE,
  GET_CHALLAN_LOCATION_WISE,
  GET_CHALLAN_TURNAROUND,
  GET_CHALLAN_EXCEPTIONS,
  GET_CHALLAN_RECORDS,
  GET_CHALLAN_RECORD_BY_ID,
  GET_REGISTER_DASH_FILTERS,
  GET_REGISTER_DASH_SUMMARY,
  GET_REGISTER_DASH_COMPANY_WISE,
  GET_REGISTER_DASH_TREND,
  GET_REGISTER_DASH_REGISTER_WISE,
  GET_REGISTER_DASH_ACT_WISE,
  GET_REGISTER_DASH_LOCATION_WISE,
  GET_REGISTER_DASH_TURNAROUND,
  GET_REGISTER_DASH_VARIANCE,
  GET_REGISTER_DASH_EXCEPTIONS,
  GET_REGISTER_DASH_COVERAGE,
  GET_REGISTER_DASH_RECORDS,
  GET_REGISTER_DASH_RECORD_BY_ID,
  GET_RETURNS_DASH_FILTERS,
  GET_RETURNS_DASH_SUMMARY,
  GET_RETURNS_DASH_COMPANY_WISE,
  GET_RETURNS_DASH_TREND,
  GET_RETURNS_DASH_PERIOD_WISE,
  GET_RETURNS_DASH_RETURN_WISE,
  GET_RETURNS_DASH_ACT_WISE,
  GET_RETURNS_DASH_LOCATION_WISE,
  GET_RETURNS_DASH_TURNAROUND,
  GET_RETURNS_DASH_EXCEPTIONS,
  GET_RETURNS_DASH_COVERAGE,
  GET_RETURNS_DASH_RECORDS,
  GET_RETURNS_DASH_RECORD_BY_ID,
  GET_LICENSE_DASH_FILTERS,
  GET_LICENSE_DASH_SUMMARY,
  GET_LICENSE_DASH_COMPANY_WISE,
  GET_LICENSE_DASH_BREAKDOWN,
  GET_LICENSE_DASH_LOCATION_WISE,
  GET_LICENSE_DASH_EXPIRY_TIMELINE,
  GET_LICENSE_DASH_TREND,
  GET_LICENSE_DASH_TURNAROUND,
  GET_LICENSE_DASH_EXCEPTIONS,
  GET_LICENSE_DASH_RECORDS,
  GET_LICENSE_DASH_RECORD_BY_ID,
  GET_COCKPIT_FILTERS,
  GET_COCKPIT_SUMMARY,
  GET_COCKPIT_COMPANY_WISE,
  GET_COCKPIT_STATE_WISE,
  GET_COCKPIT_CLIENTS,
  GET_CASES_PENDING_FOR_SELECTED_ISSUE_SUBTYPES,
  GET_TOTAL_DELAY_FLAGS_BY_CLIENT_AND_GOVT,
  GET_TOTAL_DELAY_FLAGS_BY_GOVT,
  GET_ALL_WIDGET_MAPPINGS,
  CREATE_OR_UPDATE_WIDGET_MAPPING,
  DELETE_WIDGET_MAPPING_BY_ID,
  GET_WIDGETS_BY_USER_ID,
  UPLOAD_TRACKER_DATA,
  CREATE_TRACKER_RECORD,
  GET_DASHBOARD_COMPANIES,
  COMPANY_WISE_ACCESS,
  GET_ALL_REGISTER_NAMES,
  GET_REGISTER_MAPPING,
  PROCESS_REGISTERS,
  GET_FILE_BY_TYPE,
  DOWNLOAD_FILE,
  DOCUMENT_WISE_ACCESS,
  CREATE_REGISTER,
  CREATE_APPLICABILITY,
  CREATE_MAPPING,
  PROCESS_REGISTER,
  GET_APPLICABILITY_BY_LOCATION_ID,
  GET_APPLICABILITY_BY_COMPANY_ID,
  GET_APPLICABILITY_BY_GROUP_ID,
  UPDATE_APPLICABILITY_BY_ID,
  DELETE_APPLICABILITY_BY_ID,
  GET_REGISTER_APPLICABILITY_BY_ID,
  GET_PIPELINE_BY_APPLICABILITY_ID,
  DELETE_MAPPING_BY_ID,
  UPDATE_MAPPING_BY_ID,
  GENERATE_AI_MAPPING_SUCCESS,
  CREATE_ENTITY,
  GET_MULTIPLE_ENTITIES,
  UPDATE_APPROVAL_STATUS,
  DELETE_ENTITY,
  UPDATE_ENTITY,
  GET_ENTITIES_BY_COMPANY_ID,
  GET_ALL_COMPANY_LOCATION_BY_ENTITY_ID,
  GET_FILE_NAMES_BY_ACCESS_TYPE,
  CREATE_GROUPWISE_ACCESS_BY_GROUP_ID,
  ENTITY_WISE_ACCESS,
  LOCATION_WISE_ACCESS,
  UPDATE_DOCUMENT_APPROVAL_STATUS_BY_ID,
  CLIENT_ONBOARDING_TEMPLATE,
  CLIENT_ONBOARDING_UPLOAD,
  DOCUMENT_BULK_TAGGING_TEMPLATE,
  DOCUMENT_BULK_TAGGING_UPLOAD,


} from "./Endpoint";

// Login Api
export const loginApi = async (loginPayload) => {
  const response = await API.post(LOGIN_API, loginPayload);
  return response.data;
}

// Company Api
// Companies for the dashboard filter, limited to the user's own (no company page grant needed)
export const fetchDashboardCompanies = async () => {
  const response = await API.get(GET_DASHBOARD_COMPANIES);
  return response.data;
};

export const fetchAllCompanies = async () => {
  const response = await API.get(GET_ALL_COMPANY);
  return response.data;
};

export const fetchAllCompaniesName = async () => {
  const response = await API.get(GET_ALL_COMPANY_NAME);
  return response.data;
};

export const fetchCompaniesNameByGroupId = async (id) => {
  const response = await API.get(`${GET_COMPANY_NAME_BY_GROUP_ID}${id}`);
  return response.data;
};

export const createCompany = async (companyData) => {
  const response = await API.post(CREATE_COMPANY, companyData);
  return response.data;
}

export const updateCompanyById = async (id, companyData) => {
  const response = await API.put(`${UPDATE_COMPANY_BY_ID}${id}`, companyData);
  return response.data;
};

export const updateCompanyStatusById = async (id, companyData) => {
  const response = await API.put(`${UPDATE_COMPANY_STATUS_BY_ID}${id}`, companyData);
  return response.data;
};

export const deleteCompanyById = async (id) => {
  const response = await API.delete(`${DELETE_COMPANY_BY_ID}${id}`);
  return response.data;
};

export const getCompanyByGroupId = async (id) => {
  const response = await API.get(`${GET_COMPANY_BY_GROUP_HOLDING_ID}${id}`);
  return response.data;
};

export const updateCompanyApprovalStatusById = async (id) => {
  const response = await API.put(`${UPDATE_COMPANY_APPROVAL_STATUS_BY_ID}${id}`);
  return response.data;
};

// Group Holding Api
export const fetchAllGroupHolding = async () => {
  const response = await API.get(GET_GROUP_HOLDING_BY_NAME);
  return response.data;
};
export const updateGroupStatusById = async (id, groupData) => {
  const response = await API.put(`${UPDATE_GROUP_STATUS}${id}`, groupData);
  return response.data;
};


// lOCATION API

export const fetchAllLocation = async () => {
  const response = await API.get(GET_ALL_LOCATION);
  return response.data;
};

export const fetchAllLocationName = async () => {
  const response = await API.get(GET_LOCATION_NAME);
  return response.data;
};

export const createLocation = async (locationData) => {
  const response = await API.post(CREATE_LOCATION, locationData);
  return response.data;
}

export const updateLocationById = async (id, locationData) => {
  const response = await API.put(`${UPDATE_LOCATION_BY_ID}${id}`, locationData);
  return response.data;
};

export const updateLocationStatusById = async (id, locationData) => {
  const response = await API.put(`${UPDATE_LOCATION_STATUS_BY_ID}${id}`, locationData);
  return response.data;
};

export const deleteLocationById = async (id) => {
  const response = await API.delete(`${DELETE_LOCATION_BY_ID}${id}`);
  return response.data;
};

export const getLocationByCompanyId = async (id) => {
  const response = await API.get(`${GET_LOCATION_BY_COMPANY_ID}${id}`);
  return response.data;
};

export const updateCompanyLocationApprovalStatusById = async (id) => {
  const response = await API.put(`${UPDATE_COMPANY_LOCATION_APPROVAL_STATUS_BY_ID}${id}`);
  return response.data;
};

// Group Holding
export const fetchAllGroup = async () => {
  const response = await API.get(GET_ALL_GROUP);
  return response.data;
};

export const createGroup = async (groupData) => {
  const response = await API.post(CREATE_GROUP, groupData);
  return response.data;
}

export const updateGroupById = async (id, groupData) => {
  const response = await API.put(`${UPDATE_GROUP}${id}`, groupData);
  return response.data;
};

export const deleteGroupById = async (id) => {
  const response = await API.delete(`${DELETE_GROUP}${id}`);
  return response.data;
};

export const updateGroupApprovalStatusById = async (id) => {
  const response = await API.put(`${UPDATE_GROUP_APPROVAL_STATUS_BY_ID}${id}`);
  return response.data;
};


// user API
export const fetchAllUser = async () => {
  const response = await API.get(GET_ALL_USER);
  return response.data;
};
export const fetchAllUserName = async () => {
  const response = await API.get(GET_ALL_ROLE_NAME);
  return response.data;
};
export const deleteUserById = async (id) => {
  const response = await API.delete(`${DELETE_USER_BY_ID}${id}`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await API.post(CREATE_USER, userData);
  return response.data;
}

export const updateUserById = async (id, userData) => {
  const response = await API.put(`${UPDATE_USER_BY_ID}${id}`, userData);
  return response.data;
};
export const updateUserStatusId = async (id, userData) => {
  const response = await API.put(`${UPDATE_USER_STATUS_BY_ID}${id}`, userData);
  return response.data;
};

export const updateUserApprovalStatusById = async (id) => {
  const response = await API.put(`${UPDATE_USER_APPROVAL_STATUS_BY_ID}${id}`);
  return response.data;
};

// user role API
export const fetchAllRole = async () => {
  const response = await API.get(GET_ALL_ROLE);
  return response.data;
};
export const fetchAllRoleName = async () => {
  const response = await API.get(GET_ALL_ROLE_NAME);
  return response.data;
};
export const deleteRoleById = async (id) => {
  const response = await API.delete(`${DELETE_ROLE_BY_ID}${id}`);
  return response.data;
};

export const createRole = async (userRoleData) => {
  const response = await API.post(CREATE_ROLE, userRoleData);
  return response.data;
}

export const updateRoleById = async (id, userRoleData) => {
  const response = await API.put(`${UPDATE_ROLE_BY_ID}${id}`, userRoleData);
  return response.data;
};
export const updateRoleStatusId = async (id, userRoleData) => {
  const response = await API.put(`${UPDATE_ROLE_STATUS_BY_ID}${id}`, userRoleData);
  return response.data;
};


// Modules
export const fetchAllModule = async () => {
  const response = await API.get(GET_ALL_MODULE);
  return response.data;
};
export const fetchAllModulesName = async () => {
  const response = await API.get(VIEW_MODULE_NAME);
  return response.data;
};
export const fetchAllModulesNameByLocationId = async (id) => {
  const response = await API.get(`${VIEW_LOCATION_TO_MODULE_ID}${id}`);
  return response.data;
};
export const createModule = async (modulePayload) => {
  const response = await API.post(CREATE_MODELE, modulePayload);
  return response.data;
}

export const updateModuleStatusById = async (id, moduleStatus) => {
  const response = await API.put(`${UPDATE_MODULE_STATUS_BY_ID}${id}`, moduleStatus);
  return response.data;
};
export const updateModuleById = async (id, moduleData) => {
  const response = await API.put(`${UPDATE_MODULE_BY_ID}${id}`, moduleData);
  return response.data;
};
export const deleteModuleById = async (id, moduleData) => {
  const response = await API.delete(`${DELETE_MODULE_BY_ID}${id}`, moduleData);
  return response.data;
};

export const updateModuleApprovalStatusById = async (id) => {
  const response = await API.put(`${UPDATE_MODULE_APPROVAL_STATUS_BY_ID}${id}`);
  return response.data;
}

// Sub-Module

export const fetchAllSubModule = async () => {
  const response = await API.get(GET_ALL_SUB_MODULE);
  return response.data;
};
export const fetchAllSubModuleNameByModuleId = async (id) => {
  const response = await API.get(`${GET_SUB_MODULE_NAME_BY_MODULE_ID}${id}`);
  return response.data;
};

export const createsSubModule = async (subModulePayload) => {
  const response = await API.post(CREATE_SUB_MODULE, subModulePayload);
  return response.data;
}
export const updateSubModuleById = async (id, subModuleUpdate) => {
  const response = await API.put(`${UPDATE_SUB_MODULE_BY_ID}${id}`, subModuleUpdate);
  return response.data;
};
export const updateSubModuleStatusById = async (id, subModuleStatus) => {
  const response = await API.put(`${UPDATE_SUB_MODULE_STATUS_BY_ID}${id}`, subModuleStatus);
  return response.data;
};
export const deleteSubModuleById = async (id) => {
  const response = await API.delete(`${DELETE_SUB_MODULE_BY_ID}${id}`);
  return response.data;
};

export const updateSubModuleApprovalStatusById = async (id) => {
  const response = await API.put(`${UPDATE_APPROVAL_STATUS_SUBMODULES_BY_ID}${id}`);
  return response.data;
}

// Service Tracker
export const fetchAllServiceTracker = async () => {
  const response = await API.get(GET_ALL_SERVICE_TRACKER);
  return response.data;
};
export const fetchAllServiceTrackerFields = async (tracker_name) => {
  const response = await API.get(`${GET_ALL_SERVICE_TRACKER_FIELDS}${encodeURIComponent(tracker_name)}/fields`);
  return response.data;
};
export const fetchAllInnerPageServiceTracker = async (trackerName, sheetName) => {
  // No sheet (old single-sheet data, or "all sheets") means no param at all, not ?sheet=null
  const url = `${GET_ALL_INNER_PAGE_SERVICE_TRACKER}/${encodeURIComponent(trackerName)}/data`;
  const response = await API.get(url, { params: { sheet: sheetName || undefined } });
  return response.data;
};

// mode "append" adds the file's rows; "replace" archives and replaces only the rows of the
// sheets in the file (other sheets are kept). The uploader comes from the token.
export const uploadTrackerFile = async (trackerName, file, mode) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await API.post(
    `${UPLOAD_TRACKER_DATA}/${encodeURIComponent(trackerName)}/upload`,
    formData,
    { params: { mode }, headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

// One new row: sheetName is required (stored lower-cased, may be new); data maps column -> value
export const createTrackerRecord = async (trackerName, sheetName, data) => {
  const response = await API.post(
    `${CREATE_TRACKER_RECORD}/${encodeURIComponent(trackerName)}/data`,
    { sheet_name: sheetName, data }
  );
  return response.data;
};
export const fetchAllServiceTrackerName = async () => {
  const response = await API.get(GET_ALL_SERVICE_TRACKER_NAME);
  return response.data;
};

export const deleteServiceTrackerById = async (id, payload) => {
  const response = await API.delete(`${DELETE_SERVICE_TRACKER_BY_ID}${id}`, payload);
  return response.data;
};
export const updateServiceTrackerById = async (id, payload) => {
  const response = await API.put(`${UPDATE_SERVICE_TRACKER}${id}`, payload);
  return response.data;
};
export const updateServiceTrackerData = async (id, tracker_name, payload) => {
  const response = await API.put(`${UPDATE_SERVICE_TRACKER_DATA}${tracker_name}/data/${id}`, payload);
  return response.data;
};

export const bulkApproveAllServiceTrackerData = async (tracker_name, payload) => {
  const response = await API.put(`${BULK_APPROVE_ALL_SERVICE_TRACKER_DATA}${tracker_name}/data/`, payload);
  return response.data;
};

export const createServiceTracker = async (payload) => {
  const response = await API.post(`${CREATE_SERVICE_TRACKER}`, payload);
  return response.data;
};

export const createServiceTrackerSpecifics = async (payload) => {
  const response = await API.post(`${CREATE_SERVICE_TRACKER_SPECIFICS}`, payload);
  return response.data;
};

export const updateServiceTrackerByStatusId = async (id, payload) => {
  const response = await API.put(`${UPDATE_SERVICE_TRACKER_BY_STATUS_ID}${id}`, payload);
  return response.data;
};

export const fetchAllServiceTrackerSheetData = async (trackerName) => {
  // const response = await API.get(GET_ALL_SERVICE_TRACKER_SHEET_DATA);
  const url = `${GET_ALL_SERVICE_TRACKER_SHEET_DATA}/${encodeURIComponent(trackerName)}/sheets`;
  const response = await API.get(url);
  return response.data;
};

export const updateServiceTrackerApprovalStatusById = async (id) => {
  const response = await API.put(`${UPDATE_SERVICE_TRACKER_APPROVAL_STATUS_BY_ID}${id}`);
  return response.data;
};

export const fetchServiceTrackerBySubModuleId = async (id) => {
  const response = await API.get(`${GET_SERVICE_TRACKER_BY_SUBMODULE_ID}${id}`);
  return response.data;
};


export const fetchServiceTrackerByModuleId = async (moduleId) => {
  const response = await API.get(
    `${GET_SERVICE_TRACKER_BY_MODULE_ID}${moduleId}`
  );
  return response.data;
};
// location To Module

export const fetchLocationToModuleModule = async () => {
  const response = await API.get(GET_ALL_LOCATION_TO_MODULE);
  return response.data;
};

export const createsLocationToModule = async (payload) => {
  const response = await API.post(CREATE_LOCATION_TO_MODULE, payload);
  return response.data;
}

export const updateLocationToModuleById = async (id, payload) => {
  const response = await API.put(`${UPDATE_LOCATION_TO_MODULE_BY_ID}${id}`, payload);
  return response.data;
};
export const updateLocationToModuleByStatusId = async (id, status) => {
  const response = await API.put(`${UPDATE_LOCATION_TO_MODULE_STATUS_BY_ID}${id}`, status);
  return response.data;
};
export const deleteLocationToModuleByStatusId = async (id, payload) => {
  const response = await API.delete(`${DELETE_LOCATION_TO_MODULE_BY_ID}${id}`, payload);
  return response.data;
};

export const updateLocationToModulesApprovalStatusById = async (id) => {
  const response = await API.put(`${UPDATE_LOCATION_TO_MODULES_APPROVAL_STATUS_BY_ID}${id}`);
  return response.data;
};

// File upload python code
export const uploadFile = async (filesArray) => {
  const formData = new FormData();

  filesArray.forEach((file) => {
    formData.append("files", file);
  });

  const response = await API.post(AUTO_FILE_UPLOAD_PYTHON, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};


// File upload Golang without python
export const uploadFileGolang = async (filesArray, isAutoUpload) => {
  const formData = new FormData();

  filesArray.forEach((file) => {
    formData.append("files", file);
  });
  // formData.append("is_ai_upload", isAutoUpload);
  const response = await API.post(`${AUTO_FILE_UPLOAD_GOLANG}?is_ai_upload=${isAutoUpload}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// File upload Golang uncomment when you upload auto file whith python code
// export const uploadFileGolang = async ({ files, previousResponse }) => {
//   try {
//     const formData = new FormData();

//     // Append files to FormData
//     files?.forEach((file) => {
//       formData?.append("files", file);
//     });

//     // Append the previous API response as a JSON string
//     formData?.append("previousResponse", JSON.stringify(previousResponse));

//     const response = await API.post(AUTO_FILE_UPLOAD_GOLANG, formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     return response.data;
//   } catch (error) {
//     // console.error("Upload failed:", error.response?.data || error);
//     throw error;
//   }
// };

export const deleteFileById = async (id) => {
  const response = await API.delete(`${DELETE_FILE_ID}${id}`);
  return response.data;
};
// filters: extra query params, e.g. { tagged: "false" } or { approval_status: 0 }
export const fetchAllFiles = async (page, limit, search, filters = {}) => {
  const response = await API.get(GET_ALL_FILES, {
    // axios leaves out params that are undefined
    params: { page, limit, search: search?.trim() || undefined, ...filters },
  });
  // The record count comes back in the X-Total-Count header, not in the body
  const total = Number(response.headers?.["x-total-count"]);
  const rows = Array.isArray(response.data)
    ? response.data
    : response.data?.data || [];
  return { data: rows, total: Number.isNaN(total) ? undefined : total };
};
export const updateFileById = async (id, fileData) => {
  const response = await API.put(`${UPDATE_FILE}${id}`, fileData);
  return response.data;
};

export const fetchDocumentDropdownTypes = async (service_tracker_name) => {
  const response = await API.get(`${GET_DOCUMENT_DROPDOWNS_TYPES}${service_tracker_name}`);
  return response.data;
};
export const fetchDocumentDropdownStages = async (service_tracker_name) => {
  const response = await API.get(`${GET_DOCUMENT_DROPDOWNS_STAGE}${service_tracker_name}`);
  return response.data;
};

export const downloadFile = async (fileId) => {
  const response = await API.get(`${DOWNLOAD_FILE}${fileId}`, {
    responseType: "blob", // Important for file downloads
  });
  return response.data;
}

export const updateDocumentApprovalStatusById = async (id, status) => {
  const response = await API.put(`${UPDATE_DOCUMENT_APPROVAL_STATUS_BY_ID}${id}`, { status });
  return response.data;
}
// USER ACCESS LEVEL
export const fetchAllUserAccessLevels = async ({ system_user_id }) => {
  const response = await API.get(`${GET_USER_ACCESS_LEVEL_BY_USER_ID}/${system_user_id}`);
  return response.data;
};
export const fetchUserAccessById = async (id) => {
  const response = await API.get(`${GET_USER_ACCESS_BY_ID}${id}`);
  return response.data;
};
export const fetchAllAccessTypes = async () => {
  const response = await API.get(GET_ALL_ACCESS_TYPES);
  return response.data;
};
export const createUserAccessLevel = async (userAccessData) => {
  const response = await API.post(CREATE_USER_ACCESS_LEVEL, userAccessData);
  return response.data;
};
export const updateUserAccessLevelById = async (id, userAccessData) => {
  const response = await API.put(`${UPDATE_USER_ACCESS_LEVEL}${id}`, userAccessData);
  return response.data;
};
export const deleteUserAccessLevelById = async (id) => {
  const response = await API.delete(`${DELETE_USER_ACCESS_LEVEL}${id}`);
  return response.data;
};
export const toggleUserAccessLevelStatus = async (id, status) => {
  const response = await API.put(`${TOGGLE_USER_ACCESS_LEVEL_STATUS}${id}`, { status });
  return response.data;
};

export const approveUserAccess = async (id) => {
  const response = await API.put(`${APPROVE_USER_ACCESS}${id}`);
  return response.data;
};


export const companyWiseAccess = async (data) => {
  const response = await API.post(COMPANY_WISE_ACCESS, data);
  return response.data;
};
export const documentWiseAccess = async (data) => {
  const response = await API.post(`${DOCUMENT_WISE_ACCESS}`, data);
  return response.data;
};
// All pages
export const fetchAllPages = async () => {
  const response = await API.get(GET_ALL_PAGE);
  return response.data;
};

// Common API For Approve All
export const bulkApproveAllPageData = async (page_name) => {
  const response = await API.put(`${APPROVE_ALL_BY_ENTITY_TYPE}${page_name}/update/approve/all`);
  return response.data;
};

// Notification APIs

export const createNotificationTemplate = async (templateData) => {
  const response = await API.post(CREATE_NOTIFICATION_TEMPLATE, templateData);
  return response.data;
};
export const fetchAllNotificationTemplates = async () => {
  const response = await API.get(GET_ALL_NOTIFICATION_TEMPLATE);
  return response.data;
};
export const updateNotificationTemplate = async (id, templateData) => {
  const response = await API.put(`${UPDATE_NOTIFICATION_TEMPLATE}${id}`, templateData);
  return response.data;
};

export const deleteNotificationTemplateById = async (id) => {
  const response = await API.delete(`${DELETE_NOTIFICATION_TEMPLATE_BY_ID}${id}`);
  return response.data;
};
export const updateNotificationTemplateApprovalStatusById = async (id) => {
  const response = await API.put(`${UPDATE_NOTIFICATION_TEMPLATE_APPROVAL_STATUS_BY_ID}${id}`);
  return response.data;
};
// notification
export const createNotification = async (notificationData) => {
  const response = await API.post(CREATE_NOTIFICATION, notificationData);
  return response.data;
};
export const fetchAllNotifications = async () => {
  const response = await API.get(GET_ALL_NOTIFICATION);
  return response.data;
};
export const deleteNotificationById = async (id) => {
  const response = await API.delete(`${DELETE_NOTIFICATION_BY_ID}${id}`);
  return response.data;
};
export const updateNotificationById = async (id, notificationData) => {
  const response = await API.put(`${UPDATE_NOTIFICATION_BY_ID}${id}`, notificationData);
  return response.data;
};


export const updateNotificationApprovalStatusById = async (id) => {
  const response = await API.put(`${UPDATE_NOTIFICATION_APPROVAL_STATUS_BY_ID}${id}`);
  return response.data;
};


export const updateNotificationStatusById = async (id, status) => {
  const response = await API.put(`${UPDATE_NOTIFICATION_STATUS_BY_ID}${id}`, status);
  return response.data;
};

export const uploadBulkNotification = async (filesArray, id, metadata = {}) => {
  const formData = new FormData();
  filesArray.forEach((file) => {
    formData.append("files", file);
  });
  formData.append("metadata", JSON.stringify(metadata));

  const response = await API.post(`${UPLOAD_BULK_NOTIFICATION}${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getInAppNotification = async (userId) => {
  const response = await API.get(GET_INAPP_NOTIFICATION, {
    params: { user_id: userId }
  });
  return response.data;
}

export const readNotificationById = async (id) => {
  const response = await API.put(`${READ_INAPP_NOTIFICATION}/${id}`);
  return response.data;
}

export const deleteInAppNotificationById = async (id) => {
  const response = await API.delete(`${DELETE_INAPP_NOTIFICATION}/${id}`);
  return response.data;
}

export const readAllInAppNotification = async (user_id) => {
  const response = await API.put(`${READ_ALL_INAPP_NOTIFICATION}`,
    {},
    { params: { user_id: user_id } }
  );
  return response.data;
}

export const deleteAllInAppNotification = async (user_id) => {
  const response = await API.delete(`${DELETE_ALL_INAPP_NOTIFICATION}`, {
    params: { user_id: user_id }
  });
  return response.data;
}

// change password
export const changePassword = async (userId, passwords) => {
  const response = await API.put(`${CHANGE_PASSWORD_AFTER_LOGIN}${userId}`, passwords);
  return response.data;
};

// Forget password
export const forgetPassword = async (email) => {
  const response = await API.post(`${FORGET_PASSWORD}`, email);
  return response.data;
}
export const changeTemporaryPasswordStatus = async (user_credential) => {
  const response = await API.get(`${CHANGE_TEMPORARY_PASSWORD_STATUS}${user_credential}`);
  return response.data;
}
// Dashboard
export const fetchGeneralCompaiancePortfolio = async (page, limit) => {
  const response = await API.get(`${GET_GENERAL_COMPLIANCE_PORTFOLIO}?page=${page}&limit=${limit}`);
  return response.data;
};

export const fetchGeneralComplianceByCompany = async (company_name) => {
  const response = await API.get(`${GET_GENERAL_COMPLIANCE_BY_COMPANY}company?company_name=${encodeURIComponent(company_name)}`);
  return response.data;
};

export const fetchClientOnboardingPortfolio = async () => {
  const response = await API.get(GET_CLIENT_ONBOARDING_PORTFOLIO);
  return response.data;
};

export const fetchClientOnboardingByCompany = async (company_name) => {
  const response = await API.get(`${GET_CLIENT_ONBOARDING_BY_COMPANY}company?company_name=${encodeURIComponent(company_name)}`);
  return response.data;
};
// Dashboard For Payroll
export const fetchInvestmentDeclarationStatusByCompany = async (company_name) => {
  const url = `${GET_INVESTMENT_DECLARATION_STATUS_BY_COMPANY}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}

export const fetchDistributionOfEmployeeAcrossMultipleEntitiesOrLocations = async (company_name) => {
  const url = `${GET_DISTRIBUTION_OF_EMPLOYEE_ACROSS_MULTIPLE_ENTITIES_OR_LOCATIONS}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}

export const fetchTypeOfSystemsUsedByEmployer = async (company_name) => {
  const url = `${GET_TYPE_OF_SYSTEMS_USED_BY_EMPLOYER}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}

export const fetchTotalEmployeeCount = async (company_name) => {
  const url = `${GET_TOTAL_EMPLOYEE_COUNT}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}

export const fetchPayrollsClosedOnOrAheadOfSlaPercentage = async (company_name) => {
  const url = `${GET_PAYROLLS_CLOSED_ON_OR_AHEAD_OF_SLA_PERCENTAGE}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}

export const fetchAverageDelayBetweenDataRequestDateAndClientDataReceivedDate = async (company_name) => {
  const url = `${GET_AVERAGE_DELAY_BETWEEN_DATA_REQUEST_DATE_AND_CLIENT_DATA_RECEIVED_DATE}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}


export const fetchExplanationOfEmployeeCount = async (company_name) => {
  const url = `${GET_EXPLANATION_OF_EMPLOYEE_COUNT}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}

// Helpdesk and Escalations
export const fetchTotalCountOfCommunicationTypes = async (company_name) => {
  const url = `${GET_TOTAL_COUNT_OF_COMMUNICATION_TYPES}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}

export const fetchHelpdeskTicketsRaisedByCompany = async (company_name) => {
  const url = `${GET_HELPDESK_TICKETS_RAISED_BY_COMPANY}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}
export const fetchHelpdeskStatusBasedOnIssueSubType = async (company_name) => {
  const url = `${GET_HELPDESK_STATUS_BASED_ON_ISSUE_SUB_TYPE}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}



export const fetchTotalDelayFlagsByGovt = async (company_name) => {
  const url = `${GET_TOTAL_DELAY_FLAGS_BY_GOVT}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}


export const fetchTotalDelayFlagsByClient = async (company_name) => {
  const url = `${GET_TOTAL_DELAY_FLAGS_BY_CLIENT_AND_GOVT}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}
export const fetchTicketsDistributionAssignedToCount = async (company_name) => {
  const url = `${GET_TICKETS_DISTRIBUTION_ASSIGNED_TO_COUNT}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}


export const fetchHelpDeskPendingForSelectedIssueSubtypes = async (company_name) => {
  const url = `${GET_CASES_PENDING_FOR_SELECTED_ISSUE_SUBTYPES}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}
// Audit and Visits

export const fetchAuditByServiceType = async (company_name) => {
  const url = `${GET_AUDIT_BY_SERVICE_TYPE}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}
export const fetchAuditPlatformsCountByStateSegmented = async (company_name) => {
  const url = `${GET_AUDIT_PLATFORMS_COUNT_BY_STATE_SEGMENTED}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}

export const fetchAuditStatusByCompany = async (company_name) => {
  const url = `${GET_CHECKLIST_APPROVAL_BY_COMPANY_NAME}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}

export const fetchAuditMeetingSLAByResponsibleTeam = async (company_name) => {
  const url = `${GET_AUDIT_MEETING_SLA_BY_RESPONSIBLE_TEAM}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}

export const fetchAuditStatusCount = async (company_name) => {
  const url = `${GET_COUNT_OF_AUDIT_STATUS}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}

export const fetchCountOfRiskLevel = async (company_name) => {
  const url = `${GET_COUNT_OF_RISK_LEVEL}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}


export const fetchRiskLevelBasedOnServiceType = async (company_name) => {
  const url = `${GET_RISK_LEVEL_BASED_ON_SERVICE_TYPE}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}
export const fetchEscalationTriggeredRateByState = async (company_name) => {
  const url = `${GET_ESCALATION_TRIGGERED_RATE_BY_STATE}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}

// Notice & Enspections

export const fetchAuthorityDistributionCount = async (company_name) => {
  const url = `${GET_AUTHORITY_DISTRIBUTION_COUNT}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}
export const fetchStateWiseNoticeCount = async (company_name) => {
  const url = `${GET_STATE_WISE_NOTICE_COUNT}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}
export const fetchTypesOfNoticeOrInspection = async (company_name) => {
  const url = `${GET_TYPES_OF_NOTICE_OR_INSPECTION} ${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}
export const fetchAnalysisOfApplicableAct = async (company_name) => {
  const url = `${GET_ANALYSIS_OF_APPLICABLE_ACT}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}
export const fetchNoticesAssignedTo = async (assigned_to) => {
  const url = `${GET_NOTICES_ASSIGNED_TO}${assigned_to ? `?company_name=${encodeURIComponent(assigned_to)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}
export const fetchCountOfAcknowledgmentRates = async (company_name) => {
  const url = `${GET_COUNT_OF_ACKNOWLEDGMENT_RATES}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}
export const fetchCountOfClientDocSubmission = async (company_name) => {
  const url = `${GET_COUNT_OF_CLIENT_DOC_SUBMISSION}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}

export const fetchDistributionOfResponseStatus = async (company_name) => {
  const url = `${GET_DISTRIBUTION_OF_RESPONSE_STATUS}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}

// General Helpdesk
export const fetchStatusCountOfoOpenVsClosedCases = async (company_name) => {
  const url = `${GET_STATUS_COUNT_OF_OPEN_VS_CLOSED_CASES}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}

export const fetchAssignedIndividualsList = async (company_name) => {
  const url = `${GET_ASSIGNED_INDIVIDUALS_LIST}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}

export const fetchDocumentsPendingFrom = async (company_name) => {
  const url = `${GET_DOCUMENTS_PENDING_FROM}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}

export const fetchIssueCategoryByStatus = async (company_name) => {
  const url = `${GET_ISSUE_CATEGORY_BY_STATUS}${company_name ? `?company_name=${encodeURIComponent(company_name)}` : ''}`;
  const response = await API.get(url);
  return response.data;
}

// Challan Dashboard
// Dashboard filters -> "?key=value"; arrays go as comma separated values, empty values are skipped
const dashboardQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    const val = Array.isArray(value) ? value.join(",") : value;
    if (val !== undefined && val !== null && val !== "") query.append(key, val);
  });
  const str = query.toString();
  return str ? `?${str}` : "";
};

// Only company_name narrows the filter options
export const fetchChallanFilters = async (company_name) => {
  const response = await API.get(`${GET_CHALLAN_FILTERS}${dashboardQuery({ company_name })}`);
  return response.data;
}

export const fetchChallanSummary = async (params) => {
  const response = await API.get(`${GET_CHALLAN_SUMMARY}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchChallanTrend = async (params) => {
  const response = await API.get(`${GET_CHALLAN_TREND}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchChallanCompanyWise = async (params) => {
  const response = await API.get(`${GET_CHALLAN_COMPANY_WISE}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchChallanActWise = async (params) => {
  const response = await API.get(`${GET_CHALLAN_ACT_WISE}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchChallanLocationWise = async (params) => {
  const response = await API.get(`${GET_CHALLAN_LOCATION_WISE}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchChallanTurnaround = async (params) => {
  const response = await API.get(`${GET_CHALLAN_TURNAROUND}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchChallanExceptions = async (params, page = 1, limit = 50) => {
  const response = await API.get(`${GET_CHALLAN_EXCEPTIONS}${dashboardQuery({ ...params, page, limit })}`);
  return response.data;
}

// Signature matches PaginatedGrid's fetchPage(page, limit, search)
export const fetchChallanRecords = async (page, limit, search, params) => {
  const response = await API.get(`${GET_CHALLAN_RECORDS}${dashboardQuery({ ...params, ...(search ? { search } : {}), page, limit })}`);
  return response.data;
}

// Pass company_name in company-wise mode so the backend checks access to that company
export const fetchChallanRecordById = async (id, company_name) => {
  const response = await API.get(`${GET_CHALLAN_RECORD_BY_ID}${encodeURIComponent(id)}${dashboardQuery({ company_name })}`);
  return response.data;
}

// Register Dashboard
// Only company_name narrows the filter options
export const fetchRegisterDashFilters = async (company_name) => {
  const response = await API.get(`${GET_REGISTER_DASH_FILTERS}${dashboardQuery({ company_name })}`);
  return response.data;
}

export const fetchRegisterDashSummary = async (params) => {
  const response = await API.get(`${GET_REGISTER_DASH_SUMMARY}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchRegisterDashCompanyWise = async (params) => {
  const response = await API.get(`${GET_REGISTER_DASH_COMPANY_WISE}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchRegisterDashTrend = async (params) => {
  const response = await API.get(`${GET_REGISTER_DASH_TREND}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchRegisterDashRegisterWise = async (params) => {
  const response = await API.get(`${GET_REGISTER_DASH_REGISTER_WISE}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchRegisterDashActWise = async (params) => {
  const response = await API.get(`${GET_REGISTER_DASH_ACT_WISE}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchRegisterDashLocationWise = async (params) => {
  const response = await API.get(`${GET_REGISTER_DASH_LOCATION_WISE}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchRegisterDashTurnaround = async (params) => {
  const response = await API.get(`${GET_REGISTER_DASH_TURNAROUND}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchRegisterDashVariance = async (params) => {
  const response = await API.get(`${GET_REGISTER_DASH_VARIANCE}${dashboardQuery(params)}`);
  return response.data;
}

// Paginated lists: params carry the filters plus page / limit (and sheet / sort for records)
export const fetchRegisterDashExceptions = async (params) => {
  const response = await API.get(`${GET_REGISTER_DASH_EXCEPTIONS}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchRegisterDashCoverage = async (params) => {
  const response = await API.get(`${GET_REGISTER_DASH_COVERAGE}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchRegisterDashRecords = async (params) => {
  const response = await API.get(`${GET_REGISTER_DASH_RECORDS}${dashboardQuery(params)}`);
  return response.data;
}

// Pass company_name in company-wise mode so the backend checks access to that company
export const fetchRegisterDashRecordById = async (id, company_name) => {
  const response = await API.get(`${GET_REGISTER_DASH_RECORD_BY_ID}${encodeURIComponent(id)}${dashboardQuery({ company_name })}`);
  return response.data;
}

// Returns Dashboard
// Only company_name narrows the filter options
export const fetchReturnsDashFilters = async (company_name) => {
  const response = await API.get(`${GET_RETURNS_DASH_FILTERS}${dashboardQuery({ company_name })}`);
  return response.data;
}

export const fetchReturnsDashSummary = async (params) => {
  const response = await API.get(`${GET_RETURNS_DASH_SUMMARY}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchReturnsDashCompanyWise = async (params) => {
  const response = await API.get(`${GET_RETURNS_DASH_COMPANY_WISE}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchReturnsDashTrend = async (params) => {
  const response = await API.get(`${GET_RETURNS_DASH_TREND}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchReturnsDashPeriodWise = async (params) => {
  const response = await API.get(`${GET_RETURNS_DASH_PERIOD_WISE}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchReturnsDashReturnWise = async (params) => {
  const response = await API.get(`${GET_RETURNS_DASH_RETURN_WISE}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchReturnsDashActWise = async (params) => {
  const response = await API.get(`${GET_RETURNS_DASH_ACT_WISE}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchReturnsDashLocationWise = async (params) => {
  const response = await API.get(`${GET_RETURNS_DASH_LOCATION_WISE}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchReturnsDashTurnaround = async (params) => {
  const response = await API.get(`${GET_RETURNS_DASH_TURNAROUND}${dashboardQuery(params)}`);
  return response.data;
}

// Paginated lists: params carry the filters plus page / limit (and sheet / sort for records)
export const fetchReturnsDashExceptions = async (params) => {
  const response = await API.get(`${GET_RETURNS_DASH_EXCEPTIONS}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchReturnsDashCoverage = async (params) => {
  const response = await API.get(`${GET_RETURNS_DASH_COVERAGE}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchReturnsDashRecords = async (params) => {
  const response = await API.get(`${GET_RETURNS_DASH_RECORDS}${dashboardQuery(params)}`);
  return response.data;
}

// Pass company_name in company-wise mode so the backend checks access to that company
export const fetchReturnsDashRecordById = async (id, company_name) => {
  const response = await API.get(`${GET_RETURNS_DASH_RECORD_BY_ID}${encodeURIComponent(id)}${dashboardQuery({ company_name })}`);
  return response.data;
}

// License Dashboard
// Only company_name narrows the filter options
export const fetchLicenseDashFilters = async (company_name) => {
  const response = await API.get(`${GET_LICENSE_DASH_FILTERS}${dashboardQuery({ company_name })}`);
  return response.data;
}

export const fetchLicenseDashSummary = async (params) => {
  const response = await API.get(`${GET_LICENSE_DASH_SUMMARY}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchLicenseDashCompanyWise = async (params) => {
  const response = await API.get(`${GET_LICENSE_DASH_COMPANY_WISE}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchLicenseDashLocationWise = async (params) => {
  const response = await API.get(`${GET_LICENSE_DASH_LOCATION_WISE}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchLicenseDashTrend = async (params) => {
  const response = await API.get(`${GET_LICENSE_DASH_TREND}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchLicenseDashTurnaround = async (params) => {
  const response = await API.get(`${GET_LICENSE_DASH_TURNAROUND}${dashboardQuery(params)}`);
  return response.data;
}

// params carry the filters plus `by` (one of filters.breakdowns)
export const fetchLicenseDashBreakdown = async (params) => {
  const response = await API.get(`${GET_LICENSE_DASH_BREAKDOWN}${dashboardQuery(params)}`);
  return response.data;
}

// params carry the filters plus `months` (timeline length from the current month)
export const fetchLicenseDashExpiryTimeline = async (params) => {
  const response = await API.get(`${GET_LICENSE_DASH_EXPIRY_TIMELINE}${dashboardQuery(params)}`);
  return response.data;
}

// Paginated lists: params carry the filters plus page / limit (and sort for records)
export const fetchLicenseDashExceptions = async (params) => {
  const response = await API.get(`${GET_LICENSE_DASH_EXCEPTIONS}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchLicenseDashRecords = async (params) => {
  const response = await API.get(`${GET_LICENSE_DASH_RECORDS}${dashboardQuery(params)}`);
  return response.data;
}

// Pass company_name in company-wise mode so the backend checks access to that company
export const fetchLicenseDashRecordById = async (id, company_name) => {
  const response = await API.get(`${GET_LICENSE_DASH_RECORD_BY_ID}${encodeURIComponent(id)}${dashboardQuery({ company_name })}`);
  return response.data;
}

// Compliance Cockpit
// Only company_name narrows the filter options
export const fetchCockpitFilters = async (company_name) => {
  const response = await API.get(`${GET_COCKPIT_FILTERS}${dashboardQuery({ company_name })}`);
  return response.data;
}

// params: company_name, state, location, search, month_from, month_to
export const fetchCockpitSummary = async (params) => {
  const response = await API.get(`${GET_COCKPIT_SUMMARY}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchCockpitCompanyWise = async (params) => {
  const response = await API.get(`${GET_COCKPIT_COMPANY_WISE}${dashboardQuery(params)}`);
  return response.data;
}

export const fetchCockpitStateWise = async (params) => {
  const response = await API.get(`${GET_COCKPIT_STATE_WISE}${dashboardQuery(params)}`);
  return response.data;
}

// Client master data; only company_name applies
export const fetchCockpitClients = async (company_name) => {
  const response = await API.get(`${GET_COCKPIT_CLIENTS}${dashboardQuery({ company_name })}`);
  return response.data;
}

// Dashboaed Widgets

export const fetchAllWidgetMappings = async (userId) => {
  const response = await API.get(`${GET_ALL_WIDGET_MAPPINGS}?user_id=${userId}`);
  return response.data;
};

export const createOrUpdateWidgetMapping = async (widgetData, userId) => {
  const response = await API.post(`${CREATE_OR_UPDATE_WIDGET_MAPPING}?user_id=${userId}`, widgetData);
  return response.data;
};

export const deleteWidgetMappingById = async (user_id, target_user_id) => {
  const response = await API.delete(`${DELETE_WIDGET_MAPPING_BY_ID}${user_id}&target_user_id=${target_user_id}`);
  return response.data;
};

export const fetchWidgetMappingById = async (id) => {
  const response = await API.get(`${GET_WIDGETS_BY_USER_ID}${id}`);
  return response.data;
};


export const fetchAllRegisterNames = async () => {
  const response = await API.get(GET_ALL_REGISTER_NAMES);
  return response.data;
};


export const fetchRegisterMappingByName = async (register_id, doc_id) => {
  const response = await API.get(`${GET_REGISTER_MAPPING}${register_id}&document_id=${doc_id}`);
  return response.data;
};

export const createRegisterProcess = async (data) => {
  const response = await API.post(PROCESS_REGISTERS, data, {
    responseType: 'blob',
  });
  return response.data;
}


export const fetchFileByType = async () => {
  const response = await API.get(`${GET_FILE_BY_TYPE}`);
  return response.data;
}

// export const createRegister = async (data) => {
//   try {
//     const response = await API.post(CREATE_REGISTER, data);
//     return response.data;
//   } catch (error) {
//     // console.error("Error creating register:", error);
//     throw error;
//   }
// }

export const createRegister = async (data) => {
  const response = await API.post(CREATE_REGISTER, data);
  return response.data;
}
export const createApplicability = async (data) => {
  const response = await API.post(CREATE_APPLICABILITY, data);
  return response.data;
}
export const createMapping = async (data) => {
  const response = await API.post(CREATE_MAPPING, data);
  return response.data;
}
export const processRegister = async (payload) => {
  const formData = new FormData();

  payload.files.forEach((file) => {
    formData.append("file", file);
  });

  const queryParams = new URLSearchParams({
    by: payload.by,
    id: payload.by_id,
    month: payload.month,
    from: payload.start_date,
    to: payload.end_date,
    year: payload.year,
    company_id: payload.company_id,
    branchCol: payload.branch_column_name,
    group_id: payload.group_id,
    siteCol: payload.site_column_name,
  });

  const response = await API.post(
    `${PROCESS_REGISTER}?${queryParams.toString()}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "blob",
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    }
  );

  return response;
};
export const getApplicabilityByLocationId = async (location_id) => {
  const response = await API.get(`${GET_APPLICABILITY_BY_LOCATION_ID}${location_id}`);
  return response.data;
}
export const getApplicabilityByCompanyId = async (company_id) => {
  const response = await API.get(`${GET_APPLICABILITY_BY_COMPANY_ID}${company_id}`);
  return response.data;
}
export const getApplicabilityByGroupId = async (group_id) => {
  const response = await API.get(`${GET_APPLICABILITY_BY_GROUP_ID}${group_id}`);
  return response.data;
}
export const updateApplicabilityById = async (id, data) => {
  const response = await API.put(`${UPDATE_APPLICABILITY_BY_ID}${id}`, data);
  return response.data;
}
export const deleteApplicabilityById = async (id) => {
  const response = await API.delete(`${DELETE_APPLICABILITY_BY_ID}${id}`);
  return response.data;
}
export const getApplicabilityById = async (id) => {
  const response = await API.get(`${GET_REGISTER_APPLICABILITY_BY_ID}${id}`);
  return response.data;
}

export const getPipelineByApplicabilityId = async (applicability_id) => {
  const response = await API.get(`${GET_PIPELINE_BY_APPLICABILITY_ID}${applicability_id}`);
  return response.data;
}
export const deleteMappingById = async (id) => {
  const response = await API.delete(`${DELETE_MAPPING_BY_ID}${id}`);
  return response.data;
}
export const updateMappingById = async (id, data) => {
  const response = await API.put(`${UPDATE_MAPPING_BY_ID}${id}`, data);
  return response.data;
}



export const generateAIMapping = async (filesArray, id) => {
  const formData = new FormData();

  filesArray.forEach((file) => {
    formData.append("files", file);
  });

  const response = await API.post(`${GENERATE_AI_MAPPING_SUCCESS}${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export const createEntity = async (data) => {
  const response = await API.post(CREATE_ENTITY, data);
  return response.data;
};

export const fetchAllEntities = async () => {
  const response = await API.get(GET_MULTIPLE_ENTITIES);
  return response.data;
};

export const updateEntity = async (id, data) => {
  const response = await API.put(
    `${UPDATE_ENTITY}${id}`,
    data
  );

  return response.data;
};

export const deleteEntity = async (id) => {
  const response = await API.delete(`${DELETE_ENTITY}/${id}`);
  return response.data;
};

export const updateApprovalStatus = async (id) => {
  const response = await API.put(
    `${UPDATE_APPROVAL_STATUS}${id}`
  );

  return response.data;
};

export const fetchEntityById = async (id) => {
  const response = await API.get(
    `${GET_ENTITIES_BY_COMPANY_ID}${id}`
  );

  return response.data;
};

export const getAllCompanyLocationByEntityId = async (id) => {
  const response = await API.get(
    `${GET_ALL_COMPANY_LOCATION_BY_ENTITY_ID}${id}`
  );

  return response.data;
};

//Document-repo
export const getAllFileNamesByAccessType = async () => {
  const response = await API.get(
    GET_FILE_NAMES_BY_ACCESS_TYPE
  );

  return response.data;
};

//component-wise-access
export const createGroupwiseAccessByGroupId = async (data) => {
  const response = await API.post(CREATE_GROUPWISE_ACCESS_BY_GROUP_ID, data);
  return response.data;
};

export const createEntityWiseAccess = async (data) => {
  const response = await API.post(ENTITY_WISE_ACCESS, data);
  return response.data;
};

export const createLocationWiseAccess = async (data) => {
  const response = await API.post(LOCATION_WISE_ACCESS, data);
  return response.data;
};




// CLIENT ONBOARDING
export const downloadClientOnboardingTemplate = async () => {
  const response = await API.get(CLIENT_ONBOARDING_TEMPLATE, { responseType: "blob" });
  return response.data;
};

// dryRun=true validates the file and reports what would be created without writing anything.
export const uploadClientOnboardingFile = async (file, dryRun) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await API.post(
    `${CLIENT_ONBOARDING_UPLOAD}${dryRun ? "?dry_run=true" : ""}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

// DOCUMENT BULK TAGGING
export const downloadDocumentBulkTaggingTemplate = async () => {
  const response = await API.get(DOCUMENT_BULK_TAGGING_TEMPLATE, { responseType: "blob" });
  return response.data;
};

// dryRun=true reports what would change without writing; dryRun=false applies it and emails a report.
export const uploadDocumentBulkTaggingFile = async (file, dryRun) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await API.post(DOCUMENT_BULK_TAGGING_UPLOAD, formData, {
    params: { dry_run: dryRun ? "true" : "false" },
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
