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
import { AuthProvider, RequireAuth } from './components/AuthProvider'
import {Login} from './components/Login'

function App() {
  return (
    <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/dynamic-table/:pageTitle" element={
            <RequireAuth>
              <DynamicTablesUI tenantName={tenantName} />
            </RequireAuth>
          } />
          <Route path="/" element={
            <RequireAuth>
              <PageSchemas tenantName={tenantName} />
            </RequireAuth>
            } />
          {/* <Route path="/dynamic-table" element={<DynamicTablesUI tenantName={tenantName} />} /> */}
        </Routes>
      </AuthProvider>
  )
}
export default App
