import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Calendar, ChevronDown, ChevronUp, DeleteIcon, Upload, ArrowBigLeft } from 'lucide-react';
import '../style/notificationList.css';
import { useNavigate } from 'react-router-dom';
import { bulkApproveAllPageData, createNotification, deleteNotificationTemplateById, fetchAllNotifications, fetchAllNotificationTemplates, updateNotificationTemplate, updateNotificationTemplateApprovalStatusById } from '../api/service';
import Snackbars from '../component/Snackbars';
import DeleteModal from '../component/DeleteModal';
import Toggle from '../component/Toggle';
// import MultipleSelectTextFields from '../component/MuiInputs/MultipleSelectTextFields';
// import SingleSelectTextField from '../component/MuiInputs/SingleSelectTextField';
const NotificationList = () => {
  // Your JSON data
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [templateId, setTemplateId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNotificationCreated, setIsNotificationCreated] = useState(false);
  const [editMode, setEditMode] = useState(null); // 'template' | 'notification' | 'create'
  const [issnackbarsOpen, setIsSnackbarsOpen] = useState({
    open: false,
    vertical: 'top',
    horizontal: 'center',
    message: '',
    severityType: '',
  });
  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = template.template_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.template_subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.template_body?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || template.template_type === filterType;
    const matchesPriority = filterPriority === 'all' || template.template_priority === filterPriority;

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && template.is_active) ||
      (filterStatus === 'inactive' && !template.is_active) ||
      (filterStatus === 'approved' && template.approval_status === 1) ||
      (filterStatus === 'pending' && template.approval_status === 0);

    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });


  const notificationTypes = [
    { value: 'INFO', label: 'Information', color: 'linear-gradient(135deg, #3b82f6, #2563eb)', icon: '💡' },
    { value: 'SUCCESS', label: 'Success', color: 'linear-gradient(135deg, #10b981, #059669)', icon: '✅' },
    { value: 'WARNING', label: 'Warning', color: 'linear-gradient(135deg, #f59e0b, #d97706)', icon: '⚠️' },
    { value: 'ERROR', label: 'Error', color: 'linear-gradient(135deg, #ef4444, #dc2626)', icon: '❌' },
    { value: 'REMINDER', label: 'Reminder', color: 'linear-gradient(135deg, #6366f1, #4338ca)', icon: '⏰' },
    { value: 'NOTIFY', label: 'Notify', color: 'linear-gradient(135deg, #f87171, #dc2626)', icon: '🚨' },
    { value: 'OTHER', label: 'Other', color: 'linear-gradient(135deg, #6b7280, #374151)', icon: '📌' }
  ];


  const priorities = [
    { value: 'LOW', label: 'Low Priority', color: '#6b7280' },
    { value: 'MEDIUM', label: 'Medium Priority', color: '#2563eb' },
    { value: 'HIGH', label: 'High Priority', color: '#dc2626' }
  ];


  const navigate = useNavigate();
  const handleEdit = (template) => {
    setEditingId(template._id);
    setEditForm({ ...template });
    setIsNotificationCreated(false);

  };

  // Save Template form
  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    // if (!validateForm()) return; // ✅ block submit if errors exist
    const deliveryTypes = [];
    if (editForm.in_app) deliveryTypes.push("IN_APP");
    if (editForm.email) deliveryTypes.push("EMAIL");
    const payload = {
      template_name: editForm.template_name,
      template_body: editForm.template_body,
      template_subject: editForm.template_subject,
      template_priority: editForm.template_priority,
      template_type: editForm.template_type,
      in_app: editForm.in_app,
      email: editForm.email,
      delivery_type: deliveryTypes,
      IsActive: editForm.is_active,
    };

    try {
      const response = await updateNotificationTemplate(editingId, payload);
      const message = response?.message || "Notification template updated successfully";
      setEditingId(null);
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message,
        severityType: 'success',
      });
      // Refresh data
      const updatedData = await fetchAllNotificationTemplates();
      setTemplates(updatedData);
    } catch (error) {
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: error?.response?.data?.message,
        severityType: 'error',
      });
    }

    setEditForm({});
    setIsNotificationCreated(false);
  };

  const handleSaveNotification = async (e) => {
    e.preventDefault();
    // if (!validateForm()) return; // ✅ block submit if errors exist
    const payload = {
      "group_holding_id": "68b54526b11e842072a11103",
      "group_name": "TATA GROUP",
      "company_id": "68b545e2b11e842072a11109",
      "company_name": "Zudio",
      "location_id": "68b54a43b11e842072a11123",
      "location_name": "Andheri west",
      "template_id": "1234567888889",
      "template_name": "Abcd edfr",
      "send_on": "23th sept",
      "send_to": ["aoshin@karma.com"],
      "cc": ["rupa@karma.com"],
      "priority": "medium"
    };

    try {
      const response = await createNotification(payload);
      const message = response?.message || "Notification template created successfully";
      setEditingId(null);
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message,
        severityType: 'success',
      });
      // Refresh data
      const updatedData = await fetchAllNotifications();
      setTemplates(updatedData);
    } catch (error) {
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: error?.response?.data?.message,
        severityType: 'error',
      });
    }

    setEditForm({});
    setIsNotificationCreated(false);
  };
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setIsNotificationCreated(false);
  };


  // Handle Delete
  const handleDelete = async (templateId) => {
    try {
      const response = await deleteNotificationTemplateById(templateId);
      const message = response?.message || "Notification template deleted successfully";
      // Refresh data
      const updatedData = await fetchAllNotificationTemplates();
      setTemplates(updatedData);
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
  // approve all
  const handleApproveAll = async () => {
    try {
      const response = await bulkApproveAllPageData('notification_template');
      const message = response?.message || "Status update successfully"
      // Show success snackbar
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message,
        severityType: 'success',
      });
      const updatedData = await fetchAllNotificationTemplates();
      setTemplates(updatedData);
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

  // approve single
  const handleSingleApprove = async (templateId) => {
    try {
      const response = await updateNotificationTemplateApprovalStatusById(templateId);
      const message = response?.message || "Status update successfully"
      // Show success snackbar
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message,
        severityType: 'success',
      });
      const updatedData = await fetchAllNotificationTemplates();
      setTemplates(updatedData);
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
  // const handleDelete = (id) => {
  //   if (window.confirm('Are you sure you want to delete this template?')) {
  //     deleteNotificationTemplateById(id);
  //     setTemplates(prev => prev.filter(template => template._id !== id));
  //   }
  // };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getTypeClass = (type) => {
    switch (type) {
      case 'SUCCESS': return 'success';
      case 'WARNING': return 'warning';
      case 'ERROR': return 'error';
      case 'INFO': return 'info';
      case 'REMINDER': return 'reminder';
      case 'NOTIFY': return 'notify';
      case 'OTHER': return 'other';
      default: return 'info';
    }
  };


  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString.replace(' ', 'T')).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const deleteModal = () => {
    return (
      <div>
        <div className='delete_message p-4'>
          Are you sure you want to delete <DeleteIcon className='action_icon' /> this Template?
        </div>
        <div className="row row-gap-2 mt-4">
          <div className='col-6'>
            <button type="button" className="btn-sm btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}><span className='button-style'>Cancel</span></button>
          </div>
          <div className='col-6 d-flex justify-content-end'>
            <button type="submit"
              className="btn-sm btn btn-primary"
              onClick={() => handleDelete(templateId)}>Yes, I'm sure</button>
          </div>
        </div>
      </div>
    )
  }
  useEffect(() => {
    fetchAllNotificationTemplates().then(data => {
      setTemplates(data);
    }).catch(() => {
      // console.error('Error fetching notifications:', err);
    });
  }, []);
  // useEffect(() => {
  //   if (template_id) {
  //     const templateToEdit = templates.find(t => t._id === template_id);
  //     if (templateToEdit) {
  //       handleEdit(templateToEdit);
  //     }
  //   }
  // }, [template_id, templates]);
  return (
    <div className="show-notifications-container">
      <Snackbars issnackbarsOpen={issnackbarsOpen} setIsSnackbarsOpen={setIsSnackbarsOpen} />
      <DeleteModal deleteForm={deleteModal} deleteTitle='Delete Notification Template' isModalOpen={isDeleteModalOpen} setIsModalOpen={setIsDeleteModalOpen} />

      <div className="notifications-header">
        <div className="header-content">
          <h1>{templates?.length > 0 ? `${templates.length} Templates` : 'No Templates'}</h1>
          <p>Manage and monitor all your notification templates</p>
        </div>
        <div className='d-lg-flex d-md-flex gap-2'>
          {/* <button
            onClick={() => navigate('/create_notification')}
            // onClick={() => handleCreateNotification(template)}
            className="create-button"
          >
            Create Notification
          </button> */}
          <button
            onClick={handleApproveAll}
            className="approve-all-button"
          >
            <span className="icon">
              <svg viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12 3.41 13.41 9 19 21 7 19.59 5.59z" />
              </svg>
            </span>
            Approved All
          </button>
        </div>

      </div>

      <div className="notifications-controls">
        <div className="search-section">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by template name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-group">
            <Filter size={16} />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              {notificationTypes?.map(type => (
                <option key={type.value} value={type.value}>
                  {type?.icon}{type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="all">All Priorities</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>

          <div className="filter-group">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      <div className="notifications-stats">
        <div className="stat-card">
          <span className="stat-number">{templates?.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{templates?.filter(t => t.template_type === 'SUCCESS')?.length}</span>
          <span className="stat-label">Success</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{templates?.filter(t => t.template_type === 'WARNING')?.length}</span>
          <span className="stat-label">Warning</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{templates?.filter(t => t.template_type === 'ERROR')?.length}</span>
          <span className="stat-label">Error</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{templates?.filter(t => t.template_type === 'INFO')?.length}</span>
          <span className="stat-label">Information</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{templates?.filter(t => t.template_type === 'REMINDER')?.length}</span>
          <span className="stat-label">Reminder</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{templates?.filter(t => t.approval_status === 1)?.length}</span>
          <span className="stat-label">Approved</span>
        </div>
      </div>

      <div className="notifications-list" >
        {filteredTemplates?.length === 0 || !filteredTemplates ? (
          <div className="empty-state">
            <div className="empty-content">
              <Calendar size={48} />
              <h3>No templates found</h3>
              <p>
                {searchTerm || filterType !== 'all' || filterPriority !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first template to get started'
                }
              </p>
              {!searchTerm && filterType === 'all' && filterPriority === 'all' && (
                <button
                  onClick={() => navigate('/create_notification_template')}
                  className="create-first-button">
                  <Plus size={20} />
                  Create First Template
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredTemplates?.map(template => (
            <div
              key={template._id}
              className={`notification-card ${getTypeClass(template.template_type)}`}
              style={{ borderColor: template?.template_type_color, }}

            >
              {editingId === template._id ? (
                <div className="edit-form">
                  <div className="edit-header">
                    <h4>
                      Edit Template
                      {/* {isNotificationCreated
                        ? "Create Notification"
                        : editMode === "notification"
                          ? "Edit Notification"
                          : "Edit Template"} */}
                    </h4>
                    <div className="edit-actions">
                      <button
                        onClick={(e) => {
                          if (isNotificationCreated || editMode === "notification") {
                            handleSaveNotification(e);
                          } else {
                            handleSaveTemplate(e);
                          }
                        }}
                        className="save-button"
                      >
                        Save
                      </button>
                      <button onClick={handleCancelEdit} className="cancel-button">
                        Cancel
                      </button>
                    </div>
                  </div>

                    <div className="edit-fields">
                      <input
                        type="text"
                        value={editForm.template_name}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, template_name: e.target.value }))
                        }
                        placeholder="Template name"
                      />

                      <input
                        type="text"
                        value={editForm.template_subject}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, template_subject: e.target.value }))
                        }
                        placeholder="Template subject"
                      />

                      <textarea
                        value={editForm.template_body}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, template_body: e.target.value }))
                        }
                        placeholder="Template body"
                        rows="3"
                      ></textarea>

                      <div className="edit-selects">
                        <select
                          value={editForm.template_type}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, template_type: e.target.value }))
                          }
                        >
                          {notificationTypes?.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type?.icon}
                              {type.label}
                            </option>
                          ))}
                        </select>

                        <select
                          value={editForm.template_priority}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              template_priority: e.target.value,
                            }))
                          }
                        >
                          {priorities?.map((priority) => (
                            <option key={priority.value} value={priority.value}>
                              {priority.label}
                            </option>
                          ))}
                          <option value="OTHER">OTHER</option>
                        </select>
                      </div>

                      <div className="edit-checkboxes">
                        <label>
                          <input
                            type="checkbox"
                            checked={editForm.in_app}
                            onChange={(e) => {
                              if (!e.target.checked && !editForm.email) return; // prevent both unchecked
                              setEditForm((prev) => ({ ...prev, in_app: e.target.checked }));
                            }}
                          />
                          In-App
                        </label>

                        <label>
                          <input
                            type="checkbox"
                            checked={editForm.email}
                            onChange={(e) => {
                              if (!e.target.checked && !editForm.in_app) return; // prevent both unchecked
                              setEditForm((prev) => ({ ...prev, email: e.target.checked }));
                            }}
                          />
                          Email
                        </label>

                        <div className="d-flex align-items-center gap-2">
                          <span>Status</span>
                          <Toggle
                            marginTop="0px"
                            checked={editForm.is_active}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                is_active: e.target.checked,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                </div>
              ) : (
                <>
                  <div className="notification-header" >
                    <div className="notification-badges">
                      <span className={`type-badge ${getTypeClass(template.template_type)}`}>
                        {template.template_type}
                      </span>
                      <span className={`priority-badge ${template.template_priority.toLowerCase()}`}>
                        {template.template_priority}
                      </span>
                      {template.approval_status === 1 && (
                        <span className="approval-badge approved">Approved</span>
                      )}
                      {template.approval_status === 0 && (
                        <span className="approval-badge pending">Pending</span>
                      )}
                    </div>
                    <div className="notification-actions">
                      <button
                        onClick={() => toggleExpand(template._id)}
                        className="expand-button"
                        title="View details"
                      >
                        {expandedId === template._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      <button
                          onClick={() => {
                            handleEdit(template);
                            setEditMode("template");
                            setIsNotificationCreated(false);
                          }}
                          className="edit-button"
                          title="Edit template"
                          // style={{ margin: '0 0 12px 0' }}
                        >
                          <Edit2 size={16} />
                        </button>
                      {/* <button
                        onClick={() => handleCreateNotification(template)}
                        className="edit-button"
                        title="Upload Template"
                      >
                        <Upload size={16} />
                      </button> */}
                      <button
                        onClick={() => {
                          setTemplateId(template._id);
                          setIsDeleteModalOpen(true);
                        }}
                        className="delete-button"
                        title="Delete template"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="notification-content">
                    <h3>{template.template_name}</h3>
                    <div className="template-subject">
                      <strong>Subject:</strong> {template.template_subject}
                    </div>
                    <div className="template-body">
                      <strong>Body:</strong> {template.template_body}
                    </div>

                    <div className="delivery-badges">
                      <div className="delivery-badges">
                        {template.delivery_type?.map((type, index) => (
                          <span
                            key={index}
                            className={`delivery-badge ${type.toLowerCase().replace("_", "-")}`}
                          >
                            {type === "IN_APP" ? "In-App" : "Email"}
                          </span>
                        ))}
                      </div>

                    </div>
                  </div>

                  {expandedId === template._id && (
                    <div className="expanded-details">
                      <div className='d-flex justify-content-between align-items-center'>
                        <h4>Template Details</h4>
                      </div>

                      <div className="details-grid">
                        <div className="detail-item">
                          <span className="detail-label">In-App:</span>
                          <span className="detail-value">{template.in_app ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Email:</span>
                          <span className="detail-value">{template.email ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Delivery Type:</span>
                          <span className="detail-value">
                            {template.delivery_type ?
                              (Array.isArray(template.delivery_type) ?
                                template.delivery_type.join(', ') :
                                template.delivery_type) :
                              'Not set'}
                          </span>
                        </div>
                      </div>

                      {/* <h4>Common Attributes</h4> */}
                      <div className="details-grid">
                        <div className="detail-item">
                          <span className="detail-label">Is Active:</span>
                          <span className="detail-value">{template.is_active ? 'Yes' : 'No'}</span>
                        </div>
                        {/* <div className="detail-item">
                          <span className="detail-label">Is Deleted:</span>
                          <span className="detail-value">{template.IsDeleted ? 'Yes' : 'No'}</span>
                        </div> */}
                        <div className="detail-item">
                          <span className="detail-label">Created By:</span>
                          <span className="detail-value">{template.created_by}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Created At:</span>
                          <span className="detail-value">{formatDate(template.created_at)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Updated By:</span>
                          <span className="detail-value">{template.updated_by}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Updated At:</span>
                          <span className="detail-value">{formatDate(template.updated_at)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Approval Status:</span>
                          <span className="detail-value">
                            {template.approval_status === 1 ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Approved By:</span>
                          <span className="detail-value">
                            {template.approved_by !== "000000000000000000000000" ?
                              template.approved_by : 'Not approved'}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Approved At:</span>
                          <span className="detail-value">{formatDate(template.approved_at)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="notification-footer d-lg-flex d-md-flex justify-content-between">
                    <span className="notification-date">
                      <Calendar size={14} />
                      Created: {formatDate(template.created_at)}
                    </span>
                    <div className='btn-wrap-div'>
                      <button className={`${template.approval_status === 1 ? 'button approve w-100 justify-content-center cursor-not-allowed' : 'button approve w-100 justify-content-center'} `} onClick={() => handleSingleApprove(template._id)} disabled={template.approval_status === 1}>
                        <span className="icon">
                          <svg viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12 3.41 13.41 9 19 21 7 19.59 5.59z" />
                          </svg>
                        </span>
                        <span className="text">Approve</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}

      </div>
    </div >
  );
};

export default NotificationList;