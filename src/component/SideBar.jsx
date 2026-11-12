import React, { useState, useEffect, useMemo } from 'react';
import '../style/sidebar.css';
import { Link, Outlet, useLocation } from 'react-router-dom';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import DomainAddOutlinedIcon from '@mui/icons-material/DomainAddOutlined';
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import ViewModuleOutlinedIcon from '@mui/icons-material/ViewModuleOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import complyn_mgmt_logo from '../assets/complyn_mgmt_logo.png'
import DesktopAccessDisabledOutlinedIcon from '@mui/icons-material/DesktopAccessDisabledOutlined';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { AlignCenterVertical, FileSpreadsheet, Layers, ScanEye, Tags } from 'lucide-react';
import { decryptData } from '../page/utils/encrypt';
import { usePageAccessResolver } from '../page/utils/usePageAccess';
export const RegisterApplicabilityIcon = ({ active }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={active ? 'side-bar-icon-active' : 'side-bar-icon'}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <path d="M9 12l2 2 4-4" />
    </svg>
);

export const ProcessRegisterIcon = ({ active }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={active ? 'side-bar-icon-active' : 'side-bar-icon'}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <path d="M3 12h18M12 3v18" />
        <path d="M6 6l12 12" />
    </svg>
);

export const CreateRegisterIcon = ({ active }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={active ? 'side-bar-icon-active' : 'side-bar-icon'}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);
function SideBar({ sidebarOpen, setSidebarOpen, setActivePage, activePage }) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const userRole = decryptData(localStorage.getItem("user_role"));
    const { accessFor } = usePageAccessResolver();
    const menuItems = [
        { icon: (active) => <DashboardCustomizeOutlinedIcon className={`${active ? 'side-bar-icon-active' : 'side-bar-icon'}`} />, label: 'Dashboard', link: 'dashboard' },
        { icon: (active) => <AssignmentIndOutlinedIcon className={`${active ? 'side-bar-icon-active' : 'side-bar-icon'}`} />, label: 'Create User', link: 'create_user_role', page: 'user' },
        { icon: (active) => <DomainAddOutlinedIcon className={`${active ? 'side-bar-icon-active' : 'side-bar-icon'}`} />, label: 'Group/Holding', link: 'group_holding', page: 'group' },
        { icon: (active) => <ApartmentOutlinedIcon className={`${active ? 'side-bar-icon-active' : 'side-bar-icon'}`} />, label: 'Company', link: 'company', page: 'company' },
        { icon: (active) => <AlignCenterVertical className={`${active ? 'side-bar-icon-active' : 'side-bar-icon'}`} />, label: 'Entity', link: 'entity', page: 'entity' },
        { icon: (active) => <TravelExploreOutlinedIcon className={`${active ? 'side-bar-icon-active' : 'side-bar-icon'}`} />, label: 'Location', link: 'location', page: 'company_location' },
        { icon: (active) => <ViewModuleOutlinedIcon className={`${active ? 'side-bar-icon-active' : 'side-bar-icon'}`} />, label: 'Module', link: 'module', page: 'module' },
        { icon: (active) => <ViewModuleOutlinedIcon className={`${active ? 'side-bar-icon-active' : 'side-bar-icon'}`} />, label: 'Subscribe Module & Sub-Module ', link: 'location_to_module', page: 'location_to_module' },
        { icon: (active) => <ExtensionOutlinedIcon className={`${active ? 'side-bar-icon-active' : 'side-bar-icon'}`} />, label: 'SubModule', link: 'sub_module', page: 'submodule' },
        { icon: (active) => <DesktopAccessDisabledOutlinedIcon className={`${active ? 'side-bar-icon-active' : 'side-bar-icon'}`} />, label: 'Access Control', link: 'access_control', page: 'user_access' },
        { icon: (active) => <EditDocumentIcon className={`${active ? 'side-bar-icon-active' : 'side-bar-icon'}`} />, label: 'Document Repository', link: 'upload_documents', page: 'document_repository' },
        { icon: (active) => <Tags className={`${active ? 'side-bar-icon-active' : 'side-bar-icon'}`} />, label: 'Bulk Document Tagging', link: 'document_bulk_tagging', page: 'document_bulk_tagging' },
        { icon: (active) => <FileSpreadsheet className={`${active ? 'side-bar-icon-active' : 'side-bar-icon'}`} />, label: 'Client Onboarding', link: 'client_onboarding', page: 'client_onboarding' },

        // { icon: (active) => <PanelsRightBottom className={`${active ? 'side-bar-icon-active' : 'side-bar-icon'}`} />, label: 'Register Processing', link: 'register_processing' },

    ].filter((item) => !item.page || accessFor(item.page).canView); // `page` = backend page name it needs view on
    const canViewTrackers = accessFor('service_tracker').canView;
    const serviceTracker = useMemo(() => [
        ...(canViewTrackers
            ? [{ icon: (active) => <CheckBoxIcon className={`${active ? 'side-bar-icon-active' : 'side-bar-icon'}`} />, label: 'Trackers', link: 'service_trackers', parent: 'serviceTracker' }]
            : []
        ),
        ...(userRole === 'Admin' || userRole === 'Super-Admin'
            ? [{
                icon: (active) => <ScanEye className={`${active ? 'side-bar-icon-active' : 'side-bar-icon'}`} />,
                label: 'Tracker Access',
                link: 'service_tracker_access',
                parent: 'serviceTracker'
            }, {
                icon: (active) => <Layers className={`${active ? 'side-bar-icon-active' : 'side-bar-icon'}`} />,
                label: 'Widget Access',
                link: 'widget_access',
                parent: 'serviceTracker'
            }]
            : []
        ),
    ], [canViewTrackers, userRole]);
    // Icons.js

    const registerProcessing = useMemo(() => [
        { icon: (active) => <CreateRegisterIcon active={active} />, label: 'Create Register', link: 'create_register', parent: 'registerProcessing' },
        { icon: (active) => <RegisterApplicabilityIcon active={active} />, label: 'Register Applicability', link: 'register', parent: 'registerProcessing' },
        { icon: (active) => <ProcessRegisterIcon active={active} />, label: 'Process Register', link: 'process_register', parent: 'registerProcessing' },
        // { icon: (active) => <CreateMappingIcon active={active} />, label: 'Create Mapping', link: 'create_mapping' },
        // { icon: (active) => <CreateApplicabilityIcon active={active} />, label: 'Create Applicability', link: 'create_applicability' },

    ], []);
    const location = useLocation();
    useEffect(() => {
        const allMenus = [...serviceTracker, ...registerProcessing];

        const current = allMenus.find(item =>
            location.pathname.includes(item.link)
        );

        setOpenDropdown(current?.parent || null);
    }, [location.pathname, serviceTracker, registerProcessing]);

    const handleDropdownToggle = (name) => {
        setOpenDropdown(prev => (prev === name ? null : name));
    };
    return (
        <div>
            <div className={`${sidebarOpen ? "sidebar sidebar-open" : "sidebar sidebar-close"}`}>
                <div>
                    <div className={`${sidebarOpen ? 'd-flex open-sidebar-wrap open-sidebar-logo-wrap' : 'd-flex close-sidebar-logo-wrap'}`} style={{ alignItems: 'center', marginBottom: 29 }}>
                        <button className="openbtn btn btn-sm w-auto" onClick={() => setSidebarOpen(prev => !prev)} style={!sidebarOpen ? { marginLeft: '6px' } : undefined}>
                            {sidebarOpen ? <MenuOpenIcon /> : <MenuIcon />}
                        </button>
                        <img src={complyn_mgmt_logo} alt='logo' width={115} className={`${sidebarOpen ? 'mt-1 nav-open-logo' : 'mt-1 display-none'}`} />
                    </div>

                    <div style={{ paddingTop: 75 }}>
                        {menuItems.map(({ icon, label, link }, i) => {
                            const isActive = activePage === label;
                            return (
                                <div key={i}>
                                    <Link
                                        to={`/${link}`}
                                        onClick={() => {
                                            setActivePage(label);
                                            localStorage.setItem("activeItem", label);
                                            localStorage.setItem('active_url', link)
                                        }}
                                    >
                                        <div
                                            className={`${sidebarOpen ? 'ms-2 mb-4 d-flex d-inline-block open-sidebar-wrap' : 'ms-2 mb-4 d-flex d-inline-block'}`}
                                            tabIndex="0"
                                            data-toggle="tooltip"
                                            title={label}
                                        >
                                            <span className={`sidebar-close-icon-span ${isActive ? 'side-bar-active-tab' : ''}`}>
                                                {icon(isActive)}
                                            </span>
                                            <span className={`${sidebarOpen ? 'ps-3 pe-2 side-bar-icon-text' : 'side-bar-close'}`}>
                                                {label}
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}

                        {/* Document Dropdown */}
                        {serviceTracker.length > 0 && (
                        <div className={`${sidebarOpen ? 'ms-2 mb-2 d-flex flex-column open-sidebar-wrap' : 'ms-2 mb-2 d-flex flex-column'}`}>
                            <div
                                className="d-flex align-items-center cursor-pointer mb-4"
                                onClick={() => handleDropdownToggle('serviceTracker')}
                            >
                                <span className='sidebar-close-icon-span'>
                                    {openDropdown === 'serviceTracker' ? <KeyboardArrowDownIcon className='side-bar-icon' /> : <KeyboardArrowRightIcon className='side-bar-icon' />}
                                </span>
                                <span className={`${sidebarOpen ? 'ps-3 pe-2 side-bar-icon-text' : 'side-bar-close'}`}>
                                    Service Tracker
                                </span>
                            </div>
                            {openDropdown === 'serviceTracker' && (
                                <div className='pt-2'>
                                    {serviceTracker.map(({ icon, label, link }, i) => {
                                        const isActive = activePage === label;
                                        return (
                                            <div key={i}>
                                                <Link
                                                    to={`/${link}`}
                                                    onClick={() => {
                                                        setActivePage(label);
                                                        localStorage.setItem("activeItem", label);
                                                        localStorage.setItem('active_url', link)
                                                    }}
                                                >
                                                    <div
                                                        className='d-flex d-inline-block mb-4'
                                                        tabIndex="0"
                                                        data-toggle="tooltip"
                                                        title={label}
                                                    >
                                                        <span className={`sidebar-close-icon-span ${isActive ? 'side-bar-active-tab' : ''}`}>
                                                            {icon(isActive)}
                                                        </span>
                                                        <span className={`${sidebarOpen ? 'ps-3 pe-2 side-bar-icon-text' : 'side-bar-close'}`}>
                                                            {label}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                        </div>
                        )}
                        {/* <div className={`${sidebarOpen ? 'ms-2 mb-2 d-flex flex-column open-sidebar-wrap' : 'ms-2 mb-2 d-flex flex-column'}`}>
                            <div
                                className="d-flex align-items-center cursor-pointer mb-4"
                                onClick={() => handleDropdownToggle('registerProcessing')}
                            >
                                <span className='sidebar-close-icon-span'>
                                    {openDropdown === 'registerProcessing' ? <KeyboardArrowDownIcon className='side-bar-icon' /> : <KeyboardArrowRightIcon className='side-bar-icon' />}
                                </span>
                                <span className={`${sidebarOpen ? 'ps-3 pe-2 side-bar-icon-text' : 'side-bar-close'}`}>
                                    Register Processing
                                </span>
                            </div>
                            {openDropdown === 'registerProcessing' && (
                                <div className='pt-2'>
                                    {registerProcessing.map(({ icon, label, link }, i) => {
                                        const isActive = activePage === label;
                                        return (
                                            <div key={i}>
                                                <Link
                                                    to={`/${link}`}
                                                    onClick={() => {
                                                        setActivePage(label);
                                                        localStorage.setItem("activeItem", label);
                                                        localStorage.setItem('active_url', link)
                                                    }}
                                                >
                                                    <div
                                                        className='d-flex d-inline-block mb-4'
                                                        tabIndex="0"
                                                        data-toggle="tooltip"
                                                        title={label}
                                                    >
                                                        <span className={`sidebar-close-icon-span ${isActive ? 'side-bar-active-tab' : ''}`}>
                                                            {icon(isActive)}
                                                        </span>
                                                        <span className={`${sidebarOpen ? 'ps-3 pe-2 side-bar-icon-text' : 'side-bar-close'}`}>
                                                            {label}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                        </div> */}
                    </div>
                </div>
            </div>

            <div id="main" style={{ marginLeft: sidebarOpen ? '250px' : '70px' }} className='mobile-page-layout'>
                <Outlet />
            </div>
        </div>
    );
}

export default SideBar;
