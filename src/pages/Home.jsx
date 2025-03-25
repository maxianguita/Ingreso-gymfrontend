import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import UserList from '../componets/UserList';
import UserModal from '../componets/UseModal';
import CreateUserForm from '../pages/Register';

// Importar la imagen
import backgroundImage from '../asset/fondocross1.jpg';  

const Home = () => {
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center " style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center'  }}>

      {/* Botón de agregar usuario debajo del navbar, alineado a la izquierda */}
      <div className="w-full px-5 mt-10 flex justify-end">
        <button 
          onClick={() => setModalOpen(true)} 
          className="px-7 py-3 bg-blue-500 text-white rounded-lg mt-40"
        >
          + Agregar nuevo usuario
        </button>
      </div>

      <div className="max-w-6xl mx-20 p-5 mt-10">
  <Toaster />
  <h1 className="text-5xl font-bold text-center mb-6 text-white" style={{ textShadow: '4px 4px 8px rgba(0, 0, 0, 0.6)' }}>
    Usuarios Registrados
  </h1>

  {/* Contenedor flex para dividir lista y video */}
  <div className="flex justify-between items-start space-x-6">
    {/* Lista de usuarios en la izquierda */}
    <div className="bg-white bg-opacity-20 rounded-lg p-10">
      <UserList users={users} />
    </div>

    
          {/* Espacio vacío a la derecha, reemplazado por imagen de fondo */}
         
        </div>
      </div>

      {/* Modal de creación de usuario */}
      <UserModal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <CreateUserForm onUserCreated={fetchUsers} closeModal={() => setModalOpen(false)} />
      </UserModal>
    </div>
  );
};

export default Home;
