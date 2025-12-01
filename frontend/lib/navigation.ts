/**
 * Get the appropriate dashboard path based on user role
 */
export const getDashboardPath = (role?: string): string => {
  if (role === 'admin') {
    return '/admin';
  } else if (role === 'instructor') {
    return '/instructor';
  } else {
    return '/dashboard';
  }
};

/**
 * Get the appropriate dashboard label based on user role
 */
export const getDashboardLabel = (role?: string): string => {
  if (role === 'admin') {
    return 'Admin Dashboard';
  } else if (role === 'instructor') {
    return 'Instructor Dashboard';
  } else {
    return 'Dashboard';
  }
};
