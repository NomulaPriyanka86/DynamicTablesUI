import './App.css'
import DynamicTablesUI from './components/DynamicTablesUI'
import React from 'react'
import 'primeicons/primeicons.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PageSchemas from './components/Pages/PageSchemas'
import { tenantName } from './services/apiService';
import 'primereact/resources/themes/saga-blue/theme.css';  // Choose a theme
import 'primereact/resources/primereact.min.css';  // Core CSS
import 'primeicons/primeicons.css';  // Icons CSS
import AuthPage from './firebase-auth/AuthPage';
function App() {
  return (
    <Router> {/* Wrap your routes in a Router */}
      <Routes>
        <Route path="/" element={<AuthPage tenantName={tenantName} />} />
        <Route path="/dynamic-table/:pageTitle" element={<DynamicTablesUI tenantName={tenantName} />} />
        <Route path="/pageSchemas" element={<PageSchemas tenantName={tenantName} />} />
        {/* <Route path="/dynamic-table" element={<DynamicTablesUI tenantName={tenantName} />} /> */}
      </Routes>
    </Router>
  )
}
export default App
