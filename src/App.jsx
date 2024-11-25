import './App.css'
import DataDynamic from './components/DataDynamic'
import DynamicTablesUI from './components/DynamicTablesUI'
import PageSchema from './components/PageSchema'
import React from 'react'
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'primeicons/primeicons.css';

function App() {
  return (
    <>
      <DynamicTablesUI pageName="spin_new" />
      {/* <PageSchema pageName="player" /> */}
      <ToastContainer />
    </>
  )
}
export default App
