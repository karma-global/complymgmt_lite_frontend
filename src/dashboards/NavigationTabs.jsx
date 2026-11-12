import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../style/statsCards.css";
import "../style/dashboard.css";
import { Tabs, Tab, Box, CircularProgress } from "@mui/material";
import GeneralComplianceDashboard from "../dashboards/GeneralComplianceDashboard/GeneralComplianceDashboard";
import {
    fetchClientOnboardingByCompany,
    fetchClientOnboardingPortfolio,
    fetchGeneralCompaiancePortfolio,
    fetchGeneralComplianceByCompany,
    fetchWidgetMappingById,
} from "../api/service";
import CockpitComplinceByCompany from "./cockpitDashboard/CockpitComplinceByCompany";
import CockpitComplince from "./cockpitDashboard/CockpitComplince";
import ClientOnbordingDashboard from "./clientOnbordingDashboard/ClientOnbordingDashboard";
import ClientOnBoardingByCompany from "./clientOnbordingDashboard/ClientOnBoardingByCompany/ClientOnBoardingByCompany";
import PayrollServices from "./payrollDashboard/PayrollServices";
import ReturnsDashboard from "./returnsDashboard/ReturnsDashboard";
import HelpdeskAndEscalations from "./payrollDashboard/HelpdeskAndEscalations";
import GeneralHelpdesk from "./payrollDashboard/GeneralHelpdesk";
import AuditAndVisitDashboard from "./Audit/AuditAndVisitDashboard";
import NoticeDashboard from "./noticeDashboard/NoticeDashboard";
import ChallanDashboard from "./challanDashboard/ChallanDashboard";
import RegisterDashboard from "./registerDashboard/RegisterDashboard";
import LicenseDashboard from "./licenseDashboard/LicenseDashboard";
import { decryptData } from "../page/utils/encrypt";
import { widgetPrefix } from "../page/widgetAccess/widgetCatalog";

// Query params shared by every dashboard tab
const SHARED_PARAMS = ["tab", "company_name"];

function TabPanel({ children, value, index, keepMounted = true }) {
    const isActive = value === index;

    return (
        <div role="tabpanel" hidden={!isActive}>
            {(keepMounted || isActive) ? children : null}
        </div>
    );
}

const NavigationTabs = ({ selectedCompany, setSelectedCompany, setActiveTitle }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    // The active tab lives in the URL (?tab=<slug>) so refresh, shared links and back/forward keep it.
    // Dashboards keep their filters in the same query string, so each tab's filters are parked when
    // leaving it and restored when coming back; tab and company are shared by all tabs.
    const activeSlug = searchParams.get("tab");
    const tabFiltersRef = useRef({});

    /* STATES */
    const [generalDashboardData, setGeneralDashboardData] = useState([]);
    const [clientOnboardingData, setClientOnboardingData] = useState([]);
    const [ClientOnBoardingByCompanyData, setClientOnBoardingByCompanyData] = useState([]);
    const [activeDrawer, setActiveDrawer] = useState(null);
    const [widgetsList, setWidgetsList] = useState([]);
    const [widgetsLoaded, setWidgetsLoaded] = useState(false);
    const [page] = useState(1);
    const [limit] = useState(20);

    const userType = decryptData(localStorage.getItem("user_type"));
    const userId = decryptData(localStorage.getItem("user_id"));
    const shouldShow = (id) => {
        return Array.isArray(widgetsList) &&
            widgetsList.flat().some(
                item => item?.widget_id?.toUpperCase() === id.toUpperCase()
            );
    };
    // Switch tabs. The current tab's filters are parked and the target's come back, unless `params`
    // is given (a drill-down from another dashboard), in which case those filters are opened instead.
    const switchTab = (toSlug, params) => {
        const fromSlug = activeSlug || "compliance-cockpit";
        setSearchParams((prev) => {
            const own = new URLSearchParams(prev);
            SHARED_PARAMS.forEach((key) => own.delete(key));
            tabFiltersRef.current[fromSlug] = own.toString();

            const next = new URLSearchParams();
            next.set("tab", toSlug);
            if (prev.get("company_name")) next.set("company_name", prev.get("company_name"));
            const restored = params
                ? Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value.join(",") : value])
                : [...new URLSearchParams(tabFiltersRef.current[toSlug] || "").entries()];
            restored.forEach(([key, value]) => value && next.set(key, value));
            return next;
        });
    };
    const openTab = (toSlug, params) => {
        switchTab(toSlug, params);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    // The cockpit is the default tab, so it is active when ?tab= is missing or unknown
    const isCockpitActive = !activeSlug || activeSlug === "compliance-cockpit";

    const tabsList = [
        {
            label: "Compliance Cockpit",
            slug: "compliance-cockpit",
            title: "Compliance Cockpit",
            // The by-company cockpit renders CCBC-* widgets, the portfolio one CC-*
            widgets: selectedCompany !== "" ? "CCBC" : "CC",
            content:
                selectedCompany !== "" ? (
                    <CockpitComplinceByCompany
                        companyName={selectedCompany}
                        setSelectedCompany={setSelectedCompany}
                        shouldShow={shouldShow}
                        isActive={isCockpitActive}
                        openTab={openTab}
                    />
                ) : (
                    <CockpitComplince
                        setSelectedCompany={setSelectedCompany}
                        shouldShow={shouldShow}
                        isActive={isCockpitActive}
                        openTab={openTab}
                    />
                )
        },
        {
            label: "General Compliance",
            slug: "general-compliance",
            title: "General Compliance",
            widgets: "GC",
            content: (
                <GeneralComplianceDashboard data={generalDashboardData}
                    shouldShow={shouldShow}
                    page={page}
                    limit={limit}
                    setActiveDrawer={setActiveDrawer}

                />
            )
        }
    ];

    if (userType === "0") {
        tabsList.push({
            label: "Client Onboarding",
            slug: "client-onboarding",
            title: "Client Onboarding",
            // Granted per user in Widget Access (CO-1); still internal users only
            widgets: "CO",
            content:
                selectedCompany === "" ? (
                    <ClientOnbordingDashboard
                        data={clientOnboardingData}
                        selectedCompany={selectedCompany}
                        activeDrawer={activeDrawer}
                        setActiveDrawer={setActiveDrawer}
                    />) : (
                    <ClientOnBoardingByCompany
                        locationData={ClientOnBoardingByCompanyData}
                        selectedCompany={selectedCompany}
                        activeDrawer={activeDrawer}
                        setActiveDrawer={setActiveDrawer}
                    />
                )
        });
    }

    tabsList.push(
        {
            label: "Registers",
            widgets: "RG",
            slug: "register",
            title: "Register Dashboard",
            content: (
                <RegisterDashboard
                    selectedCompany={selectedCompany}
                    setSelectedCompany={setSelectedCompany}
                    shouldShow={shouldShow}
                    isActive={activeSlug === "register"}
                />
            )
        },
        {
            label: "Returns & Submissions",
            widgets: "RT",
            slug: "returns-submissions",
            title: "Payroll - Returns & Submissions",
            content: (
                <ReturnsDashboard
                    selectedCompany={selectedCompany}
                    setSelectedCompany={setSelectedCompany}
                    shouldShow={shouldShow}
                    isActive={activeSlug === "returns-submissions"}
                />
            )
        },
        {
            label: "Challan",
            widgets: "CH",
            slug: "challan",
            title: "Challan Dashboard",
            content: (
                <ChallanDashboard
                    selectedCompany={selectedCompany}
                    setSelectedCompany={setSelectedCompany}
                    shouldShow={shouldShow}
                    isActive={activeSlug === "challan"}
                />
            )
        },
        {
            label: "Licenses",
            widgets: "LC",
            slug: "license",
            title: "License Dashboard",
            content: (
                <LicenseDashboard
                    selectedCompany={selectedCompany}
                    setSelectedCompany={setSelectedCompany}
                    shouldShow={shouldShow}
                    isActive={activeSlug === "license"}
                />
            )
        },
        {
            label: "Payroll Services",
            widgets: "PS",
            slug: "payroll-services",
            title: "Payroll",
            content: (
                <PayrollServices
                    selectedCompany={selectedCompany}
                    shouldShow={shouldShow}
                    activeDrawer={activeDrawer}
                    setActiveDrawer={setActiveDrawer}
                />
            )
        },
        {
            label: "Helpdesk & Escalations",
            widgets: "HE",
            slug: "helpdesk-escalations",
            title: "Payroll - Helpdesk & Escalations",
            content: (
                <HelpdeskAndEscalations
                    selectedCompany={selectedCompany}
                    shouldShow={shouldShow}
                    activeDrawer={activeDrawer}
                    setActiveDrawer={setActiveDrawer}

                />
            )
        },
        {
            label: "General Helpdesk",
            widgets: "GH",
            slug: "general-helpdesk",
            title: "Payroll - General Helpdesk",
            content: (
                <GeneralHelpdesk
                    selectedCompany={selectedCompany}
                    widgetsList={widgetsList}
                    activeDrawer={activeDrawer}
                    setActiveDrawer={setActiveDrawer}
                />
            )
        },
        {
            label: "Audit & Visits",
            widgets: "AV",
            slug: "audit-visits",
            title: "Audit & Visits",
            content: (
                <AuditAndVisitDashboard
                    selectedCompany={selectedCompany}
                    shouldShow={shouldShow}
                    activeDrawer={activeDrawer}
                    setActiveDrawer={setActiveDrawer}
                />
            )
        },
        {
            label: "Notices & Inspections",
            widgets: "NI",
            slug: "notices-inspections",
            title: "Notices & Inspections",
            content: (
                <NoticeDashboard
                    selectedCompany={selectedCompany}
                    shouldShow={shouldShow}
                    widgetsList={widgetsList}
                    activeDrawer={activeDrawer}
                    setActiveDrawer={setActiveDrawer}
                />
            )
        }
    );

    // A dashboard tab is only shown if the user has at least one of its widgets (`widgets` is the
    // widget id prefix, e.g. "RG" for RG-1..RG-11); tabs without `widgets` are always shown.
    const widgetPrefixes = new Set(widgetsList.flat().map((item) => widgetPrefix(item?.widget_id)));
    const visibleTabs = tabsList.filter((t) => !t.widgets || widgetPrefixes.has(t.widgets));
    const activeIndex = Math.max(0, visibleTabs.findIndex((t) => t.slug === (activeSlug || "compliance-cockpit")));
    const activeTab = visibleTabs[activeIndex];

    // The tab in the URL (or the default cockpit) isn't available: open the first one that is, so its
    // dashboard loads (each dashboard only fetches while its slug is the active one)
    useEffect(() => {
        if (widgetsLoaded && activeTab && activeTab.slug !== (activeSlug || "compliance-cockpit")) {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set("tab", activeTab.slug);
                return next;
            }, { replace: true });
        }
    }, [widgetsLoaded, activeTab, activeSlug, setSearchParams]);

    useEffect(() => {
        setActiveTitle(activeTab?.title || "");
        // eslint-disable-next-line react-hooks/exhaustive-deps -- setActiveTitle is a state setter
    }, [activeTab?.title]);

    const handleTabChange = (event, newValue) => switchTab(visibleTabs[newValue].slug);

    useEffect(() => {
        const fetchGeneralDashboardData = async () => {
            try {
                if (selectedCompany) {
                    setGeneralDashboardData(await fetchGeneralComplianceByCompany(selectedCompany));
                } else {
                    setGeneralDashboardData(await fetchGeneralCompaiancePortfolio());
                }
            } catch {
                setGeneralDashboardData([]);
            }
        };
        fetchGeneralDashboardData();
    }, [selectedCompany, page, limit]);

    useEffect(() => {
        const fetchClientOnboardingPortfolioData = async () => {
            const [a, b] = await Promise.allSettled([
                fetchClientOnboardingByCompany(selectedCompany),
                fetchClientOnboardingPortfolio()
            ]);

            setClientOnBoardingByCompanyData(a.status === "fulfilled" ? a.value : []);
            setClientOnboardingData(b.status === "fulfilled" ? b.value : []);
        };
        fetchClientOnboardingPortfolioData();
    }, [selectedCompany]);

    useEffect(() => {
        const fetchWidgetsListData = async () => {
            const [a] = await Promise.allSettled([
                fetchWidgetMappingById(userId),
            ]);
            setWidgetsList(
                a.status === "fulfilled"
                    ? a.value?.widgets || []
                    : []
            );
            setWidgetsLoaded(true);
        };
        fetchWidgetsListData();
    }, [selectedCompany, userId]);
    // Which tabs exist depends on the widget list, so wait for it rather than flash tabs in and out
    if (!widgetsLoaded) {
        return (
            <div className="d-flex justify-content-center p-5">
                <CircularProgress size={26} />
            </div>
        );
    }

    if (visibleTabs.length === 0) {
        return (
            <div className="alert alert-light border text-center text-muted mt-3 py-4">
                No widgets assigned. Contact your admin.
            </div>
        );
    }

    return (
        <Box sx={{ width: "100%" }}>
            <Tabs
                value={activeIndex}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
            >
                {visibleTabs.map((t) => (
                    <Tab key={t.slug} label={t.label} />
                ))}
            </Tabs>

            <Box sx={{ marginTop: 2 }}>
                {visibleTabs.map((tab, index) => (
                    <TabPanel key={tab.slug} value={activeIndex} index={index} keepMounted>
                        {tab.content}
                    </TabPanel>
                ))}
            </Box>

        </Box>
    );
};

export default NavigationTabs;
