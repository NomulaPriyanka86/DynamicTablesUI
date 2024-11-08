import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { fetchKycData } from '../services/apiService';
import { Calendar } from 'primereact/calendar';
import { FaPencilAlt } from 'react-icons/fa';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import inferValidationRule from './Form/Validations';
import CustomPagination from './Pagination/CustomPagination';
import HeaderControls from './HeaderControl/HeaderControls';
import { getKycDataStore, setKycDataStore } from '../services/localStorage';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import CalendarFilter from './CalenderFilter/CalenderFilter';
import { fetchData } from '../services/getService';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { fetchUserSpins } from '../services/getUserSpins';

const DATE_FIELD_COLUMNS = ['createdOn', 'approvedOn', 'updatedOn', 'created_dt', 'updated_dt'];

export default function DataDynamic() {
    const [kycData, setKycData] = useState([]);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } }) // Initialize global filter here}); // Initially empty, will dynamically update
    const [availableColumns, setAvailableColumns] = useState([]); // All columns
    const [visibleColumns, setVisibleColumns] = useState([]); // Columns to display
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedProducts, setSelectedProducts] = useState(null);
    const [rowClick, setRowClick] = useState(true);
    const [editingCell, setEditingCell] = useState(null);
    const [originalValue, setOriginalValue] = useState('');
    const [columnFilterValues, setColumnFilterValues] = useState({});
    const [dynamicHeadersData, setDynamicHeadersData] = useState({ columns: [] });
    const [primaryKey, setPrimaryKey] = useState('');
    const [title, setTitle] = useState(''); // State for dynamic title
    const toast = useRef(null);
    const dataTableRef = useRef(null);

    const formatDate = (date) => {
        const d = new Date(date);
        if (isNaN(d)) {
            return date; // Return original if not a valid date
        }
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const formatBigIntToDate = (bigIntValue) => {
        const timestamp = Number(bigIntValue); // Convert BigInt to Number
        const date = new Date(timestamp * 1000); // Multiply by 1000 to convert to milliseconds

        if (isNaN(date)) {
            return 'Invalid date'; // Return a message if the date is invalid
        }

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
        const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of year

        return `${day}-${month}-${year}`;
    };

    const fetchPosts = async (pageName) => {
        try {
            const tenantName = 'bluboy'; // Always bluboy as specified
            const headersData = await fetchData(tenantName, pageName); // Fetch headers data

            if (!headersData || !Array.isArray(headersData.columns)) {
                console.log("Invalid headers data received or error occurred during fetch.");
                return; // Exit if there's no valid headers data
            }
            console.log("Data fetched for Headers Columns:", headersData);
            // Set headers data in state
            setDynamicHeadersData(headersData);
            // Determine the primary key dynamically
            setPrimaryKey(getPrimaryKey(headersData.columns));

            // Fetch KYC data
            const columnsData = await fetchUserSpins();
            if (!Array.isArray(columnsData)) {
                console.error('Expected KYC data to be an array:', columnsData);
                setKycData([]); // Set empty array if columnsData is not valid
            } else {
                console.log("Columns Data fetched for Headers Columns:", columnsData);
                setKycData(columnsData.length > 0 ? columnsData : []); // Set to columnsData if available, else empty array
            }

            // Prepare columns based on headersData
            const columns = headersData.columns.map(column => {
                const formattedColumn = {
                    field: column.name,
                    header: column.name.replace(/_/g, ' ').charAt(0).toUpperCase() + column.name.slice(1), // Capitalize and format the name
                    sortable: true,
                    filter: true,
                    dataType: DATE_FIELD_COLUMNS.includes(column.name) ? "date" : "text",
                    filterField: DATE_FIELD_COLUMNS.includes(column.name) ? "date" : "string",
                    editable: true,
                    validate: columnsData.length > 0 ? inferValidationRule(column.name, columnsData[0][column.name], {
                        minDigits: 1,
                        maxDigits: 5,
                        minChars: 3,
                        maxChars: 20,
                        allowNegative: false,
                        allowZero: false,
                        minDate: '01-01-2000', // Example minimum date
                        maxDate: '12-31-2024'  // Example maximum date
                    }) : null
                };

                // Format date fields if the column name matches
                if (DATE_FIELD_COLUMNS.includes(column.name)) {
                    columnsData.forEach(row => {
                        if (row[column.name]) {
                            row[column.name] = formatDate(row[column.name]);
                        }
                    });
                }

                return formattedColumn;
            });

            setAvailableColumns(columns); // Set available columns in state
            setVisibleColumns(columns);   // Set visible columns to include all headers

            // // Fetch KYC data
            // const columnsData = await fetchUserSpins();
            // if (!Array.isArray(columnsData)) {
            //     console.error('Expected KYC data to be an array:', columnsData);
            //     setKycData([]); // Set to empty array if columnsData is not valid
            // } else {
            //     console.log("Columns Data fetched for Headers Columns:", columnsData);
            //     setKycData(columnsData.length > 0 ? columnsData : [{}]); // Show empty row if no data
            // }

            // Initialize filters for each column
            const initialFilters = {};
            columns.forEach(column => {
                initialFilters[column.field] = DATE_FIELD_COLUMNS.includes(column.field)
                    ? { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] }
                    : { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] };
            });
            setFilters(initialFilters); // Set initial filters in state

        } catch (error) {
            console.error("Error fetching posts:", error); // Log any errors
        }
    };
    useEffect(() => {
        const pageName = "user_spins"; // Replace with actual page name as needed
        setTitle(pageName); // Set the title based on pageName
        fetchPosts(pageName); // Call the fetchPosts function with the dynamic pageName
    }, []);

    const getPrimaryKey = (columns) => {
        // Check for the primary key in the columns
        const primaryKeyColumn = columns.find(column => column.isPrimaryKey);
        // If a primary key is found, return its name; otherwise, return a fallback value
        return primaryKeyColumn ? primaryKeyColumn.name : (columns.find(column => column.name === 'id')?.name || columns[0]?.name || 'id');
    };

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
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            ...Object.keys(filters).reduce((acc, key) => {
                acc[key] = DATE_FIELD_COLUMNS.includes(key) ? { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] } : { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] };
                //acc[key] = { value: null, matchMode: 'contains' };
                return acc;
            }, {})
        };
        setFilters(clearedFilters);
        setGlobalFilterValue('');
        setCurrentPage(0);
        setSelectedProducts(null); // Reset checkbox selections here
        dataTableRef.current.reset(); // Reset sorting fields
    };
    const onColumnFilterChange = (columnName, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [columnName]: { ...prevFilters[columnName], value } // Update the value for the specific column
        }));
    };

    // const onColumnFilterChange = (field, value) => {
    //     setFilters((prevFilters) => ({
    //         ...prevFilters,
    //         [field]: { value, matchMode: 'contains' }
    //     }));

    //     setColumnFilterValues((prevValues) => ({
    //         ...prevValues,
    //         [field]: value
    //     }));

    //     // Reset to first page
    //     if (dataTableRef.current) {
    //         dataTableRef.current.filter(value, field, 'contains');
    //     }
    // };

    // // Function to clear individual column filter
    // const clearColumnFilter = (field) => {
    //     // Reset the filter state for the specific column
    //     setFilters((prevFilters) => ({
    //         ...prevFilters,
    //         [field]: { value: '', matchMode: 'contains' } // Resetting value to an empty string
    //     }));

    //     setColumnFilterValues((prevValues) => ({
    //         ...prevValues,
    //         [field]: '' // Clear the value for that column
    //     }));

    //     // Clear the DataTable filter and sorting for the specific column

    //     if (dataTableRef.current) {
    //         dataTableRef.current.reset(); // This resets sorting fields and clears filters
    //     }
    // };

    // const calendarFilterTemplate = (options) => {
    //     return <CalendarFilter options={options} />;
    // };

    const dateFilterTemplate = (options) => {
        return <Calendar
            value={options.value}
            onChange={(e) => options.filterCallback(e.value, options.index)}
            dateFormat="dd-mm-yy"
            placeholder="dd-mm-yy"
            showIcon
        />;
    };

    // Apply pagination on filtered data
    const filteredKycData = kycData.filter(data => {
        // Global filter logic
        const globalMatch = globalFilterValue
            ? Object.values(data).some(value =>
                String(value).toLowerCase().includes(globalFilterValue.toLowerCase())
            )
            : true;

        // Column-wise filter logic
        const columnMatches = Object.keys(filters).every(column => {
            const { value, matchMode } = filters[column];
            if (!value) return true; // No filter set for this column, so it matches all data

            const dataValue = String(data[column]).toLowerCase(); // Get the data value for the current column
            const filterValue = String(value).toLowerCase(); // Get the filter value for the current column

            // Apply the specific match mode for filtering
            return matchMode === FilterMatchMode.CONTAINS
                ? dataValue.includes(filterValue)
                : dataValue.startsWith(filterValue);
        });

        // Combine global and column-wise filtering
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
            ...availableColumns.filter(col => newVisibleColumns.includes(col.field) && col.field !== 'player_kyc_id' && col.field !== 'playerID') // Include new visible columns maintaining their original order
        ].filter(Boolean); // Filter to remove any undefined values
        setVisibleColumns(orderedVisibleColumns);
    };
    // Filter available columns to exclude player_kyc_id and playerID for MultiSelect
    const filteredAvailableColumns = availableColumns.filter(column =>
        column.field !== 'player_kyc_id' && column.field !== 'playerID'
    );
    const handleEditClick = (event, rowData, column) => {
        event.stopPropagation(); // Stop row selection
        setEditingCell({ rowId: rowData[primaryKey], field: column.field });
        // Log the row ID using the value you set
        console.log(`The row ID is: ${rowData[primaryKey]}`); // Change this line
        console.log('primaryKey:', primaryKey); // Log the primaryKey to ensure it's defined
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
            row[primaryKey] === rowData[primaryKey] ? { ...row, [field]: newValue } : row
        );
        setKycData(updatedKycData);
        setKycDataStore(updatedKycData); // Use the new function to save updated data to local storage
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
        const isEditing = editingCell && editingCell.rowId === rowData[primaryKey] && editingCell.field === column.field;
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
            <h2>{title}</h2>
            <Toast ref={toast} />
            <HeaderControls
                rowsPerPage={rowsPerPage}
                setRowsPerPage={setRowsPerPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                globalFilterValue={globalFilterValue}
                setGlobalFilterValue={setGlobalFilterValue}
                clearFilters={clearFilters}
                visibleColumns={visibleColumns}
                filteredAvailableColumns={filteredAvailableColumns}
                updateVisibleColumns={updateVisibleColumns}
                selectedProducts={selectedProducts}
                setSelectedProducts={setSelectedProducts}
                kycData={kycData}
                setKycData={setKycData}
            />
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
                // selectionMode={rowClick ? null : 'checkbox'}
                selectionMode="checkbox"
                selection={selectedProducts}
                onSelectionChange={(e) => setSelectedProducts(e.value)}
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
                {visibleColumns.map(col => (
                    <Column
                        key={col.field}
                        field={col.field}
                        header={col.header}
                        sortable={col.sortable}
                        filter={col.filter}
                        dataType={col.dataType}
                        //filterField={col.filterField}
                        filterPlaceholder={`Search ${col.header}`}
                        // filterFunction={customDateFilter} // Custom filter function
                        filterElement={
                            DATE_FIELD_COLUMNS.includes(col.field)
                                // ? dateFilterTemplate : null // Use the calendar filter template for date fields
                                ? dateFilterTemplate : (
                                    <>
                                        <InputText
                                            value={columnFilterValues[col.field]}
                                            onChange={(e) => onColumnFilterChange(col.field, e.target.value)}
                                            placeholder={`Filter ${col.header}`}
                                        />
                                        {/* <Button
                                        icon="pi pi-times"
                                        onClick={() => clearColumnFilter(col.field)}
                                        className="p-button-primary" // Style the clear button

                                    >clear</Button> */}
                                    </>
                                )
                        }
                        body={(rowData) => cellTemplate(rowData, col)}
                    />
                ))}
            </DataTable>
            {pageCount > 0 && (
                <CustomPagination
                    pageCount={pageCount}
                    currentPage={currentPage}
                    onPageChange={handlePageClick}
                />)}
        </div>
    );
}
