import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import dayjs from 'dayjs';

const CreateUserForm = ({ onUserCreated, closeModal }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [fechaRegistro, setFechaRegistro] = useState('');
  const [loading, setLoading] = useState(false); // Estado para manejar el loading
  const [loadingModalVisible, setLoadingModalVisible] = useState(false); // Estado para mostrar el modal de carga

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || !apellido || !telefono || !email || !fechaRegistro) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    setLoading(true);
    setLoadingModalVisible(true); // Mostrar modal de carga

    try {
      const apiUrl = process.env.REACT_APP_API_URL;

      const fechaISO = dayjs(fechaRegistro).toISOString(); // Convertimos a ISO

      const response = await fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, apellido, telefono, email, fecha_registro: fechaISO }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Usuario creado con éxito!');
        setNombre('');
        setApellido('');
        setTelefono('');
        setEmail('');
        setFechaRegistro('');
        onUserCreated(); // Actualizar lista de usuarios
        closeModal(); // Cerrar modal
      } else {
        toast.error(data.error);
      }

      // Simulando que el proceso tarda un poco más
      setTimeout(() => {
        setLoading(false);
        setLoadingModalVisible(false); // Ocultar el modal de carga después de un retraso simulado
      }, 12000); // 2 segundos de retraso para simular el tiempo de carga

    } catch (error) {
      toast.error('Error al crear el usuario');
      setLoading(false);
      setLoadingModalVisible(false); // Ocultar modal si ocurre un error
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Toaster />
        <h2 className="text-2xl font-bold text-center mb-4">Crear Usuario</h2>
        <ul className="space-y-6">
          <li>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre"
              className="input-field w-full p-2 border border-gray-300 rounded-lg"
            />
          </li>
          <li>
            <input
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder="Apellido"
              className="input-field w-full p-2 border border-gray-300 rounded-lg"
            />
          </li>
          <li>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Teléfono"
              className="input-field w-full p-2 border border-gray-300 rounded-lg"
            />
          </li>
          <li>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="input-field w-full p-2 border border-gray-300 rounded-lg"
            />
          </li>
          <li>
            <input
              type="datetime-local"
              value={fechaRegistro}
              onChange={(e) => setFechaRegistro(e.target.value)}
              className="input-field w-full p-2 border border-gray-300 rounded-lg"
            />
          </li>
        </ul>
        <button 
          type="submit" 
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg" 
          disabled={loading} // Desactivar el botón durante la carga
        >
          {loading ? 'Creando Usuario...' : 'Crear Usuario'} {/* Cambiar el texto mientras carga */}
        </button>
      </form>

      {/* Modal de Carga */}
      {loadingModalVisible && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin border-t-4 border-blue-500 border-solid w-12 h-12 rounded-full mx-auto mb-4"></div>
            <p className="text-xl">Creando usuario...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateUserForm;
