import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../asset/MYGYM.png';
import loguito from '../asset/cerrar.gif';
const Navbar = () => {
  return (
    <nav  className="fixed top-0 left-0 w-full backdrop-blur-md bg-black bg-opacity-80 p-5 shadow-md z-10">

      <ul className="flex justify-between items-center px-8">
        {/* Logo a la izquierda */}
        <li>
          <Link to="/">
            <img src={logo} alt="Logo" className="h-20 w-20 object-cover rounded-full" />
          </Link>
        </li>
        
        {/* Enlaces del navbar */}
        <li>
        <Link to="/">
            <img src={loguito} alt="Loghuito" className="h-10 w-10 object-cover " />
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
