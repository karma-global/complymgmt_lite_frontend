import { useCallback, useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import Snackbars from '../../component/Snackbars';
import DashboardDrawerGrid from '../DashboardDrawer';
import {
    fetchChallanRecords,
    fetchLicenseDashRecords,
    fetchRegisterDashRecords,
    fetchReturnsDashRecords,
} from '../../api/service';

// The drawer shows each module's rows. They come from the module dashboards' own /records
// endpoints (the old cockpit records endpoint was removed), reshaped to what the drawer reads:
// { challan|license|register|return: { records: row[], total } }
const fetchPaginatedRecords = async (page, limit) => {
    const toModule = (res) => ({ records: (res?.data || []).map((row) => row.record), total: res?.total ?? 0 });
    const [challan, license, register, returns] = await Promise.allSettled([
        fetchChallanRecords(page, limit),
        fetchLicenseDashRecords({ page, limit }),
        fetchRegisterDashRecords({ page, limit }),
        fetchReturnsDashRecords({ page, limit }),
    ]);
    const pick = (res) => (res.status === 'fulfilled' ? toModule(res.value) : { records: [], total: 0 });
    return { challan: pick(challan), license: pick(license), register: pick(register), return: pick(returns) };
};

// One page of one module for the drawer's paged grid: { records, total }
const fetchModulePage = async (module, page, limit) => {
    const fetchers = {
        Challans: () => fetchChallanRecords(page, limit),
        Licenses: () => fetchLicenseDashRecords({ page, limit }),
        Registers: () => fetchRegisterDashRecords({ page, limit }),
        Returns: () => fetchReturnsDashRecords({ page, limit }),
    };
    const res = await (fetchers[module] || fetchers.Returns)();
    return { records: (res?.data || []).map((row) => row.record), total: res?.total ?? 0 };
};

const GeneralComplianceDashboard = ({ data, shouldShow, page, limit, setActiveDrawer }) => {
    const [issnackbarsOpen, setIsSnackbarsOpen] = useState({
        open: false,
        vertical: "top",
        horizontal: "center",
        message: "",
        severityType: "",
    });
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerAnchor, setDrawerAnchor] = useState("right");
    const [filterColumns, setFilterColumns] = useState([]);
    const [isDetailPageDataFor, setIsDetailPageDataFor] = useState("Returns");
    const [paginatedData, setPaginatedData] = useState([]);
    // The drawer's paged grid loads the module picked in the drawer (Returns / Challans / ...)
    const fetchSelectedModulePage = useCallback(
        (pageNo, pageSize) => fetchModulePage(isDetailPageDataFor, pageNo, pageSize),
        [isDetailPageDataFor]
    );
    useEffect(() => {
        const fetchGeneralComplianceData = async () => {
            const results = await Promise.allSettled([
                fetchPaginatedRecords(page, limit),
            ]);

            const keys = [
                "paginatedRecords",
            ];

            const updatedData = {};

            results.forEach((res, index) => {
                updatedData[keys[index]] =
                    res.status === "fulfilled" ? res.value : [];
            });

            setPaginatedData(updatedData);
        };

        fetchGeneralComplianceData();
    }, [page, limit]);

    if (!data || Object.keys(data).length === 0) {
        return <div className='no-data'>{data === 403 ? 'No Data Found' : 'Loading...'}</div>;
    }

    // Payroll display items generated from data

    const challanData = {
        "completed": (data?.challans?.completed) ?? (data?.completed_challans),
        "pending": (data?.challans?.pending) ?? (data?.pending_challans),
        "total": (data?.challans?.total) ?? (data?.total_challans)
    }

    const payrollData = [
        {
            icon: '✔', label: 'Completed',
            value: challanData.completed,
            status: challanData.completed > 0 ? 'normal' : 'warning'
        },
        {
            icon: '⏳', label: 'Pending',
            value: (challanData.pending),
            status: (challanData.pending) > 0 ? 'normal' : 'muted'
        },
        {
            icon: '⏳', label: 'Total',
            value: (challanData.total),
            status: (challanData.total) > 0 ? 'normal' : 'muted'
        }
    ];

    const licenseData = {
        "active": (data?.licenses?.active) ?? (data?.active_licenses),
        "expired": (data?.licenses?.expired) ?? (data?.expired_licenses),
        "expiring": (data?.licenses?.expiring) ?? (data?.expiring_licenses),
        "inprogress": (data?.licenses?.inprogress) ?? (data?.inprogress_licenses),
        "total": (data?.licenses?.total) ?? (data?.total_licenses),
    }

    // Licenses Pie Chart
    const licensesChart = {
        series: [
            licenseData.active,
            licenseData.expired,
            licenseData.expiring,
            licenseData.inprogress
        ],
        options: {
            chart: { type: 'pie', height: 350 },
            labels: ['Active', 'Expired', 'Expiring', 'In Progress'],
            colors: ['#2E7D32', '#D32F2F', '#F57C00', '#1976D2'],
            legend: { position: 'bottom' },
            responsive: [
                {
                    breakpoint: 480,
                    options: { chart: { width: 200 }, legend: { position: 'bottom' } }
                }
            ]
        }
    };

    const registerData = {
        "applicable": (data?.registers?.applicable_registers) ?? (data?.applicable_registers),
        "available": (data?.registers?.available_registers) ?? (data.available_registers),
        "completed": (data?.registers?.completed_registers) ?? (data?.completed_registers),
        "missing": (data?.registers?.missing_registers) ?? (data?.missing_registers),
        "partial": (data?.registers?.partial_registers) ?? (data?.partial_registers)
    }

    // Registers Bar Chart
    const registersChart = {
        series: [{
            data: [
                registerData.applicable,
                registerData.available,
                registerData.completed,
                registerData.missing,
                registerData.partial
            ]
        }],
        options: {
            chart: { type: 'bar', height: 350 },
            plotOptions: { bar: { borderRadius: 4, horizontal: true } },
            dataLabels: { enabled: false },
            xaxis: { categories: ['Applicable', 'Available', 'Completed', 'Missing', 'Partial'] },
            title: { text: 'Registers' }
        }
    };

    // Returns Radial Bar Chart (fixed division by zero)
    // const totalReturns = (data.returns.total_returns_applicable) || 1;

    const returnsData = {
        "completed": (data?.returns?.total_returns_completed) ?? (data?.completed_returns),
        "at_risk": (data?.returns?.total_returns_at_risk) ?? (data?.at_risk_returns),
        "delayed": (data?.returns?.total_returns_delayed) ?? (data?.total_returns_delayed),
        "pending": (data?.returns?.total_returns_pending) ?? (data?.total_returns_pending),
        "total": (data?.returns?.total_returns_applicable) ?? (data?.total_returns)
    }

    const returnsChart = {
        series: [
            ((returnsData.completed ?? 0) / (returnsData.total || 1)) * 100,
            ((returnsData.at_risk ?? 0) / (returnsData.total || 1)) * 100,
            ((returnsData.delayed ?? 0) / (returnsData.total || 1)) * 100,
            ((returnsData.pending ?? 0) / (returnsData.total || 1)) * 100,
        ],
        options: {
            chart: { height: 350, type: 'radialBar' },
            plotOptions: {
                radialBar: {
                    dataLabels: {
                        name: { show: true },
                        value: { show: true },
                        total: {
                            show: true,
                            label: 'Applicable',
                            formatter: () => (returnsData.total)
                        }
                    }
                }
            },
            labels: ['Completed', 'At Risk', 'Delayed', 'Pending'],
            title: { text: 'Returns' }
        }
    };




    const handleOpenDrawer = (anchor, filterColumn) => {
        setDrawerAnchor(anchor);
        setDrawerOpen(true);
        setFilterColumns(filterColumn);
        setActiveDrawer("GeneralComplianceDashboard");
    };
    return (
        <>
            <Snackbars
                issnackbarsOpen={issnackbarsOpen}
                setIsSnackbarsOpen={setIsSnackbarsOpen}
            />
            <div className="align-content-center d-flex justify-content-end mb-3">
                <button className="btn btn-primary " onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDrawer(
                        "left",
                    )
                }}>
                    View Details
                </button>
            </div>
            <div className='row'>
                {shouldShow("gc-1") && (
                    <div className='col-12 col-md-6 mb-4'>
                        <div
                            className={`general-compliance`}
                        >
                            <h2>Licenses (Total: {licenseData.total})</h2>
                            <Chart
                                options={licensesChart.options}
                                series={licensesChart.series}
                                type="pie"
                                height={290}
                            />
                        </div>
                    </div>
                )}
                {shouldShow("gc-2") && (
                    <div className='col-12 col-md-6 mb-4'>
                        <div
                            className={`general-compliance`}
                        >
                            <h2>Challan Compliance</h2>
                            <div className="compliance-items">
                                {payrollData.map((item, index) => (
                                    <div key={index} className={`compliance-item ${item.status}`}>
                                        <div className="compliance-icon">{item.icon}</div>
                                        <span className="compliance-label">{item.label}</span>
                                        <span className="compliance-value">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {shouldShow("gc-3") && (
                    <div className='col-12 col-md-6 mb-4'>
                        <div
                            className={`general-compliance`}
                        >
                            <Chart
                                options={registersChart.options}
                                series={registersChart.series}
                                type="bar"
                                height={350}
                            />
                        </div>
                    </div>
                )}
                {shouldShow("gc-4") && (
                    <div className='col-12 col-md-6 mb-4'>
                        <div
                            className={`general-compliance`}
                        >
                            <Chart
                                options={returnsChart.options}
                                series={returnsChart.series}
                                type="radialBar"
                                height={350}
                            />
                        </div>
                    </div>
                )}
            </div>
            <DashboardDrawerGrid
                anchor={drawerAnchor}
                open={drawerOpen}
                onClose={() => { setDrawerOpen(false); setIsDetailPageDataFor("Returns"); setActiveDrawer(null); }}
                filterColumns={filterColumns}
                isCockpitComplianceDetailPage={true}
                // this is wirking
                data={isDetailPageDataFor === 'Challans' ? paginatedData?.paginatedRecords?.challan?.records
                    : isDetailPageDataFor === 'Licenses' ? paginatedData?.paginatedRecords?.license?.records
                        : isDetailPageDataFor === 'Registers' ? paginatedData?.paginatedRecords?.register?.records
                            : paginatedData?.paginatedRecords?.return?.records} //direct array
                isDetailPageData={
                    isDetailPageDataFor === "Challans"
                        ? paginatedData?.paginatedRecords?.challan?.records
                        : isDetailPageDataFor === "Licenses"
                            ? paginatedData?.paginatedRecords?.license?.records
                            : isDetailPageDataFor === "Registers"
                                ? paginatedData?.paginatedRecords?.register?.records
                                : paginatedData?.paginatedRecords?.return?.records
                }
                title={'General Compliance - ' + isDetailPageDataFor}
                setIsDetailPageDataFor={setIsDetailPageDataFor}
                isDetailPageDataFor={isDetailPageDataFor}
                buttons={['Returns', 'Challans', 'Licenses', 'Registers']}
                fetchPaginatedRecords={fetchSelectedModulePage}
                totalPage={
                    isDetailPageDataFor === "Challans"
                        ? paginatedData?.paginatedRecords?.challan?.total
                        : isDetailPageDataFor === "Licenses"
                            ? paginatedData?.paginatedRecords?.license?.total
                            : isDetailPageDataFor === "Registers"
                                ? paginatedData?.paginatedRecords?.register?.total
                                : paginatedData?.paginatedRecords?.return?.total
                }
                isPaginatedRecords={true}


            />
        </>
    );
};

export default GeneralComplianceDashboard;
