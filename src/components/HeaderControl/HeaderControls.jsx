import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
import StatusChange from '../Functionality/StatusChange'; // Adjust the import based on your file structure

const HeaderControls = ({
    rowsPerPage,
    setRowsPerPage,
    currentPage,
    setCurrentPage,
    globalFilterValue,
    setGlobalFilterValue,
    clearFilters,
    visibleColumns,
    filteredAvailableColumns,
    updateVisibleColumns,
    selectedProducts,
    setSelectedProducts,
    kycData,
    setKycData,
    totalRecords,
}) => {
    return (
        <div className="sticky-header flex justify-content-between align-items-center mb-3">
            <div className="flex align-items-center">
                <label htmlFor="rows-per-page" className="mr-2">Show </label>
                <input
                    type="number"
                    id="rows-per-page"
                    value={rowsPerPage}
                    onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(0); // Reset to first page
                    }}
                    min={1}
                    max={totalRecords} // You need to pass this from the parent
                    step={1}
                    className="mr-2"
                />
                <span className="mr-2">entries</span>
            </div>
            <InputText
                value={globalFilterValue}
                onChange={(e) => setGlobalFilterValue(e.target.value)}
                placeholder="Search All"
                className="w-full sm:w-20rem mr-2"
            />
            <Button label="Reset Filters" icon="pi pi-filter-slash" onClick={clearFilters} className="mr-2" />
            <MultiSelect
                value={visibleColumns.filter(col => col.field !== 'player_kyc_id' && col.field !== 'playerID').map(col => col.field)}
                options={filteredAvailableColumns.map(col => ({ label: col.header, value: col.field }))}
                onChange={(e) => updateVisibleColumns(e.value)}
                className="w-full sm:w-20rem"
                placeholder="Select Columns"
                display="chip"
                filter // Add filtering capability for MultiSelect
            />
            <StatusChange
                selectedProducts={selectedProducts}
                setSelectedProducts={setSelectedProducts}
                kycData={kycData}
                setKycData={setKycData}
            />
        </div>
    );
};

export default HeaderControls;
