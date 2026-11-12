import { useEffect, useState } from 'react'
import '../style/servicetrackeraccess.css'
import {
    createServiceTrackerSpecifics,
    fetchAllServiceTrackerFields,
    fetchAllServiceTrackerName
} from '../api/service'
import Snackbars from '../component/Snackbars'

export default function ServiceTrackerAccess() {
    const [trackers, setTrackers] = useState([])
    const [selectedTracker, setSelectedTracker] = useState(null)
    const [selectedKey, setSelectedKey] = useState('')
    const [checkedValues, setCheckedValues] = useState({})
    const [trackerKeys, setTrackerKeys] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [trackersError, setTrackersError] = useState('')
    const [issnackbarsOpen, setIsSnackbarsOpen] = useState({
        open: false,
        vertical: "top",
        horizontal: "center",
        message: "",
        severityType: "",
    });

    // format name
    const formatTrackerName = (name) =>
        name?.toLowerCase().replace(/\s+/g, '_')

    // ✅ fetch tracker names
    useEffect(() => {
        const getTrackers = async () => {
            try {
                const data = await fetchAllServiceTrackerName()
                setTrackers(data || []) 
            } catch (err) {
                setTrackersError(err?.response?.data?.message || 'Failed to load trackers')
            }
        }
        getTrackers()
    }, [])

    // ✅ fetch tracker fields
    const fetchTrackerKeys = async (trackerName) => {
        setLoading(true)
        setError('')
        setSelectedKey('')
        setTrackerKeys(null)

        try {
            const formattedName = formatTrackerName(trackerName)
            const data = await fetchAllServiceTrackerFields(formattedName)
            setTrackerKeys(data?.tracker_keys || {})
        } catch (err) {
            setError(err?.response?.data?.message || err.message || 'Failed to fetch tracker keys')
        } finally {
            setLoading(false)
        }
    }

    // ✅ tracker change
    const handleTrackerChange = (tracker) => {
        setSelectedTracker(tracker)
        setCheckedValues({})
        fetchTrackerKeys(tracker.name)
    }

    const handleKeySelect = (key) => {
        setSelectedKey(key)
    }

    const toggleValue = (key, value) => {
        setCheckedValues((prev) => {
            const current = prev[key] || []
            const exists = current.includes(value)

            return {
                ...prev,
                [key]: exists
                    ? current.filter((v) => v !== value)
                    : [...current, value],
            }
        })
    }

    const handleSelectAll = (key, values) => {
        const current = checkedValues[key] || []
        const allSelected = values.every((v) => current.includes(v))

        setCheckedValues((prev) => ({
            ...prev,
            [key]: allSelected ? [] : [...values],
        }))
    }

    // ✅ SAVE
    const handleSave = async () => {
        try {
            const selectedFields = Object.values(checkedValues).flat()

            if (!selectedTracker?._id) {
                return setIsSnackbarsOpen({
                    ...issnackbarsOpen,
                    open: true,
                    message: "Please select a tracker.",
                    severityType: "warning",
                });
            }

            const payload = {
                service_tracker_id: selectedTracker._id,
                external_access: selectedFields
            }

            const res = await createServiceTrackerSpecifics(payload)
            setIsSnackbarsOpen({
                ...issnackbarsOpen,
                open: true,
                message: res?.message || 'Saved successfully',
                severityType: 'success'
            })
            setCheckedValues({})
            setSelectedTracker(null)
            setSelectedKey('')
        } catch (err) {
            setIsSnackbarsOpen({
                ...issnackbarsOpen,
                open: true,
                message: err?.response?.data?.message || 'Something went wrong',
                severityType: 'error'
            })
        }
    }

    const currentValues =
        selectedKey && trackerKeys ? trackerKeys[selectedKey] : null

    const allSelected =
        currentValues &&
        currentValues.every((v) =>
            (checkedValues[selectedKey] || []).includes(v)
        )

    const allCheckedEntries = []
    Object.entries(checkedValues).forEach(([key, values]) => {
        values.forEach((v) => allCheckedEntries.push({ key, value: v }))
    })

    return (
        <div className="tracker-page">
            <Snackbars
                issnackbarsOpen={issnackbarsOpen}
                setIsSnackbarsOpen={setIsSnackbarsOpen}
            />

            <div className="tracker-container">
                <div className='service-tracker-inner-page-header d-lg-flex d-md-flex'>
                    <div className="notification-page-title">
                        <div>
                            <h1>Service Tracker Access For User</h1>
                            <p className=''>Choose a tracker name to see available columns options</p>
                        </div>
                    </div>
                    <div className='d-lg-flex d-md-flex gap-2 mt-2'>
                        <div className='d-flex justify-content-end'>
                            <button className='crud_btn' onClick={handleSave}>
                                <span className='button-style'>Save Tracker Access</span>
                            </button>
                        </div>

                    </div>
                </div>
                <div className="card">

                    {/* Step 1 */}
                    <div className="card-section">
                        <div className="section-label">Step 1 — Select Tracker</div>
                        {trackersError && <div className="error-message">{trackersError}</div>}

                        <div className="radio-group">
                            {trackers.map((tracker) => (
                                <div key={tracker._id} className="radio-option">
                                    <input
                                        type="radio"
                                        id={tracker._id}
                                        name="tracker"
                                        checked={selectedTracker?._id === tracker._id}
                                        onChange={() => handleTrackerChange(tracker)}
                                    />
                                    <label htmlFor={tracker._id}>
                                        <span className="radio-dot">
                                            <span className="radio-dot-inner" />
                                        </span>
                                        {tracker.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/*Step 2 */}
                    {selectedTracker && (
                        <div className="card-section keys-section">
                            <div className="section-label">Step 2 — Select Sheet</div>

                            {loading ? (
                                <div className="loading-spinner">Loading...</div>
                            ) : error ? (
                                <div className="error-message">{error}</div>
                            ) : trackerKeys && Object.keys(trackerKeys).length > 0 ? (
                                <div className="key-tabs">
                                    {Object.keys(trackerKeys).map((key) => (
                                        <button
                                            key={key}
                                            className={`key-tab ${selectedKey === key ? 'active' : ''}`}
                                            onClick={() => handleKeySelect(key)}
                                        >
                                            {key}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="empty-hint">No categories available</p>
                            )}
                        </div>
                    )}

                    {/*Step 3 */}
                    {currentValues && currentValues.length > 0 && (
                        <div className="card-section values-section">
                            <div className="select-all-row">
                                <div className="section-label">Step 3 — Select Fields</div>

                                <button
                                    className="select-all-btn"
                                    onClick={() => handleSelectAll(selectedKey, currentValues)}
                                >
                                    {allSelected ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>

                            <div className="values-grid">
                                {currentValues.map((val) => {
                                    const isChecked =
                                        (checkedValues[selectedKey] || []).includes(val)

                                    return (
                                        <label
                                            key={val}
                                            className={`checkbox-option ${isChecked ? 'checked' : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => toggleValue(selectedKey, val)}
                                            />

                                            <span className="custom-checkbox">
                                                <svg className="checkmark" viewBox="0 0 12 12">
                                                    <path d="M2 6l3 3 5-5" />
                                                </svg>
                                            </span>

                                            <span className="checkbox-label">{val}</span>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/*Summary */}
                    {/* {totalSelected > 0 && (
            <div className="card-section selected-summary">
              <div className="section-label">
                Selected Fields ({totalSelected})
              </div>

              <div className="summary-chips">
                {allCheckedEntries.map(({ key, value }) => (
                  <span className="chip" key={`${key}-${value}`}>
                    <span className="chip-key">{key}</span>
                    <span className="chip-sep">›</span>
                    {value}
                  </span>
                ))}
              </div>
            </div>
          )} */}

                </div>
            </div>
        </div>
    )
}