import React, { useState, useEffect } from "react";
import "../../style/registerProcessing.css";
import Mapping from "./Mapping";
import {
  createRegisterProcess,
  fetchAllCompaniesName,
  fetchAllRegisterNames,
  fetchFileByType,
  fetchRegisterMappingByName,
} from "../../api/service";
import SingleSelectTextField from "../../component/MuiInputs/SingleSelectTextField";
import Snackbars from "../../component/Snackbars";
import Modal from "../../component/Modal";
import ValidationRules from "./ValidationRules";
import ValidationCheckModal from "../../component/ValidationCheckModal";

function RegisterProcessing() {

  const [mappings, setMappings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState([]);
  const [registerNames, setRegisterNames] = useState([]);
  const [files, setFiles] = useState([]);
  const [issnackbarsOpen, setIsSnackbarsOpen] = useState({
    open: false,
    vertical: "top",
    horizontal: "center",
    message: "",
    severityType: "",
  });
  const [current, setCurrent] = useState({
    company_name: "",
    company_id: null,
    register_name: "",
    register_id: null,
    file_name: "",
    file_id: null,
    mappings: [],
    source: [],
    transform: "",
    transform_id: null,
    formula: "",
    params: {},
    default: "",
    target: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyRes, registerRes, filesRes] = await Promise.allSettled([
          fetchAllCompaniesName(),
          fetchAllRegisterNames(),
          fetchFileByType(),
        ]);

        if (companyRes.status === "fulfilled")
          setCompanyName(companyRes.value || []);
        if (registerRes.status === "fulfilled")
          setRegisterNames(registerRes.value || []);
        if (filesRes.status === "fulfilled") setFiles(filesRes.value || []);
      } catch {
        // Handle error
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchMappingData = async () => {
      try {
        const mappingRes = await fetchRegisterMappingByName(
          current.register_id,
          current.file_id
        );

        if (Array.isArray(mappingRes)) {
          const normalized = mappingRes.map((m) => ({
            id: Date.now() + Math.random(),
            Target: m.target || "",
            Source: m.source || [],
            Transform: m.transform || "",
            Formula: m.formula || "",
            Params: m.params || {},
            Default: m.default || "",
          }));

          setMappings(normalized);
        } else {
          setMappings([]);
        }
      } catch {
        setMappings([]);
      }
    };

    if (current.register_id && current.file_id) {
      fetchMappingData();
    }
  }, [current.register_id, current.file_id]);

  const addMapping = () => {
    setMappings((prev) => [
      ...prev,
      {
        id: Date.now(),
        Target: "",
        Source: [],
        Transform: "",
        Formula: "",
        Params: {},
        Default: "",
      },
    ]);
  };

  const updateMapping = (id, newMapping) => {
    setMappings((prev) => prev.map((m) => (m.id === id ? newMapping : m)));
  };

  const removeMapping = (id) => {
    setMappings((prev) => prev.filter((m) => m.id !== id));
  };

  const handleProceed = async (e) => {
    e?.preventDefault();

    const payload = {
      src_file_path: "document_repository",
      src_file_name: current.file_name,
      mappings: mappings.map((m) => ({
        target: m.Target || "",
        source: m.Source || [],
        transform: m.Transform || "",
        formula: m.Formula || "",
        params: m.Transform === "concat" ? { sep: m.Params?.sep || " " } : {},
        default: m.Default ?? "",
        unique: m.Transform === "unique",
      })),
    };

    try {
      // 🔥 This is already BLOB
      const blobData = await createRegisterProcess(payload);

      const blob = new Blob([blobData], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "report.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
      const message = blobData?.message || "Register processed successfully";
      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: message,
        severityType: 'success',
      });
      // setCurrent({
      //   company_name: "",
      //   company_id: null,
      //   register_name: "",
      //   register_id: null,
      //   file_name: "",
      //   file_id: null,
      //   mappings: [],
      //   source: [],
      //   transform: "",
      //   transform_id: null,
      //   formula: "",
      //   params: {},
      //   default: "",
      //   target: "",
      // });
      setIsModalOpen(true);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to process register";

      setIsSnackbarsOpen({
        ...issnackbarsOpen,
        open: true,
        message: errorMessage,
        severityType: 'error',
      });
    }
  };



  const handleClear = () => {
    setMappings([]);
  };
const closeModal = () => {
  setIsModalOpen(false);
};

  return (
    <div className="app-container">
        <ValidationCheckModal
        crudForm={<ValidationRules/>}
        crudTitle='Validation Checking'
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        closeModal={closeModal}
      />
      <Snackbars
        issnackbarsOpen={issnackbarsOpen}
        setIsSnackbarsOpen={setIsSnackbarsOpen}
      />
      <div className="service-tracker-inner-page-header d-flex justify-content-between">
        <h1>Register Processing</h1>

        <button className="crud_btn" onClick={addMapping}>
          + Add Mapping
        </button>
      </div>

      <div className="mapping-container d-flex gap-3">
        <SingleSelectTextField
          label="Company Name"
          value={current.company_name}
          onChange={(e) => {
            const selected = e.target.value;
            const matched = companyName.find((c) => c.name === selected) || {};
            setCurrent((prev) => ({
              ...prev,
              company_name: selected,
              company_id: matched._id || null,
            }));
          }}
          names={companyName.map((c) => ({ _id: c._id, name: c.name }))}
        />

        <SingleSelectTextField
          label="Register Name"
          value={current.register_name}
          onChange={(e) => {
            const selected = e.target.value;
            const matched =
              registerNames.find((r) => r.register_name === selected) || {};
            setCurrent((prev) => ({
              ...prev,
              register_name: selected,
              register_id: matched._id || null,
            }));
          }}
          names={registerNames.map((r) => ({
            _id: r._id,
            name: r.register_name,
          }))}
        />

        <SingleSelectTextField
          label="Document"
          value={current.file_name}
          onChange={(e) => {
            const selected = e.target.value;
            const matched = files.find((f) => f.file_name === selected) || {};
            setCurrent((prev) => ({
              ...prev,
              file_name: selected,
              file_id: matched.document_id || null,
            }));
          }}
          names={files.map((f) => ({ _id: f._id, name: f.file_name }))}
        />
      </div>

      {mappings.length > 0 ? (
        mappings.map((mapping) => (
          <Mapping
            key={mapping.id}
            mapping={mapping}
            onChange={(newMapping) => updateMapping(mapping.id, newMapping)}
            onRemove={() => removeMapping(mapping.id)}
            current={current}
            setCurrent={setCurrent}
          />
        ))
      ) : (
        <div className="text-center p-5">
          No mappings available. Click "Add Mapping".
        </div>
      )}

      <div className="d-flex justify-content-end gap-3 mt-4">
        <button
          className="crud_btn"
          onClick={handleProceed}
          disabled={mappings.length === 0}
        >
          Process
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleClear}
          disabled={mappings.length === 0}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default RegisterProcessing;
