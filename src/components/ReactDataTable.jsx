import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';
import { FaPencilAlt } from 'react-icons/fa';
import { Toast } from 'primereact/toast';
import ReactPaginate from 'react-paginate';
import { fetchKycData } from '../services/apiService'; // Import the service
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import { getKycDataStore, setKycDataStore } from '../services/localStorage';
import { Calendar } from 'primereact/calendar';
export default function ReactDataTable() {
    const [kycData, setKycData] = useState([]);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: 'contains' },
        player_kyc_id: { value: null, matchMode: 'contains' },
        playerID: { value: null, matchMode: 'startsWith' },
        kyc_type: { value: null, matchMode: 'contains' },
        kycNumber: { value: null, matchMode: 'contains' },
        approvedBy: { value: null, matchMode: 'contains' },
        approvedOn: { value: null, matchMode: 'contains' },
        createdOn: { value: null, matchMode: 'equals' },
        updatedBy: { value: null, matchMode: 'contains' },
        updatedOn: { value: null, matchMode: 'contains' },
        status: { value: null, matchMode: 'contains' },
        status_reason: { value: null, matchMode: 'contains' }
    });
    const [editingCell, setEditingCell] = useState(null);
    const [originalValue, setOriginalValue] = useState('');
    const allColumns = [
        { field: 'kyc_type', header: 'KYC Type', sortable: true, filter: true },
        { field: 'kycNumber', header: 'KYC Number', sortable: true, filter: true },
        { field: 'approvedBy', header: 'Approved By', sortable: true, filter: true },
        { field: 'approvedOn', header: 'Approved On', sortable: true, filter: true },
        { field: 'createdOn', header: 'Created On', sortable: true, filter: true },
        { field: 'updatedBy', header: 'Updated By', sortable: true, filter: true },
        { field: 'updatedOn', header: 'Updated On', sortable: true, filter: true },
        { field: 'status', header: 'Status', sortable: true, filter: true },
        { field: 'status_reason', header: 'Status Reason', sortable: true, editable: true, filter: true }
    ];
    const [visibleColumns, setVisibleColumns] = useState(allColumns);
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const toast = useRef(null);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [rowClick, setRowClick] = useState(true);
    const [statusReason, setStatusReason] = useState('');
    const [showRejectionInput, setShowRejectionInput] = useState(false); // State to control visibility of rejection input

    const fetchPosts = async () => {
        const data = await fetchKycData();
        setKycData(data);
        setKycDataStore(data); // Use the new function to save to local storage
    };

    useEffect(() => {
        const storedData = getKycDataStore(); // Use the new function to get data from local storage
        if (storedData) {
            setKycData(storedData);
        } else {
            fetchPosts();
        }
    }, []);

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        setFilters({
            ...filters,
            global: { value, matchMode: 'contains' }
        });
        setGlobalFilterValue(value);
        setCurrentPage(0);
    };
    const clearFilters = () => {
        setFilters({
            global: { value: null, matchMode: 'contains' },
            player_kyc_id: { value: null, matchMode: 'contains' },
            playerID: { value: null, matchMode: 'startsWith' },
            kyc_type: { value: null, matchMode: 'contains' },
            kycNumber: { value: null, matchMode: 'contains' }, // Reset kycNumber filter
            approvedBy: { value: null, matchMode: 'contains' },
            approvedOn: { value: null, matchMode: 'contains' },
            createdOn: { value: null, matchMode: 'equals' },
            updatedBy: { value: null, matchMode: 'contains' },
            updatedOn: { value: null, matchMode: 'contains' },
            status: { value: null, matchMode: 'contains' },
            status_reason: { value: null, matchMode: 'contains' }
        });
        setGlobalFilterValue('');
        setCurrentPage(0);
        setSelectedProducts(null); // Reset checkbox selections here
        dataTableRef.current.reset(); // Reset sorting fields
    };

    // Update the validation logic with specific error messages
    const validateField = (field, value) => {
        switch (field) {
            case 'kyc_type':
                // if (!/^[A-Za-z\s]+$/.test(value)) {
                //     return { valid: false, message: 'KYC Type should contain only alphabets.' };
                // }
                // return { valid: true };

                // List of valid KYC types
                const validKycTypes = ['aadhaar', 'voter id', 'pan', 'driving license', 'passport']; // Lowercase for comparison
                if (!validKycTypes.includes(value.toLowerCase())) {
                    return { valid: false, message: 'KYC Type should be one of: Aadhaar, Voter Id, Pan, Driving License,Passport.' };
                }
                return { valid: true };
            case 'kycNumber':
                if (!/^[A-Za-z0-9]{6,12}$/.test(value)) {
                    return { valid: false, message: 'KYC Number should be alphanumeric and 6-12 characters long.' };
                }
                return { valid: true };
            case 'status':
                if (value !== 'Approved' && value !== 'Rejected') {
                    return { valid: false, message: 'Status should be either Approved or Rejected.' };
                }
                return { valid: true };
            case 'status_reason':
                if (value && value.length > 200) {
                    return { valid: false, message: 'Status Reason should not exceed 200 characters.' };
                }
                return { valid: true }; // Optional field, valid if empty
            default:
                return { valid: true }; // Other fields are considered valid
        }
    };

    const handleEditClick = (event, rowData, column) => {
        event.stopPropagation(); // Stop row selection
        setEditingCell({ rowId: rowData.player_kyc_id, field: column.field });
        setOriginalValue(rowData[column.field]);
    };
    const handleSave = (rowData, field, newValue) => {
        // if (!validateField(field, newValue)) {
        //     toast.current.show({ severity: 'error', summary: 'Validation Error', detail: `Invalid value for ${field}`, life: 3000 });
        //     return;
        // }
        const updatedKycData = kycData.map((row) =>
            row.player_kyc_id === rowData.player_kyc_id ? { ...row, [field]: newValue } : row
        );
        setKycData(updatedKycData);
        setKycDataStore(updatedKycData); // Use the new function to save updated data to local storage
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Data saved successfully!', life: 3000 });
        setEditingCell(null);
    };
    const handleCancel = () => {
        setEditingCell(null);
    };
    // // Utility function to capitalize the first letter of each word
    // const capitalizeWords = (str) => {
    //     return str
    //         .split(' ')
    //         .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    //         .join(' ');
    // };

    const handleBlur = (rowData, field, newValue) => {
        if (newValue !== originalValue) {
            // // Capitalize the first letter of each word for kyc_type
            // const valueToValidate = field === 'kyc_type' ? capitalizeWords(newValue) : newValue;
            // const validationResult = validateField(field, valueToValidate);
            // if (!validationResult.valid) {
            //     toast.current.show({
            //         severity: 'error',
            //         summary: 'Validation Error',
            //         detail: validationResult.message, // Use the specific error message
            //         life: 5000
            //     });
            //     // Reset the value back to the original
            //     handleCancel(); // Cancel the editing
            //     return; // Stop further processing
            // }
            const confirmSave = window.confirm("You have unsaved changes. Do you want to save?");
            if (confirmSave) {
                handleSave(rowData, field, valueToValidate);
            } else {
                handleCancel();
            }
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
        setKycDataStore(updatedKycData); // Use the new function to save updated data to local storage
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
        setKycDataStore(updatedKycData); // Use the new function to save updated data to local storage
        setSelectedProducts(null); // Reset selection after rejection
        setStatusReason(''); // Clear the status reason after rejection
        setShowRejectionInput(false); // Hide the rejection input after submission
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Status updated to Rejected!', life: 2000 });
    };



    const filteredKycData = kycData.filter(data => {
        const globalMatch = globalFilterValue ? (
            (data.player_kyc_id && data.player_kyc_id.toString().includes(globalFilterValue)) || // player_kyc_id
            (data.playerID && data.playerID.toString().includes(globalFilterValue)) || // playerID
            (data.kyc_type && data.kyc_type.toLowerCase().includes(globalFilterValue.toLowerCase())) || // kyc_type
            (data.kycNumber && data.kycNumber.toLowerCase().includes(globalFilterValue.toLowerCase())) || // kycNumber
            (data.approvedBy && data.approvedBy.toLowerCase().includes(globalFilterValue.toLowerCase())) || // approvedBy
            (data.approvedOn && data.approvedOn.includes(globalFilterValue)) || // approvedOn (date as string)
            (data.createdOn && data.createdOn.includes(globalFilterValue)) || // createdOn (date as string)
            (data.updatedBy && data.updatedBy.toLowerCase().includes(globalFilterValue.toLowerCase())) || // updatedBy
            (data.updatedOn && data.updatedOn.includes(globalFilterValue)) || // updatedOn (date as string)
            (data.status && data.status.toLowerCase().includes(globalFilterValue.toLowerCase())) || // status
            (data.status_reason && data.status_reason.toLowerCase().includes(globalFilterValue.toLowerCase())) // status_reason
        ) : true;
        const playerIDMatch = filters.playerID.value ? (
            data.playerID && data.playerID.toString().startsWith(filters.playerID.value)
        ) : true;
        const kyc_type_Match = filters.kyc_type.value ? (
            data.kyc_type && data.kyc_type.toLowerCase().includes(filters.kyc_type.value.toLowerCase())
        ) : true;
        const kycNumberMatch = filters.kycNumber.value ? (
            data.kycNumber && data.kycNumber.toLowerCase().includes(filters.kycNumber.value.toLowerCase())
        ) : true;
        const statusMatch = filters.status.value ? (
            data.status && data.status.toLowerCase().includes(filters.status.value.toLowerCase())
        ) : true;
        return globalMatch && playerIDMatch && kyc_type_Match && kycNumberMatch && statusMatch;
    });
    const totalRecords = filteredKycData.length;
    const pageCount = Math.ceil(filteredKycData.length / rowsPerPage);
    const displayedData = filteredKycData.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };
    const onColumnToggle = (event) => {
        const selectedFields = event.value.map(col => col.field);
        const orderedVisibleColumns = allColumns.filter(col => selectedFields.includes(col.field));
        setVisibleColumns(orderedVisibleColumns);
    };

    // Custom filter function to compare dates
    const customDateFilter = (value, filter) => {
        if (!filter) return true; // If no filter is applied, show all
        const valueDate = new Date(value).toISOString().slice(0, 10); // Convert to 'yyyy-mm-dd'
        const filterDate = new Date(filter).toISOString().slice(0, 10);
        return valueDate === filterDate;
    };

    // Function to render a calendar filter in the date columns
    const calendarFilterTemplate = (options) => {
        return (
            <Calendar
                value={options.value}
                onChange={(e) => {
                    const selectedDate = e.value ? e.value.toISOString().slice(0, 10) : null; // Format date
                    options.filterCallback(selectedDate, 'custom'); // Apply custom filter
                }}
                dateFormat="yy-mm-dd" // Ensure correct date format
                placeholder="yy-mm-dd" // Placeholder format
                showIcon // Show the calendar icon
            />
        );
    };
    const dataTableRef = useRef(null);

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
                        min={1}  // Minimum value
                        max={totalRecords} // Maximum value
                        step={1} // Step value for increment/decrement
                        className="mr-2" // Add margin to the right for spacing
                    />
                    <span className="mr-2">entries</span>
                </div>
                <InputText
                    value={globalFilterValue}
                    onChange={onGlobalFilterChange}
                    placeholder="Search All"
                    className="w-full sm:w-20rem mr-2" // Add margin to the right for spacing
                />
                <Button label="Reset Filters" icon="pi pi-filter-slash" onClick={clearFilters} className="mr-2" /> {/* Add margin for spacing */}
                <MultiSelect
                    value={visibleColumns}
                    options={allColumns}
                    optionLabel="header"
                    onChange={onColumnToggle}
                    className="w-full sm:w-20rem"
                    placeholder="Select Columns"
                    display="chip"
                />
            </div>

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
            <DataTable
                ref={dataTableRef} // Add ref to DataTable
                value={displayedData}
                // paginator
                rows={rowsPerPage}
                totalRecords={filteredKycData.length}
                emptyMessage="No data found."
                globalFilter={filters.global.value}
                filters={filters}
                removableSort
                showGridlines
                stripedRows
                selectionMode={rowClick ? null : 'checkbox'}
                selection={selectedProducts}
                onSelectionChange={(e) => setSelectedProducts(e.value)}
                responsiveLayout="scroll"
                scrollable={true}
                scrollHeight="500px"
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
                <Column
                    field="player_kyc_id"
                    header="Player Kyc Id"
                    sortable
                    filter
                    filterPlaceholder="Filter by Player Kyc Id"
                    headerClassName="wide-column"
                />
                <Column
                    field="playerID"
                    header="Player ID"
                    sortable
                    filter
                    filterPlaceholder="Filter by Player ID"
                    headerClassName="wide-column"
                />
                {visibleColumns.map((col) => (
                    <Column key={col.field}
                        field={col.field}
                        header={col.header}
                        sortable={col.sortable}
                        filter={col.filter}
                        filterPlaceholder={`search ${col.header}`}
                        filterFunction={customDateFilter} // Custom filter function
                        filterElement={['approvedOn', 'createdOn', 'updatedOn'].includes(col.field) ? calendarFilterTemplate : null} // Conditionally apply filter element for date fields
                        body={(rowData) => cellTemplate(rowData, col)}
                        headerClassName="wide-column"
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