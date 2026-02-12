import { useAuth } from '@/hooks/useAuth';

export const useCMSAccess = () => {
  const { user, loading } = useAuth();

  const hasAccess = user && (
    user.role === 'interno' || 
    user.role === 'admin' || 
    user.role === 'super_admin'
  );

  const canAccessSettings = user && (
    user.role === 'admin' || 
    user.role === 'super_admin'
  );

  const canManageUsers = user && user.role === 'super_admin';

  const getUserPermissions = () => {
    if (!user) return [];

    const permissions = [];

    if (hasAccess) {
      permissions.push('cms_access');
    }

    if (user.role === 'interno' || user.role === 'admin' || user.role === 'super_admin') {
      permissions.push('blog_manage', 'team_manage', 'services_manage', 'instruments_manage', 'media_manage');
    }

    if (canAccessSettings) {
      permissions.push('settings_manage');
    }

    if (canManageUsers) {
      permissions.push('users_manage', 'system_admin');
    }

    return permissions;
  };

  return {
    user,
    loading,
    hasAccess,
    canAccessSettings,
    canManageUsers,
    permissions: getUserPermissions(),
    hasPermission: (permission: string) => getUserPermissions().includes(permission)
  };
};

export default useCMSAccess;