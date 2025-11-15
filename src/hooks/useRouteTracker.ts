import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to track route changes and update localStorage "loginusertype"
 * based on the current route pattern
 */
export const useRouteTracker = () => {
    const location = useLocation();

    useEffect(() => {
        const pathname = location.pathname;

        // Determine user type based on route pattern
        let userType: string | null = null;

        if (pathname.startsWith('/admin')) {
            userType = 'admin';
        } else if (pathname.startsWith('/shipper')) {
            userType = 'shipper';
        } else if (pathname.startsWith('/user') || pathname === '/') {
            userType = 'user';
        }

        // Update localStorage only if we have a valid user type and it's different from current
        if (userType) {
            const currentUserType = localStorage.getItem('loginusertype');
            if (currentUserType !== userType) {
                localStorage.setItem('loginusertype', userType);
                console.log(`Route tracker: Updated loginusertype to "${userType}" for route: ${pathname}`);
            }
        }
    }, [location.pathname]);
};