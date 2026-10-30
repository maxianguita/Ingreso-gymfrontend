import { Routes, Route } from "react-router-dom";
import Layout from "./Pages/Layout";
import Home from "./Pages/Home";
import AdminCreate from "./Pages/AdminCreate";
import AdminFind from "./Pages/AdminFind";
import MyPass from "./Pages/Pass";
import NotFound from "./Pages/NotFound";
import Clients from "./Pages/Clients";
import NfcCheck from "./Pages/NfcCheck";
import RequireAccess from './components/RequireAccess';
import Dashboard from './Pages/Dashboard';
import MemberDetails from './Pages/MemberDetails';
import Attendance from './Pages/Attendance';

export default function App() {
  return (
    <Routes>
      {/* Rutas con navbar (usan Layout) */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route element={<RequireAccess />}>
        <Route path="resumen" element={<Dashboard />} />
        <Route path="asistencias" element={<Attendance />} />
        <Route path="socios/:id" element={<MemberDetails />} />
        <Route path="admin">
          <Route path="create" element={<AdminCreate />} />
          <Route path="find" element={<AdminFind />} />
        </Route>
        <Route path="clientes" element={<Clients />} />
        </Route>
        <Route path="pases" element={<MyPass />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Ruta SIN navbar (fuera del Layout) */}
      <Route element={<RequireAccess role="reception" />}>
        <Route path="/nfc" element={<NfcCheck />} />
      </Route>
    </Routes>
  );
}
