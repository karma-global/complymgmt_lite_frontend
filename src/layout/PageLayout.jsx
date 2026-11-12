import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import SideBar from '../component/SideBar'
import NavBar from '../component/NavBar'
import NotificationPage from '../component/notification/NotificationPage';
import { getInAppNotification } from '../api/service';
import { decryptData } from '../page/utils/encrypt';
import { countUnread } from '../component/notification/notificationUtils';

const PageLayout = ({
  sidebarOpen,
  setSidebarOpen,
  unreadCountNotification,
  setUnreadCountNotification,
  setActivePage,
  activePage
}) => {
     const [showNotifications, setShowNotifications] = useState(false);
     const SystemUserId = decryptData(localStorage.getItem("user_id"));
     const { pathname } = useLocation();
     // Keep the highlight right when we land on the dashboard by redirect (e.g. a stale active_url)
     useEffect(() => {
         if (pathname === '/dashboard') setActivePage('Dashboard');
     }, [pathname, setActivePage]);
      useEffect(() => {
         const fetchNotifications = async () => {
           try {
             const response = await getInAppNotification(SystemUserId || "");
             setUnreadCountNotification(countUnread(response));
           } catch {
             // handle error silently
           }
         };
         fetchNotifications();
       }, [SystemUserId, setUnreadCountNotification]);
     if (showNotifications) {
    return <NotificationPage onBack={() => setShowNotifications(false)} />;
  }
  return (
    <div>
        <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} setActivePage={setActivePage} activePage={activePage} />
        <NavBar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} unreadCountNotification={unreadCountNotification} setActivePage={setActivePage} activePage={activePage} />
    </div>
  )
}

export default PageLayout