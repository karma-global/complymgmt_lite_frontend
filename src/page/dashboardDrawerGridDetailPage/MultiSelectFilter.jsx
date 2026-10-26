import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Filter } from 'lucide-react';
import './MultiSelectFilter.css';
import { recordKeys } from '../../dashboards/common/dashboardUtils';

const MultiSelectFilter = ({ rowData: rawRows, onFilterApply, filterColumns = [] }) => {
  const rowData = Array.isArray(rawRows) ? rawRows.filter(Boolean) : [];
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [filters, setFilters] = useState({});
  const dropdownRef = useRef(null);

  // Only fields that came back in some row are offered (external users get a subset)
  const columns = rowData.length > 0
    ? recordKeys(rowData).filter(key => {
      // key === 'common_attributes' is a nested object that we don't want to show as a filter option
      if (key === '_id' || key === 'common_attributes' || key === 'ai_data') return false;
      if (!filterColumns.length) return true;
      return filterColumns.includes(key);
    })
    : [];


  const getUniqueValues = (columnName) => {
    // Array cells (a tracker's sub_module_name) offer each element as its own option
    const values = rowData.flatMap(row => row[columnName]).filter(Boolean);
    return Array.from(new Set(values)).sort();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedColumn(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColumnSelect = (column) => {
    setSelectedColumn(column);
  };

  const handleValueToggle = (column, value) => {
    setFilters(prev => {
      const currentValues = prev[column] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];

      if (newValues.length === 0) {
        const { [column]: _, ...rest } = prev;
        return rest;
      }

      return { ...prev, [column]: newValues };
    });
  };

  const handleApply = () => {
    onFilterApply(filters);
    setIsOpen(false);
    setSelectedColumn(null);
  };

  const handleClearAll = () => {
    setFilters({});
    onFilterApply({});
  };

  const getTotalSelectedCount = () => {
    return Object.values(filters).reduce((sum, values) => sum + values.length, 0);
  };

  const formatColumnName = (column) => {
    return column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="filter-container" ref={dropdownRef}>
      <button className="filter-button" onClick={() => setIsOpen(!isOpen)}>
        <Filter className="filter-icon" />
        <span className="filter-button-text">Filters</span>
        {getTotalSelectedCount() > 0 && (
          <span className="filter-count-badge">
            {getTotalSelectedCount()}
          </span>
        )}
        <ChevronDown className={`chevron-icon ${isOpen ? 'rotate' : ''}`} />
      </button>



      {isOpen && (
        <div className="filter-dropdown">
          <div className="dropdown-content">
            <div className="dropdown-columns">
              <div className="dropdown-header">
                <h3 className="dropdown-header-title">Columns</h3>
              </div>
              <div className="dropdown-column-list">
                {columns.map(column => (
                  <button
                    key={column}
                    onClick={() => handleColumnSelect(column)}
                    className={`dropdown-column-btn ${selectedColumn === column ? 'selected' : ''} ${filters[column]?.length > 0 ? 'selected' : ''}`}
                  >
                    <span>{formatColumnName(column)}</span>
                    {filters[column]?.length > 0 && (
                      <span className="filter-count-badge">
                        {filters[column].length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="dropdown-values">
              <div className="dropdown-header">
                <div className="dropdown-header-top">
                  <h3 className="dropdown-header-title">
                    {selectedColumn ? formatColumnName(selectedColumn) : 'Select a column'}
                  </h3>

                  {Object.keys(filters).length > 0 && (
                    <button
                      className="header-clear-btn"
                      onClick={handleClearAll}
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              <div className="dropdown-values-body">
                {selectedColumn ? (
                  <div className="dropdown-values-list">
                    {getUniqueValues(selectedColumn).map(value => (
                      <div key={value} className="dropdown-values-item">
                        <input
                          type="checkbox"
                          id={`${selectedColumn}-${value}`}
                          checked={filters[selectedColumn]?.includes(value) || false}
                          onChange={() => handleValueToggle(selectedColumn, value)}
                        />
                        <label htmlFor={`${selectedColumn}-${value}`}>
                          {value}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dropdown-empty-state">
                    Select a column to view values
                  </div>
                )}
              </div>

              <div className="dropdown-footer">
                <button className="dropdown-apply-btn" onClick={handleApply}>
                  Apply Filters
                </button>

                <button
                  className="dropdown-cancel-btn"
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedColumn(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
};

export default MultiSelectFilter;
