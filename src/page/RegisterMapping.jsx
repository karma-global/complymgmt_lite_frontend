import { useState } from "react";
import "../style/registerMapping.css";
import { createMapping } from "../api/service";
import Snackbars from "../component/Snackbars";
export default function RegisterMapping() {
  const [steps, setSteps] = useState([]);
  const [issnackbarsOpen, setIsSnackbarsOpen] = useState({
    open: false,
    vertical: "top",
    horizontal: "center",
    message: "",
    severityType: "",
  });
  const addStep = () => setSteps([...steps, { type: "", config: {} }]);
  const deleteStep = (index) => setSteps(steps.filter((_, i) => i !== index));

  const handleTypeChange = (index, type) => {
    let config = {};
    if (type === "transform") config = { transform: { mappings: [] } };
    else if (type === "filter") config = { filter: { expression: "" } };
    else if (type === "pivot")
      config = { pivot: { row_fields: [], value_fields: [], field_aggregations: {}, column_names: {} } };
    const updated = [...steps];
    updated[index] = { type, config };
    setSteps(updated);
  };

  const updateStep = (index, newStep) => {
    const updated = [...steps];
    updated[index] = newStep;
    setSteps(updated);
  };

  const typeLabel = { transform: "TRANSFORM", filter: "FILTER", pivot: "PIVOT" };
  const handleSubmit = async () => {
    const payload = { steps };
    try{
     const result = await createMapping(payload);
      setIsSnackbarsOpen({
        open: true,
        vertical: "top",
        horizontal: "center",
        message: result?.message || "Mapping created successfully!",
        severityType: "success",
      });
    }catch(e){
      setIsSnackbarsOpen({
        open: true,
        vertical: "top",
        horizontal: "center",
        message: e?.message || "Failed to create mapping.",
        severityType: "error",
      });
    }
  };
  return (
    <>
      <Snackbars
        issnackbarsOpen={issnackbarsOpen}
        setIsSnackbarsOpen={setIsSnackbarsOpen}
      />
      <div className="app-container">
        <div className="service-tracker-inner-page-header d-flex justify-content-between">
          <div className="pb-header">
            <div className="pb-header-icon">
              <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="4" cy="4" r="2" fill="#0d0d0f" />
                <circle cx="14" cy="4" r="2" fill="#0d0d0f" />
                <circle cx="4" cy="14" r="2" fill="#0d0d0f" />
                <circle cx="14" cy="14" r="2" fill="#0d0d0f" />
                <line x1="4" y1="6" x2="4" y2="12" stroke="#0d0d0f" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="6" y1="4" x2="12" y2="4" stroke="#0d0d0f" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="6" y1="14" x2="12" y2="14" stroke="#0d0d0f" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h1>Pipeline Builder</h1>
            </div>
          </div>
          <button type="submit" className="crud_btn" onClick={addStep}> + Add Step</button>
          
        </div>
        <div >
          <div className="pb-steps">
            {steps.length === 0 && (
              <div className="pb-empty">
                <div className="pb-empty-icon">⬡</div>
                No steps yet — click "Add Step" to begin
              </div>
            )}
            {steps.map((step, index) => (
              <div key={index} className="pb-card">
                <div className="pb-card-header">
                  <span className="pb-step-badge">STEP {String(index + 1).padStart(2, "0")}</span>
                  <div className="pb-card-header-right">
                    <select
                      className="pb-select"
                      value={step.type}
                      onChange={(e) => handleTypeChange(index, e.target.value)}
                    >
                      <option value="">Select type</option>
                      <option value="transform">Transform</option>
                      <option value="filter">Filter</option>
                      <option value="pivot">Pivot</option>
                    </select>
                    <button className="pb-delete-btn" onClick={() => deleteStep(index)} title="Delete step">
                      ✕
                    </button>
                  </div>
                </div>

                {step.type && (
                  <div className="pb-card-body">
                    <div className="pb-section-title">{typeLabel[step.type] || step.type}</div>
                    {step.type === "transform" && (
                      <TransformUI step={step} update={(ns) => updateStep(index, ns)} />
                    )}
                    {step.type === "filter" && (
                      <FilterUI step={step} update={(ns) => updateStep(index, ns)} />
                    )}
                    {step.type === "pivot" && (
                      <PivotUI step={step} update={(ns) => updateStep(index, ns)} />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="row row-gap-2 mt-3 justify-content-lg-end justify-content-md-end justify-content-center">
            <div className="col-12 col-md-6 w-auto">
              <button type="button" className="btn btn-secondary w-100" >Cancel</button>
            </div>
            <div className="col-12 col-md-6 w-auto">
              <button type="submit" className="btn btn-primary w-100" onClick={handleSubmit}>Save</button>
            </div>
          </div>
          {/* <div className="pb-json-section">
            <div className="pb-json-title"><span>OUTPUT JSON</span></div>
            <pre className="pb-pre">{JSON.stringify({ steps }, null, 2)}</pre>
          </div> */}
        </div>
      </div>

    </>
  );
}

function ArrayInput({ label, values = [], onChange }) {
  const addItem = () => onChange([...values, ""]);
  const updateItem = (i, val) => { const u = [...values]; u[i] = val; onChange(u); };
  const removeItem = (i) => onChange(values.filter((_, idx) => idx !== i));

  return (
    <div style={{ marginBottom: 12 }}>
      <label className="pb-label">{label}</label>
      {values.map((val, i) => (
        <div key={i} className="pb-row">
          <input className="pb-input" value={val} onChange={(e) => updateItem(i, e.target.value)} placeholder="field name" />
          <button className="pb-delete-btn" style={{ width: 28, height: 28, fontSize: 12 }} onClick={() => removeItem(i)}>✕</button>
        </div>
      ))}
      <button className="pb-sm-btn" onClick={addItem}>+ add</button>
    </div>
  );
}

function AggregationInput({ value = {}, onChange }) {
  const addField = () => onChange({ ...value, "": [""] });
  const updateKey = (oldKey, newKey) => { const u = { ...value }; u[newKey] = u[oldKey]; delete u[oldKey]; onChange(u); };
  const updateAgg = (key, idx, val) => { const u = { ...value }; u[key][idx] = val; onChange(u); };
  const addAgg = (key) => { const u = { ...value }; u[key].push(""); onChange(u); };
  const removeAgg = (key, idx) => { const u = { ...value }; u[key].splice(idx, 1); onChange(u); };
  const removeField = (key) => { const u = { ...value }; delete u[key]; onChange(u); };

  return (
    <div>
      <div className="pb-h4">Field Aggregations</div>
      {Object.keys(value).map((key, i) => (
        <div key={i} className="pb-inner-card">
          <div className="pb-agg-key-row">
            <label className="pb-label" style={{ marginBottom: 0, width: 80, flexShrink: 0 }}>Field</label>
            <input className="pb-input" style={{ marginBottom: 0 }} value={key} placeholder="field name" onChange={(e) => updateKey(key, e.target.value)} />
          </div>
          <div style={{ marginTop: 8 }}>
            {value[key].map((agg, j) => (
              <div key={j} className="pb-row">
                <select className="pb-select" style={{ flex: 1 }} value={agg} onChange={(e) => updateAgg(key, j, e.target.value)}>
                  <option value="">Select aggregation</option>
                  <option value="COUNT">COUNT</option>
                  <option value="AVERAGE">AVERAGE</option>
                  <option value="SUM">SUM</option>
                </select>
                <button className="pb-delete-btn" style={{ width: 28, height: 28, fontSize: 12 }} onClick={() => removeAgg(key, j)}>✕</button>
              </div>
            ))}
          </div>
          <div className="pb-btn-row">
            <button className="pb-sm-btn" onClick={() => addAgg(key)}>+ aggregation</button>
            <button className="pb-danger-btn" onClick={() => removeField(key)}>remove field</button>
          </div>
        </div>
      ))}
      <button className="pb-sm-btn" onClick={addField}>+ add field</button>
    </div>
  );
}

function ColumnNamesInput({ fieldAggregations, value = {}, onChange }) {
  const generatedKeys = [];
  Object.keys(fieldAggregations).forEach((field) => {
    fieldAggregations[field].forEach((agg) => { if (agg) generatedKeys.push(`${field}_${agg}`); });
  });
  const updateValue = (key, val) => onChange({ ...value, [key]: val });

  if (generatedKeys.length === 0) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <div className="pb-h4">Column Names</div>
      {generatedKeys.map((key, i) => (
        <div key={i} className="pb-row" style={{ alignItems: "center" }}>
          <input className="pb-input" style={{ marginBottom: 0 }} value={key} disabled />
          <span style={{ color: "#333", flexShrink: 0, fontSize: 14 }}>→</span>
          <input className="pb-input" style={{ marginBottom: 0 }} placeholder="display name" value={value[key] || ""} onChange={(e) => updateValue(key, e.target.value)} />
        </div>
      ))}
    </div>
  );
}

function TransformUI({ step, update }) {
  const mappings = (step.config.transform && step.config.transform.mappings) || [];

  const addMapping = () => {
    update({ ...step, config: { transform: { mappings: [...mappings, { source: [], target: "", transformation: "", expression: "" }] } } });
  };

  const updateMapping = (i, key, val) => {
    const nm = [...mappings]; nm[i][key] = val;
    update({ ...step, config: { transform: { mappings: nm } } });
  };

  const removeMapping = (i) => {
    update({ ...step, config: { transform: { mappings: mappings.filter((_, idx) => idx !== i) } } });
  };

  return (
    <div>
      {mappings.map((map, i) => (
        <div key={i} className="pb-inner-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#555", letterSpacing: 1 }}>MAPPING {i + 1}</span>
            <button className="pb-danger-btn" onClick={() => removeMapping(i)}>remove</button>
          </div>
          <ArrayInput label="Source Fields" values={map.source} onChange={(val) => updateMapping(i, "source", val)} />
          <label className="pb-label">Target</label>
          <input className="pb-input" placeholder="target field name" value={map.target} onChange={(e) => updateMapping(i, "target", e.target.value)} />
          <label className="pb-label">Transformation</label>
          <select className="pb-select" style={{ width: "100%", marginBottom: 8 }} value={map.transformation} onChange={(e) => updateMapping(i, "transformation", e.target.value)}>
            <option value="">Select transformation</option>
            <option value="DIRECT">DIRECT</option>
            <option value="CONCAT">CONCAT</option>
            <option value="ARITHMETIC">ARITHMETIC</option>
          </select>
          <label className="pb-label">Expression</label>
          <input className="pb-input" placeholder="e.g. field1 + field2" value={map.expression} onChange={(e) => updateMapping(i, "expression", e.target.value)} />
        </div>
      ))}
      <button className="pb-sm-btn" onClick={addMapping}>+ add mapping</button>
    </div>
  );
}

function FilterUI({ step, update }) {
  return (
    <div>
      <label className="pb-label">Filter Expression</label>
      <input
        className="pb-input"
        placeholder="e.g. Average >= 60"
        value={step.config.filter.expression}
        onChange={(e) => update({ ...step, config: { filter: { expression: e.target.value } } })}
      />
    </div>
  );
}

function PivotUI({ step, update }) {
  const pivot = step.config.pivot;
  return (
    <div>
      <ArrayInput label="Row Fields" values={pivot.row_fields}
        onChange={(val) => update({ ...step, config: { pivot: { ...pivot, row_fields: val } } })}
      />
      <div className="pb-divider" />
      <ArrayInput label="Value Fields" values={pivot.value_fields}
        onChange={(val) => {
          const newAgg = { ...pivot.field_aggregations };
          val.forEach((f) => { if (!newAgg[f]) newAgg[f] = []; });
          Object.keys(newAgg).forEach((k) => { if (!val.includes(k)) delete newAgg[k]; });
          update({ ...step, config: { pivot: { ...pivot, value_fields: val, field_aggregations: newAgg } } });
        }}
      />
      <div className="pb-divider" />
      <AggregationInput value={pivot.field_aggregations}
        onChange={(val) => update({ ...step, config: { pivot: { ...pivot, field_aggregations: val } } })}
      />
      <ColumnNamesInput fieldAggregations={pivot.field_aggregations} value={pivot.column_names}
        onChange={(val) => update({ ...step, config: { pivot: { ...pivot, column_names: val } } })}
      />
    </div>
  );
}