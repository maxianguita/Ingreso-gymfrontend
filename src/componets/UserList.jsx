import React from 'react';

const UserList = ({ users }) => {
  return (
    <div className="max-h-80 overflow-y-auto border border-gray-300 rounded-lg p-4">
      <ul className="user-list space-y-2">
        {users.map((user) => (
          <li key={user.id} className="p-2 bg-gray-100 rounded-md shadow flex justify-between items-center">
            <span>{user.nombre} {user.apellido} - Ingreso: {user.fecha_registro}</span>
            <span className="text-red-500 font-semibold">Vencimiento: {user.fecha_vencimiento}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
