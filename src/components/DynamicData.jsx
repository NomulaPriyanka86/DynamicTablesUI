import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { fetchKycData } from '../services/apiService';
import ReactPaginate from 'react-paginate';
import { Calendar } from 'primereact/calendar';
import { FaPencilAlt } from 'react-icons/fa';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";

export default function DynamicData() {
    const [kycData, setKycData] = useState([]);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState({ global: { value: null, matchMode: 'contains' } }) // Initialize global filter here}); // Initially empty, will dynamically update
    const [columnFilterValues, setColumnFilterValues] = useState({});
    const [visibleColumns, setVisibleColumns] = useState([]); // Columns to display
    const [availableColumns, setAvailableColumns] = useState([]); // All columns
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [rowClick, setRowClick] = useState(true);
    const [statusReason, setStatusReason] = useState('');
    const [showRejectionInput, setShowRejectionInput] = useState(false); // State to control visibility of rejection input
    const [editingCell, setEditingCell] = useState(null);
    const [originalValue, setOriginalValue] = useState('');
    const toast = useRef(null);
    const dataTableRef = useRef(null);

    const fetchPosts = async () => {
        const data = await fetchKycData();
        console.log("Data fetched for KYC:", data);
        setKycData(data);
        if (data.length > 0) {
            const columns = Object.keys(data[0]).map(key => ({
                field: key,
                header: key.charAt(0).toUpperCase() + key.slice(1),
                sortable: true,
                filter: true,
                matchMode: 'contains', // Set the default match mode for filtering
                editable: true, // Mark all fields as editable for demonstration
                // editable: editableFields.includes(key) // Check if the field is editable
                // validate: value => inferValidationRule(key, sampleValue)(value) // Dynamic validation
                validate: inferValidationRule(key, data[0][key]) // Pass sample value for validation inference
            }));
            setAvailableColumns(columns);
            // Set initial visible columns
            setVisibleColumns([
                columns.find(col => col.field === 'player_kyc_id'), // Always first
                columns.find(col => col.field === 'playerID'), // Include playerID if exists
                ...columns.filter(col => col.field !== 'player_kyc_id' && col.field !== 'playerID')
            ].filter(Boolean)); // Filter to remove any undefined values
            // Initialize filters dynamically
            const initialFilters = {};
            columns.forEach(column => {
                initialFilters[column.field] = { value: null, matchMode: 'contains' };
            });
            setFilters(initialFilters); // Set filters for each column
        }
    };

    useEffect(() => {
        fetchPosts(); // Fetch data on component mount
    }, []);
    function inferValidationRule(key, sampleValue) {
        let validationRule;

        if (typeof sampleValue === 'string') {
            // For string fields
            validationRule = (value) => {
                if (value.length === 0) {
                    return `${key} should not be empty.`; // String validation
                }
                return true; // Return true if valid
            };
        } else if (typeof sampleValue === 'number') {
            // For numeric fields
            validationRule = (value) => {
                if (isNaN(value) || value === '') {
                    return `${key} must be a valid number and cannot be empty.`; // Number validation
                }
                return true; // Return true if valid
            };
        }

        else {
            // Default validation for other types
            validationRule = () => true;
        }

        return validationRule;
    }

    // Global filter handler
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;

        // Update the global filter in the filters state
        setFilters((prevFilters) => ({
            ...prevFilters,
            global: { value, matchMode: 'contains' } // Update global filter
        }));
        setGlobalFilterValue(value);
        setCurrentPage(0); // Reset to first page

    }

    const clearFilters = () => {
        const clearedFilters = {
            global: { value: '', matchMode: 'contains' },
            ...Object.keys(filters).reduce((acc, key) => {
                acc[key] = { value: null, matchMode: 'contains' };
                return acc;
            }, {})
        };
        setFilters(clearedFilters);
        setGlobalFilterValue('');
        setCurrentPage(0);
        setSelectedProducts(null); // Reset checkbox selections here
        dataTableRef.current.reset(); // Reset sorting fields
    };
    const onColumnFilterChange = (field, value) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [field]: { value, matchMode: 'contains' }
        }));

        setColumnFilterValues((prevValues) => ({
            ...prevValues,
            [field]: value
        }));

        // Reset to first page
        if (dataTableRef.current) {
            dataTableRef.current.filter(value, field, 'contains');
        }
    };

    // Function to clear individual column filter
    const clearColumnFilter = (field) => {
        // Reset the filter state for the specific column
        setFilters((prevFilters) => ({
            ...prevFilters,
            [field]: { value: '', matchMode: 'contains' } // Resetting value to an empty string
        }));

        setColumnFilterValues((prevValues) => ({
            ...prevValues,
            [field]: '' // Clear the value for that column
        }));

        // Clear the DataTable filter and sorting for the specific column

        if (dataTableRef.current) {
            dataTableRef.current.reset(); // This resets sorting fields and clears filters
        }
    };

    // Filter data dynamically based on the global filter and column filters
    const filteredKycData = kycData.filter(data => {
        const globalMatch = globalFilterValue ? Object.values(data).some(value => {
            const stringValue = String(value).toLowerCase();
            const matches = stringValue.includes(globalFilterValue.toLowerCase());
            console.log(`Checking value: ${stringValue}, matches: ${matches}`);
            return matches;
        }) : true;

        const columnMatches = Object.keys(filters).every(column => {
            const { value, matchMode } = filters[column];
            if (!value) return true;

            const dataValue = String(data[column]).toLowerCase();
            const filterValue = value.toLowerCase();

            let matches = false;
            switch (matchMode) {
                case 'contains':
                    matches = dataValue.includes(filterValue);
                    break;
                case 'startsWith':
                    matches = dataValue.startsWith(filterValue);
                    break;
                case 'equals':
                    matches = dataValue === filterValue;
                    break;
                default:
                    matches = true;
            }
            console.log(`Column: ${column}, Data Value: ${dataValue}, Filter Value: ${filterValue}, Matches: ${matches}`);
            return matches;

        });

        console.log(`Global Match: ${globalMatch}, Column Matches: ${columnMatches}`);
        return globalMatch && columnMatches;

    });


    const totalRecords = filteredKycData.length;
    const pageCount = Math.ceil(filteredKycData.length / rowsPerPage);
    const displayedData = filteredKycData.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };


    // Function to update visible columns while preserving the original order
    const updateVisibleColumns = (newVisibleColumns) => {
        const orderedVisibleColumns = [
            availableColumns.find(col => col.field === 'player_kyc_id'), // Always first
            availableColumns.find(col => col.field === 'playerID'), // Include playerID if exists
            ...newVisibleColumns.map(field => availableColumns.find(col => col.field === field)).filter(Boolean) // Map selected fields to original columns
        ].filter(Boolean); // Filter to remove any undefined values
        setVisibleColumns(orderedVisibleColumns);
    }

    // Filter available columns to exclude player_kyc_id and playerID for MultiSelect
    const filteredAvailableColumns = availableColumns.filter(column =>
        column.field !== 'player_kyc_id' && column.field !== 'playerID'
    );
    // Custom filter function to compare dates
    const customDateFilter = (value, filter) => {
        if (!filter) return true; // If no filter is applied, show all
        const valueDate = new Date(value).toISOString().slice(0, 10); // Convert to 'yyyy-mm-dd'
        const filterDate = new Date(filter).toISOString().slice(0, 10);
        return valueDate === filterDate;
    };

    const formatDate = (date) => {
        if (!date) return null;

        const day = String(date.getDate()).padStart(2, '0'); // Get the day and pad with zeros
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month (0-indexed) and pad
        const year = String(date.getFullYear()).slice(-2); // Get the last two digits of the year

        return `${day}-${month}-${year}`; // Return in dd-mm-yy format
    };
    // Function to render a calendar filter in the date columns
    const calendarFilterTemplate = (options) => {
        const { filterValue, onChange, field } = options;
        // Destructure needed options
        return (
            <div className="calendar-filter">
                <Calendar
                    value={options.value}
                    onChange={(e) => {
                        const selectedDate = e.value ? e.value : null;
                        const formattedDate = selectedDate ? formatDate(selectedDate, 'dd-mm-yy') : null; // Format the date for display
                        console.log(`selected date is ${formattedDate}`); // Log the formatted date
                        options.filterCallback(selectedDate, 'custom'); // Apply custom filter
                    }}
                    dateFormat="dd-mm-yy" // Ensure correct date format
                    placeholder="dd-mm-yy" // Placeholder format
                    showIcon // Show the calendar icon
                />
                <Button
                    icon="pi pi-times"
                    onClick={() => clearColumnFilter(field)} // Clear button functionality
                    className="p-button-primary" // Style for clear button
                >
                    Clear
                </Button>
            </div>
        );
    };
    const handleApprove = () => {
        // Check if any selected rows have a status of 'Rejected'
        const hasRejectedRows = selectedProducts.some(product =>
            kycData.some(row => row.player_kyc_id === product.player_kyc_id && row.status === 'Rejected')
        );

        // If any selected row is rejected, show a toast message and exit the function
        if (hasRejectedRows) {
            toast.current.show({
                severity: 'error',
                summary: 'Action Not Allowed',
                detail: 'Cannot approve rejected records!',
                life: 3000
            });
            return; // Exit the function
        }

        const updatedKycData = kycData.map(row => {
            if (selectedProducts.some(product => product.player_kyc_id === row.player_kyc_id)) {
                return { ...row, status: 'Approved', status_reason: 'Approved' };
            }
            return row;
        });
        setKycData(updatedKycData);
        // setKycDataStore(updatedKycData); // Use the new function to save updated data to local storage
        setSelectedProducts(null); // Reset selection after approval
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Status updated to Approved!', life: 2000 });
    };

    // Function to handle rejection button click
    const handleRejectButtonClick = () => {
        // Check if any selected rows are already rejected
        const alreadyRejected = selectedProducts.some(product =>
            kycData.some(row => row.player_kyc_id === product.player_kyc_id && row.status === 'Rejected')
        );

        if (alreadyRejected) {
            toast.current.show({
                severity: 'error',
                summary: 'Action Not Allowed',
                detail: 'Cannot reject already rejected records!',
                life: 3000
            });
        } else {
            setShowRejectionInput(true);  // Only show the rejection input if no row is already rejected
        }
    };

    // Function to handle actual rejection logic after submitting reason
    const handleReject = () => {
        if (!statusReason) {
            toast.current.show({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Status Reason is required for rejection!',
                life: 3000
            });
            return;
        }

        const updatedKycData = kycData.map(row => {
            if (selectedProducts.some(product => product.player_kyc_id === row.player_kyc_id)) {
                return { ...row, status: 'Rejected', status_reason: statusReason }; // Include status reason in the update
            }
            return row;
        });

        setKycData(updatedKycData);
        // setKycDataStore(updatedKycData); // Use the new function to save updated data to local storage
        setSelectedProducts(null); // Reset selection after rejection
        setStatusReason(''); // Clear the status reason after rejection
        setShowRejectionInput(false); // Hide the rejection input after submission
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Status updated to Rejected!', life: 2000 });
    };

    const handleEditClick = (event, rowData, column) => {
        event.stopPropagation(); // Stop row selection
        setEditingCell({ rowId: rowData.player_kyc_id, field: column.field });
        setOriginalValue(rowData[column.field]);
    };
    const handleSave = (rowData, field, newValue) => {
        const column = availableColumns.find(col => col.field === field);
        if (column && column.validate) {
            const validationMessage = column.validate(newValue);
            if (validationMessage !== true) {
                toast.current.show({ severity: 'error', summary: 'Validation Error', detail: validationMessage, life: 3000 });
                return;
            }
        }
        const updatedKycData = kycData.map((row) =>
            row.player_kyc_id === rowData.player_kyc_id ? { ...row, [field]: newValue } : row
        );
        setKycData(updatedKycData);
        //setKycDataStore(updatedKycData); // Use the new function to save updated data to local storage
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Data saved successfully!', life: 3000 });
        setEditingCell(null);
    };
    const handleCancel = () => {
        setEditingCell(null);
    };

    const handleBlur = (rowData, field, newValue) => {
        if (newValue !== originalValue) {

            handleSave(rowData, field, newValue);

        } else {
            handleCancel();
        }
    };
    const handleKeyDown = (rowData, field, e) => {
        if (e.key === 'Enter') {
            const newValue = e.target.value; // Get the new value from the input
            handleSave(rowData, field, newValue); // Save with the new value
        }
    };

    const cellTemplate = (rowData, column) => {
        const isEditable = column.editable;
        const isEditing = editingCell && editingCell.rowId === rowData.player_kyc_id && editingCell.field === column.field;
        return (
            <div style={{ position: 'relative', paddingRight: '20px' }}>
                {isEditing ? (
                    <input
                        type="text"
                        defaultValue={rowData[column.field]}
                        onBlur={(e) => handleBlur(rowData, column.field, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(rowData, column.field, e)}
                        autoFocus
                    />
                ) : (
                    <div>
                        {rowData[column.field]}
                        {isEditable && (
                            <FaPencilAlt
                                onClick={(event) => handleEditClick(event, rowData, column)}
                                style={{ position: 'absolute', right: '5px', cursor: 'pointer', color: 'black' }}
                            />
                        )}
                    </div>
                )}
            </div>
        );
    };


    return (
        <div className="card" style={{ height: '100vh', padding: '1rem', margin: '0' }}>
            <h2>KYC DETAILS</h2>
            <Toast ref={toast} />
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
                        max={totalRecords}
                        step={1}
                        className="mr-2"
                    />
                    <span className="mr-2">entries</span>
                </div>
                <InputText
                    value={globalFilterValue}
                    // onChange={onGlobalFilterChange}
                    onChange={(e) => setGlobalFilterValue(e.target.value)}
                    placeholder="Search All"
                    className="w-full sm:w-20rem mr-2"
                />
                <Button label="Reset Filters" icon="pi pi-filter-slash" onClick={clearFilters} className="mr-2" />
                <MultiSelect
                    value={visibleColumns
                        .filter(col => col.field !== 'player_kyc_id' && col.field !== 'playerID')
                        .map(col => col.field)} // Use visibleColumns state without fixed columns
                    options={filteredAvailableColumns.map(col => ({ label: col.header, value: col.field }))} // Filtered columns for options
                    onChange={(e) => updateVisibleColumns(e.value)} // Use the new function to update columns
                    className="w-full sm:w-20rem"
                    placeholder="Select Columns"
                    display="chip"
                    filter // Add filtering capability for MultiSelect
                />
                {selectedProducts && selectedProducts.length > 0 && (
                    <div className="mb-3">
                        <Button label="Approve" icon="pi pi-check" className="p-button-success mr-2" onClick={handleApprove} />
                        <Button label="Reject" icon="pi pi-times" className="p-button-danger" onClick={handleRejectButtonClick} />
                    </div>
                )}
                {showRejectionInput && (
                    <div className="mb-3">
                        <InputText
                            value={statusReason}
                            onChange={(e) => setStatusReason(e.target.value)}
                            placeholder="Enter reason for rejection"
                            className="mr-2"
                        />
                        <Button label="Submit Reason" icon="pi pi-check" onClick={handleReject} />
                        <Button label="Cancel" icon="pi pi-times" onClick={() => { setShowRejectionInput(false); setStatusReason(''); }} />
                    </div>
                )}
            </div>
            <DataTable
                ref={dataTableRef} // Add ref to DataTable
                value={displayedData}
                rows={rowsPerPage}
                totalRecords={totalRecords}
                emptyMessage="No data found."
                globalFilter={filters.global?.value}
                filters={filters}
                removableSort
                showGridlines
                stripedRows
                selectionMode={rowClick ? null : 'checkbox'}
                selection={selectedProducts}
                onSelectionChange={(e) => setSelectedProducts(e.value)}
                scrollable={true}
                scrollHeight="600px"
                className="sticky-header"
                onRowClick={(event) => {
                    // Prevent row selection when clicking on a cell
                    event.stopPropagation();
                }}

            >
                <Column
                    selectionMode="multiple"
                    field="select_all"
                    header="Select All"
                    headerClassName="wide-column"
                />
                {visibleColumns.map(col => (
                    <Column
                        key={col.field}
                        field={col.field}
                        header={col.header}
                        sortable={col.sortable}
                        filter={col.filter}
                        filterPlaceholder={`Search ${col.header}`}
                        filterFunction={customDateFilter} // Custom filter function
                        filterElement={
                            ['approvedOn', 'createdOn', 'updatedOn'].includes(col.field)
                                ? calendarFilterTemplate // Use the calendar filter template for date fields
                                : (
                                    <>
                                        <InputText
                                            value={columnFilterValues[col.field]}
                                            onChange={(e) => onColumnFilterChange(col.field, e.target.value)}
                                            placeholder={`Filter ${col.header}`}
                                        />
                                        <Button
                                            icon="pi pi-times"
                                            onClick={() => clearColumnFilter(col.field)}
                                            className="p-button-primary" // Style the clear button

                                        >clear</Button>
                                    </>
                                )
                        }
                        body={(rowData) => cellTemplate(rowData, col)}

                    />
                ))}

            </DataTable>
            <ReactPaginate
                previousLabel={"Previous"}
                nextLabel={"Next"}
                breakLabel={"..."}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageClick}
                containerClassName={"pagination"}
                pageClassName={"page-item"}
                pageLinkClassName={"page-link"}
                previousClassName={"page-item"}
                previousLinkClassName={"page-link"}
                nextClassName={"page-item"}
                nextLinkClassName={"page-link"}
                activeClassName={"active"}
            />
        </div>
    );
}