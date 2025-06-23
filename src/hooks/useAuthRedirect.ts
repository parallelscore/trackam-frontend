import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseAuthRedirectOptions {
  redirectTo?: string;
  condition?: boolean;
  replace?: boolean;
}

export const useAuthRedirect = (
  isAuthenticated: boolean,
  options: UseAuthRedirectOptions = {}
) => {
  const navigate = useNavigate();
  const { 
    redirectTo = '/vendor', 
    condition = isAuthenticated,
    replace = false 
  } = options;

  useEffect(() => {
    if (condition) {
      navigate(redirectTo, { replace });
    }
  }, [condition, redirectTo, replace, navigate]);
};

// Specific hooks for common redirect scenarios
export const useAuthenticatedRedirect = (
  isAuthenticated: boolean,
  redirectTo = '/vendor'
) => {
  useAuthRedirect(isAuthenticated, { redirectTo });
};

export const useUnauthenticatedRedirect = (
  isAuthenticated: boolean,
  redirectTo = '/login'
) => {
  useAuthRedirect(!isAuthenticated, { 
    redirectTo, 
    condition: !isAuthenticated 
  });
};

export const useRoleBasedRedirect = (
  isAuthenticated: boolean,
  userRole?: string
) => {
  const roleRedirectMap: Record<string, string> = {
    vendor: '/vendor',
    rider: '/rider',
    customer: '/track',
    admin: '/admin'
  };

  const redirectTo = userRole ? roleRedirectMap[userRole] || '/vendor' : '/vendor';
  
  useAuthRedirect(isAuthenticated, { redirectTo });
};