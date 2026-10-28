// =========================================================
// ROLES & PERMISSIONS (Tầng Common)
// Trách nhiệm: Định nghĩa quyền và cấu hình role guard
// KHÔNG làm: Không import từ pages/
// =========================================================

export const ROLES = {
    USER: 'User',
    ADMIN: 'Admin'
};

export const ROLE_PERMISSIONS = {
    [ROLES.USER]: [
        'view_dashboard',
        'manage_jars',
        'manage_transactions',
        'view_notifications',
        'update_profile'
    ],
    [ROLES.ADMIN]: [
        'view_dashboard',
        'manage_jars',
        'manage_transactions',
        'view_notifications',
        'update_profile',
        'manage_users',
        'view_system_logs'
    ]
};

export const hasPermission = (userRole, requiredPermission) => {
    const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS[ROLES.USER];
    return permissions.includes(requiredPermission);
};
