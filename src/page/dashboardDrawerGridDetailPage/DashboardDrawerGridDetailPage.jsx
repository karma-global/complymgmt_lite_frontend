import React, { useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import MultiSelectFilter from "./MultiSelectFilter";
import { blankAsDash, recordKeys } from "../../dashboards/common/dashboardUtils";
ModuleRegistry.registerModules([AllCommunityModule]);

function DashboardDrawerGridDetailPage({ rowData: rawRows, filters = {} }) {
  const gridRef = useRef();
  // The records key may be missing from the response, and rows may be partial for external users
  const rowData = useMemo(() => (Array.isArray(rawRows) ? rawRows.filter(Boolean) : []), [rawRows]);
  const filteredRowData = useMemo(() => {
    if (Object.keys(filters).length === 0) return rowData;

    return rowData.filter((row) => {
      return Object.entries(filters).every(([column, values]) => {
        return values.includes(row[column]);
      });
    });
  }, [rowData, filters]);

  const columnDefs = useMemo(() => {
    if (!rowData.length) return [];

    return recordKeys(rowData)
      .filter((key) => key !== "_id")
      .map((key) => ({
        headerName: key.replace(/_/g, " ").toUpperCase(),
        field: key,
        valueFormatter: blankAsDash,
        sortable: true,
        filter: true,
        resizable: true,
      }));
  }, [rowData]);

  const defaultColDef = {
    resizable: true,
    flex: 1,
    minWidth: 150,
    floatingFilter: false,
    headerStyle: { color: "#515151", backgroundColor: "#ffffe24d" },
  };

  return (
    <div className="app-container">
      <div className="app-wrapper">
        <div className="app-card">
          <div className="app-filter-section">
          </div>

          <div
            className="ag-theme-quartz"
            style={{ height: "600px", width: "100%" }}
          >
            <AgGridReact
              ref={gridRef}
              theme="legacy"
              rowData={filteredRowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={20}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardDrawerGridDetailPage;
