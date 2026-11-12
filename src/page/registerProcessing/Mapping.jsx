import MuiTextField from "../../component/MuiInputs/MuiTextField";
import SingleSelectTextField from "../../component/MuiInputs/SingleSelectTextField";
import ColumnDropdown from "./ColumnDropdown";
export default function Mapping({ mapping, onChange, onRemove }) {

  const handleSourceChange = (value, index) => {
    const newSources = [...mapping.Source];
    newSources[index] = value;
    onChange({ ...mapping, Source: newSources });
  };

  const addSource = () =>
    onChange({ ...mapping, Source: [...mapping.Source, ""] });

  const removeSource = (index) => {
    const newSources = mapping.Source.filter((_, i) => i !== index);
    onChange({ ...mapping, Source: newSources });
  };

  return (
    <div className="mapping-container">

      <div className="d-flex justify-content-end gap-2 mb-3">
        <button className="crud_btn" onClick={addSource}>+ Add Source</button>
        <button onClick={onRemove} className="btn btn-secondary">Remove Mapping</button>
      </div>

      {/* Target */}
      <MuiTextField
        label="Target"
        fieldName="target"
        value={mapping.Target}
        handleChange={(e) =>
          onChange({ ...mapping, Target: e.target.value })
        }
      />

      {/* Sources */}
      <div className="mapping-source">
        {mapping.Source.map((src, idx) => (
          <div key={idx} className="d-flex gap-2 align-items-center">
            <MuiTextField
              label={`Source ${idx + 1}`}
              fieldName="Source"
              value={src}
              handleChange={(e) =>
                handleSourceChange(e.target.value, idx)
              }
            />

            <button onClick={() => removeSource(idx)}>Remove</button>
          </div>
        ))}
      </div>


      <div className="d-flex gap-3">

        {/* Transform */}
        {/* <SingleSelectTextField
          label="Transform"
          value={mapping.Transform || ""}
          onChange={(e) =>
            onChange({ ...mapping, Transform: e.target.value })
          }
          // names={transformFieldOptions}
        /> */}
        <MuiTextField
          label="Transform"
          fieldName="transform"
          value={mapping.Transform}
          handleChange={(e) =>
            onChange({ ...mapping, Transform: e.target.value })
          }
        />

        {/* Default */}
        <MuiTextField
          label="Default"
          fieldName="default"
          value={mapping.Default}
          handleChange={(e) =>
            onChange({ ...mapping, Default: e.target.value })
          }
        />

        {/* Formula */}
        {mapping.Transform === "raw" && (
          <MuiTextField
            label="Formula"
            fieldName="formula"
            value={mapping.Formula}
            handleChange={(e) =>
              onChange({ ...mapping, Formula: e.target.value })
            }
          />
        )}

        {/* Separator */}
        {mapping.Transform === "concat" && (
          <MuiTextField
            label="Separator"
            fieldName="separator"
            value={mapping.Params?.sep || ""}
            handleChange={(e) =>
              onChange({
                ...mapping,
                Params: { sep: e.target.value },
              })
            }
          />
        )}

      </div>
    </div>
  );
}
