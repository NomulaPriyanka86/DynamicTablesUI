import './App.css'
import DataDynamic from './components/DataDynamic'
import DynamicTablesUI from './components/DynamicTablesUI'
import PageSchema from './components/Pages/PageSchema'
import React from 'react'

function App() {
  return (
    <>
      <DynamicTablesUI pageName="player" />
      {/* <PageSchema pageName="player" /> */}
    </>
  )
}
export default App
