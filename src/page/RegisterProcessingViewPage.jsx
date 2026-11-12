import React, { useCallback, useEffect, useMemo, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteModal from '../component/DeleteModal';
import DeleteIcon from "@mui/icons-material/Delete";
import { flattenObject } from "../../Utils/tableColUtils";
import {
  createApplicability,
  createMapping,
  deleteApplicabilityById,
  deleteMappingById,
  fetchAllGroupHolding,
  fetchAllLocationName,
  fetchAllRegisterNames,
  fetchCompaniesNameByGroupId,
  generateAIMapping,
  getApplicabilityByCompanyId,
  getApplicabilityByGroupId,
  getApplicabilityByLocationId,
  getLocationByCompanyId,
  getPipelineByApplicabilityId,
  updateApplicabilityById,
  updateMappingById,
} from "../api/service";
import SingleSelectTextField from "../component/MuiInputs/SingleSelectTextField";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import SmallSizeModal from '../component/SmallSizeModal';
import { AnimatedSearchBar } from '../component/AnimatedSearchBar';
import { useRef } from 'react';
import MultiSelectFilter from './dashboardDrawerGridDetailPage/MultiSelectFilter';
import { Plus } from 'lucide-react';
import RegisterMappingPage from './RegisterMappingPage';
import Snackbars from '../component/Snackbars';
import RegisterMappingPageWithAi from "./RegisterMappingPageWithAi";
ModuleRegistry.registerModules([AllCommunityModule]);

const RegisterProcessingViewPage = () => {
  const [groupHoldingName, setGroupHoldingName] = useState([])
  const [companyName, setCompanyName] = useState([])
  const [locationNameByCompanyId, setLocationNameByCompanyId] = useState([])
  const [locationName, setLocationName] = useState([])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isGeneratePipeline, setIsGeneratePipeline] = useState(false);
  const [registerName, setRegisterName] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("idle")
  const [current, setCurrent] = useState(
    {
      group_name: "",
      group_holding_id: null,
      company_name: "",
      company_id: null,
      location_name: "",
      location_id: null,
      applicability_id: null,
      register_id: null,
      register_name: "",
      applicability_location_name: "",
      applicability_location_id: null,
    });
  const [applicabilityModal, setApplicabilityModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [issnackbarsOpen, setIsSnackbarsOpen] = useState({
    open: false,
    vertical: "top",
    horizontal: "center",
    message: "",
    severityType: "",
    showProgress: false,
  });
  const [dataById, setDataById] = useState({
    applicabilityByLocationId: [],
    applicabilityByCompanyId: [],
    applicabilityByGroupId: [],
  })
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [source, setSource] = useState(null);
  const [steps, setSteps] = useState([]);
  const gridRef = useRef();
  const [filteredData, setFilteredData] = useState([]);

  const handleFilterApply = (filters) => {
    if (!filters || Object.keys(filters).length === 0) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(row =>
      Object.entries(filters).every(([column, values]) =>
        values.includes(row[column])
      )
    );

    setFilteredData(filtered);
  };


  // "location" | "company" | "group"
  // const [columnDefs, setColumnDefs] = useState([]);
  const data = useMemo(() => {
    if (source === "location") {
      return dataById.applicabilityByLocationId;
    } else if (source === "company") {
      return dataById.applicabilityByCompanyId;
    } else if (source === "group") {
      return dataById.applicabilityByGroupId;
    } else {
      return [];
    }
  }, [source, dataById]);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAllGroupHolding();
        setGroupHoldingName(data);
        const locationNameData = await fetchAllLocationName();
        setLocationName(locationNameData || []);
        const registerNameData = await fetchAllRegisterNames();
        setRegisterName(registerNameData || []);
      } catch {
        // console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

    useEffect(() => {
        if (isModalOpen === false) {
            setCurrent((prev) => ({
                ...prev,
                applicability_id: null,
            }));
            setSteps([]);
        }
        if (current?.applicability_id) {
            const fetchPipeline = async () => {
                try {
                    const pipelineData = await getPipelineByApplicabilityId(
                        current.applicability_id,
                    );
                    setSteps(pipelineData?.config?.steps || []);
                    setIsEditing(pipelineData?.config?.steps?.length > 0);
                } catch {
                    setSteps([]);
                    setIsEditing(false);
                }
            };
            fetchPipeline();
        }
    }, [isModalOpen, current?.applicability_id]);
    useEffect(() => {
        const fetchCompany = async () => {
            const data = await fetchCompaniesNameByGroupId(current?.group_holding_id);
            const applicabilityByGroupId = await getApplicabilityByGroupId(current?.group_holding_id);

      setCompanyName(data || []);
      setDataById(prev => ({
        ...prev,
        applicabilityByGroupId: applicabilityByGroupId || []
      }));

      setSource("group");
    };

    if (current?.group_holding_id) {
      fetchCompany();
    } else {
      //Group None case
      setSource(null);
      setCompanyName([]);
      setLocationNameByCompanyId([]);
      setDataById(prev => ({
        ...prev,
        applicabilityByGroupId: [],
        applicabilityByCompanyId: [],
        applicabilityByLocationId: []
      }));
    }
  }, [current?.group_holding_id]);

    useEffect(() => {
        const fetchLocationByCompanyId = async () => {
            try {
                const data = await getLocationByCompanyId(current?.company_id);
                const applicabilityByCompanyId = await getApplicabilityByCompanyId(current?.company_id);
                if (data) {
                    setLocationNameByCompanyId(data);
                    setDataById((prev) => ({ ...prev, applicabilityByCompanyId: applicabilityByCompanyId || [] }));
                    setSource("company");
                }
            } catch {
                setDataById((prev) => ({ ...prev, applicabilityByCompanyId: [] }));
            }
        };

    if (current?.company_id) {
      fetchLocationByCompanyId();
    }
  }, [current?.company_id]);

  useEffect(() => {
    const fetchApplicabilityByLocationId = async () => {
      try {
        const data = await getApplicabilityByLocationId(current?.location_id);

        setDataById((prev) => ({
          ...prev,
          applicabilityByLocationId: data || []
        }));

        setSource("location");
      } catch {
        setDataById((prev) => ({
          ...prev,
          applicabilityByLocationId: []
        }));
        // setSource("");
      }
    };

    if (current?.location_id) {
      fetchApplicabilityByLocationId();
    }
  }, [current?.location_id]);

  const generateDynamicColDefs = (data) => {
    if (!data || data.length === 0) return [];

    const sample = flattenObject(data[0]);

    return Object.keys(sample)
      .map((key) => {
        if (
          key === "_id" ||
          key === "common_attributes.is_deleted" ||
          key === "common_attributes.deleted_by" ||
          key === "common_attributes.deleted_at"
        )
          return null;

        return {
          field: key,
          headerName: key
            .split(".")
            .pop()
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          filter: true,
          editable: false,
          valueGetter: (params) => {
            return key
              .split(".")
              .reduce((acc, part) => acc?.[part], params.data);
          },
        };
      })
      .filter(Boolean);
  };


  const handleDelete = async () => {
    try {
      const result = await deleteApplicabilityById(current?.applicability_id);

      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: result?.message || "Applicability deleted successfully!",
        severityType: "success",
      });

      setIsDeleteModalOpen(false);

    } catch (error) {
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: error?.response?.data?.message || "Failed to delete applicability.",
        severityType: "error",
      });
    }
    setIsDeleteModalOpen(false)
  };

  const columnDefs = useMemo(() => {
    if (!data.length) return [];

    const actionCol = {
      flex: 0,
      width: 130,
      minWidth: 130,
      maxWidth: 130,
      headerName: 'Actions',
      field: 'actions',
      pinned: 'left',
      cellStyle: { backgroundColor: 'rgb(252 229 205 / 64%)' },
      editable: false,
      cellRenderer: (params) => (
        <div className="d-flex justify-content-around align-items-center">
          <button
            className="btn btn-sm"
            onClick={() => {
              setIsEditing(true);
              setApplicabilityModal(true);
              setCurrent((prev) => ({
                ...prev,
                applicability_id: params.data.applicability_id,
              }));
            }}
          >
            <EditIcon fontSize="small" className="action_icon" />
          </button>

          <button
            className="btn btn-sm"
            onClick={() => {
              setCurrent((prev) => ({
                ...prev,
                applicability_id: params.data.applicability_id,
              }));
              setIsModalOpen(true);
            }}
          >
            <Plus fontSize="small" className="action_icon" />
          </button>
          <button
            className="btn btn-sm"
            onClick={() => {
              setCurrent((prev) => ({
                ...prev,
                applicability_id: params.data.applicability_id,
              }));
              setIsDeleteModalOpen(true);
            }}
          >
            <DeleteIcon fontSize="small" className="action_icon" />
          </button>
        </div>
      )
    };


    return [
      actionCol,
      ...generateDynamicColDefs(data),
      // statusCol
    ];
  }, [data]);


  const openModal = () => {
    setApplicabilityModal(true);
  };

  const closeModal = () => {
    setApplicabilityModal(false);
    setCurrent((prev) => ({
      ...prev,
      applicability_location_name: "",
      applicability_location_id: "",
      register_name: "",
      register_id: "",
      applicability_id: "",
    }));
    setUploadedFiles([]);
  };
  const handleApplicability = async () => {
    const payload = {
      location_id: current?.applicability_location_id,
      register_id: current?.register_id,
    };
    try {
      let result;

      if (isEditing) {
        result = await updateApplicabilityById(
          current.applicability_id,
          payload
        );
      } else {
        result = await createApplicability(payload);
      }

      const message =
        result?.message ||
        (isEditing
          ? "Applicability updated successfully!"
          : "Applicability created successfully!");

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
        message:
          error?.response?.data?.message ||
          (isEditing
            ? "Failed to update applicability."
            : "Failed to create applicability."),
        severityType: "error",
      });
    }

    setCurrent((prev) => ({
      ...prev,
      applicability_location_name: "",
      applicability_location_id: "",
      register_name: "",
      register_id: "",
      applicability_id: "",
    }));

    setApplicabilityModal(false);
  };

  const applicabilityForm = () => {
    return (
      <div>
        <div className="">
          <span>
            <div className="d-flex gap-3">
              <SingleSelectTextField
                name="applicability_location_name"
                label="Location"
                value={current.applicability_location_name}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const matchedLocation = locationName.find(
                    (g) => g.name === selectedName
                  );
                  setCurrent((prev) => ({
                    ...prev,
                    applicability_location_name: selectedName,
                    applicability_location_id: matchedLocation?._id || null,
                  }));
                }}
                names={locationName}
              />

              <SingleSelectTextField name="register_name" label="Register" value={current?.register_name}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const matchedRegister = registerName.find(
                    (g) => g.register_name === selectedName
                  );
                  setCurrent((prev) => ({
                    ...prev,
                    register_name: selectedName,
                    register_id: matchedRegister?._id || null,
                  }));
                }}
                names={registerName.map((item) => ({
                  _id: item._id,
                  name: item.register_name,
                }))}
              />

            </div>
          </span>
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
              onClick={handleApplicability}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  const defaultColDef = {
    resizable: true,
    flex: 1,
    minWidth: 140,
    sortable: true,
    filter: true,
    editable: true,
    headerStyle: { color: '#515151', backgroundColor: '#ffffe24d' },
  };

  const onFilterTextBoxChanged = useCallback(() => {
    gridRef.current.api.setGridOption(
      'quickFilterText',
      document.getElementById('filter-text-box').value
    );
  }, []);
  const handlePipelineformSubmit = async () => {
    const payload = { applicability_id: current?.applicability_id, config: { steps } };

    try {
      let result;

      if (isGeneratePipeline) {
        setUploadStatus("pending");

        setIsSnackbarsOpen({
          open: true,
          vertical: "top",
          horizontal: "center",
          message: "Please wait, your mapping is generating. Don't refresh the page.",
          severityType: "info",
          showProgress: true,
        });
        result = await generateAIMapping(uploadedFiles, current?.applicability_id);

        if (result?.status === "COMPLETED") {
          setUploadStatus("success");
          setSteps(result?.config?.steps || []);

          setIsSnackbarsOpen({
            open: true,
            vertical: "top",
            horizontal: "center",
            message: result?.message || "Mapping generated successfully!",
            severityType: "success",
            showProgress: false,
          });
          setUploadedFiles([]);
        } else if (result?.status === "FAILED") {
          setUploadStatus("error");

          setIsSnackbarsOpen({
            open: true,
            vertical: "top",
            horizontal: "center",
            message: result?.message || "Mapping generation failed.",
            severityType: "error",
            showProgress: false,
          });
        }

      } else if (isEditing) {
        result = await updateMappingById(current?.applicability_id, payload);
        setUploadStatus("success");

        setIsSnackbarsOpen({
          open: true,
          vertical: "top",
          horizontal: "center",
          message: result?.message || "Updated successfully!",
          severityType: "success",
        });

      } else {
        result = await createMapping(payload);
        setUploadStatus("success");

        setIsSnackbarsOpen({
          open: true,
          vertical: "top",
          horizontal: "center",
          message: result?.message || "Created successfully!",
          severityType: "success",
        });
      }

    } catch (e) {
      setUploadStatus("error");

      setIsSnackbarsOpen({
        open: true,
        vertical: "top",
        horizontal: "center",
        message: e?.response?.data?.message || "Something went wrong.",
        severityType: "error",
      });
    }
  };
  const handleDeletePipeline = async () => {
    try {
      const result = await deleteMappingById(current?.applicability_id);
      setIsSnackbarsOpen({
        open: true,
        vertical: "top",
        horizontal: "center",
        message: result?.message || "Mapping deleted successfully!",
        severityType: "success",
      });
    } catch (e) {
      setIsSnackbarsOpen({
        open: true,
        vertical: "top",
        horizontal: "center",
        message: e?.response?.data?.message || "Failed to delete mapping.",
        severityType: "error",
      });
    }
    setIsModalOpen(false);
  };
  const deleteModal = () => {
    return (
      <div>
        <div className='delete_message p-4'>
          Are you sure you want to delete <DeleteIcon className='action_icon' /> this applicability?
        </div>

        <div className="row row-gap-2 mt-4">
          <div className='col-6'>
            <button
              type="button"
              className="btn-sm btn btn-secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </button>
          </div>
          <div className='col-6 d-flex justify-content-end'>
            <button
              type="button"
              className="btn-sm btn btn-primary"
              onClick={handleDelete}
            >
              Yes, I'm sure
            </button>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="app-container">
      <Snackbars
        issnackbarsOpen={issnackbarsOpen}
        setIsSnackbarsOpen={setIsSnackbarsOpen}
        uploadStatus={uploadStatus}

      />
      <DeleteModal
        deleteForm={deleteModal}
        deleteTitle='Delete Applicability'
        isModalOpen={isDeleteModalOpen}
        setIsModalOpen={setIsDeleteModalOpen}
      />
      <div className="service-tracker-inner-page-header d-flex justify-content-between">
        <h1>Register Applicability</h1>
        <button className="crud_btn" onClick={() => {
          setIsEditing(false);
          openModal();
        }}>
          Create Applicability
        </button>
      </div>
      <div className="mapping-container d-flex gap-3">
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
            dataById.applicabilityByGroupId.length > 0 ? setSource("group") : "";
          }}
          names={groupHoldingName}
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
              location_name: '',
              location_id: null,
            }));

            // 🔥 Fallback
            if (matchedCompany?._id) {
              setSource("company");
            } else if (current?.group_holding_id) {
              setSource("group");
            }
          }}
          names={companyName.map((item) => ({
            _id: item._id,
            name: item.company_name,
          }))}
        />
        <SingleSelectTextField name="location_name" label="Location" value={current?.location_name}
          onChange={(e) => {
            const selectedName = e.target.value;
            const matchedLocation = locationNameByCompanyId.find(
              (g) => g.location_name === selectedName
            );

            setCurrent((prev) => ({
              ...prev,
              location_name: selectedName,
              location_id: matchedLocation?._id || null,
            }));

            // 🔥 Source fallback logic
            if (matchedLocation?._id) {
              setSource("location");
            } else if (current?.company_id) {
              setSource("company");
            } else if (current?.group_holding_id) {
              setSource("group");
            }
          }}
          names={locationNameByCompanyId.map((item) => ({
            _id: item._id,
            name: item.location_name,
          }))}
        />
      </div>
      <div className='table_div p-3'>
        <div className='d-flex align-items-center gap-2'>
          <AnimatedSearchBar
            placeholder="Search..."
            type="text"
            id="filter-text-box"
            onInput={onFilterTextBoxChanged}
          />

          <MultiSelectFilter
            rowData={data}
            filterColumns={["state"]}
            onFilterApply={handleFilterApply}
          />
        </div>

        <div
          className="ag-theme-quartz"
          style={{ height: '600px', width: '100%', marginTop: '1rem' }}
        >
          <AgGridReact
            theme="legacy"
            ref={gridRef}
            rowData={filteredData.length ? filteredData : data}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            editType="fullRow"
            rowSelection="single"
            pagination={true}
          />
        </div>
      </div>
      {isGeneratePipeline ? (
        <RegisterMappingPageWithAi
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setUploadedFiles([]);

          }}
          handlePipelineformSubmit={handlePipelineformSubmit}
          handleDeletePipeline={handleDeletePipeline}
          isEditing={isEditing}
          setIsGeneratePipeline={setIsGeneratePipeline}
          isGeneratePipeline={isGeneratePipeline}
          setUploadedFiles={setUploadedFiles}
          uploadedFiles={uploadedFiles}
        />
      ) : (
        <RegisterMappingPage
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setUploadedFiles([]);

          }}
          setSteps={setSteps}
          steps={steps}
          handlePipelineformSubmit={handlePipelineformSubmit}
          handleDeletePipeline={handleDeletePipeline}
          isEditing={isEditing}
          setIsGeneratePipeline={setIsGeneratePipeline}
          isGeneratePipeline={isGeneratePipeline}
          setUploadedFiles={setUploadedFiles}
          uploadedFiles={uploadedFiles}
          uploadStatus={uploadStatus}
        />
      )}


      <SmallSizeModal
        crudForm={applicabilityForm}
        crudTitle={"Create Applicability"}
        isEditing={isEditing}
        editCrudTitle={"Edit Applicability"}
        isModalOpen={applicabilityModal}
        setIsModalOpen={setApplicabilityModal}
        closeModal={closeModal}
      />
    </div>
  )
}

export default RegisterProcessingViewPage