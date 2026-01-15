import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { roleService } from '@/services/role.service';
import { branchService } from '@/services/branch.service';
import { usePermissions } from '@/hooks/usePermissions';
import { useResourceLimitNotifications } from '@/hooks/useResourceLimitNotifications';
import { isResourceLimitError, parseResourceLimitError } from '@/utils/resource-limit-handler';
import { Plus, Edit, Trash2, X, Key, Building2, ChevronDown, ChevronRight, Users as UsersIcon, List } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';

export default function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [changingPasswordUser, setChangingPasswordUser] = useState<any>(null);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [expandedTenants, setExpandedTenants] = useState<Set<string>>(new Set(['super-admin']));
  const [groupByTenant, setGroupByTenant] = useState(true);
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const { checkResourceLimit, refreshLimits } = useResourceLimitNotifications();
  const toast = useToast();
  const confirm = useConfirm();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  });

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: roleService.getAll,
  });

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: branchService.getAll,
  });

  const { register, handleSubmit, reset, setValue } = useForm();
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword } = useForm();

  // Agrupar usuarios por tenant
  const groupedUsers = useMemo(() => {
    if (!users) return { superAdmin: [], tenants: {} };

    const superAdmin: any[] = [];
    const tenants: Record<string, { tenant: any; users: any[] }> = {};

    users.forEach(user => {
      if (!user.tenant) {
        superAdmin.push(user);
      } else {
        const tenantKey = user.tenant.id;
        if (!tenants[tenantKey]) {
          tenants[tenantKey] = {
            tenant: user.tenant,
            users: []
          };
        }
        tenants[tenantKey].users.push(user);
      }
    });

    return { superAdmin, tenants };
  }, [users]);

  const toggleTenant = (tenantId: string) => {
    setExpandedTenants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tenantId)) {
        newSet.delete(tenantId);
      } else {
        newSet.add(tenantId);
      }
      return newSet;
    });
  };

  const handleCreateUser = async () => {
    // Validar límite de usuarios antes de abrir el modal
    const { canCreate, alert } = checkResourceLimit('users');
    
    if (!canCreate) {
      // Mostrar mensaje de error si alcanzó el límite
      toast.error(
        'Límite alcanzado',
        `Has alcanzado el límite máximo de usuarios (${alert?.current}/${alert?.max}). Actualiza tu plan para continuar.`,
        7000
      );
      return;
    }
    
    if (alert && alert.level === 'critical') {
      // Mostrar advertencia si está cerca del límite
      const proceed = await confirm({
        type: 'warning',
        title: 'Límite cercano',
        message: `Estás cerca del límite de usuarios (${alert.current}/${alert.max} - ${alert.percentage.toFixed(1)}%).\n\nConsidera actualizar tu plan pronto.\n\n¿Deseas continuar creando el usuario?`,
        confirmText: 'Continuar',
        cancelText: 'Cancelar',
      });
      
      if (!proceed) {
        return;
      }
    }
    
    // Abrir modal de crear usuario
    setIsModalOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      reset();
      refreshLimits();
      toast.success('¡Usuario creado!', 'El usuario fue creado correctamente');
    },
    onError: (error: any) => {
      console.error('Error al crear usuario:', error);
      
      if (isResourceLimitError(error)) {
        const limitError = parseResourceLimitError(error);
        toast.error(
          'Límite alcanzado',
          `${limitError.message}\n\nContacta al administrador para actualizar tu plan.`,
          7000
        );
        setIsModalOpen(false);
      } else {
        toast.error('Error al crear', error.response?.data?.message || 'No se pudo crear el usuario');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      setEditingUser(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }: any) => userService.changePassword(id, newPassword),
    onSuccess: () => {
      setIsPasswordModalOpen(false);
      setChangingPasswordUser(null);
      resetPassword();
      toast.success('¡Contraseña actualizada!', 'La contraseña se cambió correctamente');
    },
  });

  // Verificar si el usuario actual es Super Admin
  const canCreate = hasPermission('create_users');
  const canEdit = hasPermission('edit_users');
  const canDelete = hasPermission('delete_users');
  const canChangePassword = hasPermission('change_passwords');

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setValue('name', user.name);
    setValue('email', user.email);
    setValue('roleId', user.role.id);
    setSelectedBranches(user.branches.map((b: any) => b.id));
    setValue('isActive', user.isActive);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      type: 'danger',
      title: '¿Eliminar usuario?',
      message: 'Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });
    
    if (confirmed) {
      deleteMutation.mutate(id);
      toast.success('Usuario eliminado', 'El usuario fue eliminado correctamente');
    }
  };

  const handleChangePassword = (user: any) => {
    setChangingPasswordUser(user);
    setIsPasswordModalOpen(true);
  };

  const handleBranchToggle = (branchId: string) => {
    setSelectedBranches(prev => {
      if (prev.includes(branchId)) {
        return prev.filter(id => id !== branchId);
      } else {
        return [...prev, branchId];
      }
    });
  };

  const onSubmit = (data: any) => {
    const submitData = {
      ...data,
      branchIds: selectedBranches.length > 0 ? selectedBranches : undefined,
    };

    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const onSubmitPassword = (data: any) => {
    if (changingPasswordUser) {
      changePasswordMutation.mutate({ 
        id: changingPasswordUser.id, 
        newPassword: data.newPassword 
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setSelectedBranches([]);
    reset();
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setChangingPasswordUser(null);
    resetPassword();
  };

  const renderUserRow = (user: any) => (
    <tr key={user.id} className="border-b hover:bg-gray-50">
      <td className="py-3 px-4 font-medium">{user.name}</td>
      <td className="py-3 px-4">{user.email}</td>
      <td className="py-3 px-4">{user.role.name}</td>
      <td className="py-3 px-4">
        {user.branches.length > 0 ? (
          <span className="text-sm text-gray-600">
            {user.branches.map((b: any) => b.name).join(', ')}
          </span>
        ) : (
          <span className="text-sm text-gray-400 italic">Sin sedes</span>
        )}
      </td>
      <td className="py-3 px-4">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            user.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {user.isActive ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      {(canEdit || canDelete || canChangePassword) && (
        <td className="py-3 px-4">
          <div className="flex gap-2">
            {canEdit && (
              <button
                onClick={() => handleEdit(user)}
                className="text-blue-600 hover:text-blue-700"
                title="Editar usuario"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            {canChangePassword && (
              <button
                onClick={() => handleChangePassword(user)}
                className="text-green-600 hover:text-green-700"
                title="Cambiar contraseña"
              >
                <Key className="w-5 h-5" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => handleDelete(user.id)}
                className="text-red-600 hover:text-red-700"
                title="Eliminar usuario"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600 mt-2">Gestiona los usuarios del sistema</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setGroupByTenant(!groupByTenant)}
            className="btn btn-secondary flex items-center gap-2"
            title={groupByTenant ? 'Vista de lista' : 'Agrupar por tenant'}
          >
            {groupByTenant ? <List className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            {groupByTenant ? 'Vista Lista' : 'Agrupar por Tenant'}
          </button>
          {canCreate && (
            <button
              onClick={handleCreateUser}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nuevo Usuario
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : groupByTenant ? (
        <div className="space-y-4">
          {/* Super Admin Section */}
          {groupedUsers.superAdmin.length > 0 && (
            <div className="card">
              <button
                onClick={() => toggleTenant('super-admin')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expandedTenants.has('super-admin') ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <UsersIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Super Administradores</h3>
                    <p className="text-sm text-gray-500">
                      {groupedUsers.superAdmin.length} usuario(s)
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  Sistema
                </span>
              </button>

              {expandedTenants.has('super-admin') && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-4">Nombre</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Rol</th>
                        <th className="text-left py-3 px-4">Sedes</th>
                        <th className="text-left py-3 px-4">Estado</th>
                        {(canEdit || canDelete || canChangePassword) && (
                          <th className="text-left py-3 px-4">Acciones</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {groupedUsers.superAdmin.map(renderUserRow)}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tenants Sections */}
          {Object.entries(groupedUsers.tenants).map(([tenantId, { tenant, users: tenantUsers }]) => (
            <div key={tenantId} className="card">
              <button
                onClick={() => toggleTenant(tenantId)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expandedTenants.has(tenantId) ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
                    <p className="text-sm text-gray-500">
                      {tenantUsers.length} usuario(s) • /{tenant.slug}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`http://${tenant.slug}.localhost:5173`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Acceder →
                  </a>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    tenant.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : tenant.status === 'trial'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tenant.status === 'active' ? 'Activo' : tenant.status === 'trial' ? 'Prueba' : 'Suspendido'}
                  </span>
                </div>
              </button>

              {expandedTenants.has(tenantId) && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-4">Nombre</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Rol</th>
                        <th className="text-left py-3 px-4">Sedes</th>
                        <th className="text-left py-3 px-4">Estado</th>
                        {(canEdit || canDelete || canChangePassword) && (
                          <th className="text-left py-3 px-4">Acciones</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {tenantUsers.map(renderUserRow)}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}

          {groupedUsers.superAdmin.length === 0 && Object.keys(groupedUsers.tenants).length === 0 && (
            <div className="card text-center py-12">
              <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay usuarios registrados</p>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Nombre</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Tenant</th>
                  <th className="text-left py-3 px-4">Rol</th>
                  <th className="text-left py-3 px-4">Sedes</th>
                  <th className="text-left py-3 px-4">Estado</th>
                  {(canEdit || canDelete || canChangePassword) && (
                    <th className="text-left py-3 px-4">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {users?.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      {user.tenant ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">{user.tenant.name}</span>
                          <span className="text-xs text-gray-500">/{user.tenant.slug}</span>
                        </div>
                      ) : (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          Super Admin
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">{user.role.name}</td>
                    <td className="py-3 px-4">
                      {user.branches.length > 0 ? (
                        <span className="text-sm text-gray-600">
                          {user.branches.map((b: any) => b.name).join(', ')}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Sin sedes</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    {(canEdit || canDelete || canChangePassword) && (
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {canEdit && (
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-blue-600 hover:text-blue-700"
                              title="Editar usuario"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                          )}
                          {canChangePassword && (
                            <button
                              onClick={() => handleChangePassword(user)}
                              className="text-green-600 hover:text-green-700"
                              title="Cambiar contraseña"
                            >
                              <Key className="w-5 h-5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Crear/Editar Usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  {...register('name', { required: true })}
                  className="input"
                  placeholder="Nombre completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  {...register('email', { required: true })}
                  className="input"
                  placeholder="email@ejemplo.com"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    {...register('password', { required: !editingUser })}
                    className="input"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol *
                </label>
                <select {...register('roleId', { required: true })} className="input">
                  <option value="">Seleccionar rol</option>
                  {roles?.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sedes
                </label>
                <div className="border rounded-lg p-4 max-h-48 overflow-y-auto bg-gray-50">
                  {branches && branches.length > 0 ? (
                    <div className="space-y-2">
                      {branches.map((branch) => (
                        <label
                          key={branch.id}
                          className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedBranches.includes(branch.id)}
                            onChange={() => handleBranchToggle(branch.id)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">{branch.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No hay sedes disponibles</p>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedBranches.length === 0 
                    ? 'No se han seleccionado sedes' 
                    : `${selectedBranches.length} sede(s) seleccionada(s)`}
                </p>
              </div>

              {editingUser && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Usuario activo
                  </label>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn btn-primary">
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cambiar Contraseña */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Cambiar Contraseña</h2>
              <button onClick={closePasswordModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Usuario:</strong> {changingPasswordUser?.name}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Email:</strong> {changingPasswordUser?.email}
              </p>
            </div>

            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Contraseña *
                </label>
                <input
                  type="password"
                  {...registerPassword('newPassword', { 
                    required: 'La contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'La contraseña debe tener al menos 6 caracteres'
                    }
                  })}
                  className="input"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="flex-1 btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn btn-primary">
                  Cambiar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
