import React, { useState, useEffect, useRef } from 'react';
import { getPageSchema } from '../services/apiService';
import sampleData from '../data/sampleMockData3.json';
import { GlobalSearch } from './Pages/GlobalSearch';
import { RowsPerPage } from './Pages/RowsPerPage';
import { ClearFiltersButton } from './Pages/ClearFiltersButton';
import { ColumnToggle } from './Pages/ColumnToggle';
import { DataTableComponent } from './Pages/DataTableComponent';
import { Toast } from 'primereact/toast'; // Import Toast component
import { v4 as uuidv4 } from 'uuid'; // Import UUID to generate unique IDs for rows
import { validateField } from './Pages/Validations';
import { getKycData, getPageData, getUserSpins } from '../services/dataService';
import { saveToLocalStorage, loadFromLocalStorage } from '../services/localStorage.js'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const DynamicTablesUI = ({ pageName }) => {
    const [schema, setSchema] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [rows, setRows] = useState(10);
    const [filteredData, setFilteredData] = useState();
    const [selectedRows, setSelectedRows] = useState([]);
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState(null);
    const [dateRangeFilter, setDateRangeFilter] = useState(null); // For range calendar filter
    const toast = useRef(null); // Create a toast reference

    const handleEdit = (newValue, colName, rowId) => {
        console.log('Editing:', { newValue, colName, rowId });

        // Find the row to edit
        const row = filteredData.find(row => row.id === rowId);
        if (!row) {
            console.error(`Row with id ${rowId} not found.`);
            return;
        }

        const oldValue = row[colName];
        if (newValue !== oldValue) {
            const validationResult = validateField(newValue, colName, schema);
            if (validationResult !== true) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Validation Error',
                    detail: validationResult,
                    life: 3000,
                });
                return; // Exit if validation fails
            }

            // Create a new array to update state immutably
            const updatedData = filteredData.map(row => {
                if (row.id === rowId) {
                    return { ...row, [colName]: newValue }; // Update only the matching row
                }
                return row; // Return unchanged rows
            });

            // Save the updated data to localStorage
            saveToLocalStorage('tableData', updatedData);

            // Update state immutably
            setFilteredData(updatedData); // Update filtered data
            setData(updatedData); // Update the main data

            // Display a success toast when data is updated
            toast.current.show({
                severity: 'success',
                summary: 'Data Updated...',
                detail: `${colName} updated to ${newValue}`,
                life: 3000,
            });
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch schema and data
                const schemaResponse = await getPageSchema(pageName);
                const schemaData = schemaResponse.data;
                const schemaColumns = schemaData.columns.columns; // Adjust for nested structure
                setSchema(schemaColumns);
                setSelectedColumns(schemaColumns);

                // Load table data from localStorage if available
                loadFromLocalStorage('tableData');

                const kycResponse = await getPageData(pageName);
                const kycData = kycResponse.data;
                console.log(JSON.stringify(kycData));

                if (Array.isArray(kycData.data)) {
                    const parsedData = kycData.data.map(row => {
                        const parsedRow = {};
                        parsedRow.id = uuidv4(); // Unique ID for each row

                        let isValidRow = true; // Flag to track if row has valid data

                        schemaData.columns.columns.forEach(col => {
                            if (row.hasOwnProperty(col.name)) {
                                if (col.type === 'date' && row[col.name]) {
                                    parsedRow[col.name] = new Date(row[col.name]);
                                } else {
                                    if (col.name === 'status') {
                                        parsedRow[col.name] = row[col.name] === 'approve' ? 'Approved' : row[col.name] === 'reject' ? 'Rejected' : row[col.name];
                                    } else {
                                        parsedRow[col.name] = row[col.name];
                                    }
                                }
                            } else {
                                isValidRow = false; // Mark row as invalid if a schema key is missing
                            }
                        });

                        return isValidRow ? parsedRow : null; // Only return row if it's valid
                    }).filter(row => row !== null); // Remove any invalid rows
                    // Save fetched data to localStorage
                    saveToLocalStorage('tableData', parsedData);
                    setData(parsedData);
                    setFilteredData(parsedData); // Set initial filtered data
                } else {
                    console.error('Sample Data is not in the expected array format:', kycData);
                    setError(new Error('Sample Data is not in the expected format'));
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching or parsing data:', error);
                setError(error);
                setLoading(false);
            }
        };
        fetchData();
    }, [pageName]);

    const filterData = (filterValue) => {
        const lowercasedFilter = filterValue.toLowerCase();
        const filtered = data.filter(row => {
            return Object.values(row).some(value =>
                String(value).toLowerCase().includes(lowercasedFilter)
            );
        });
        setFilteredData(filtered);
    };
    useEffect(() => {
        if (globalFilter) {
            filterData(globalFilter); // Apply global filter if it exists
        } else {
            setFilteredData(data); // Reset to original data if no filter
        }
    }, [data, globalFilter]);

    const resetSorting = () => {
        setSortField(null);
        setSortOrder(null);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="container">
            <Toast ref={toast} /> {/* Add Toast component */}
            <div className="header">
                <div className="hamburger-icon">
                    {/* Hamburger Icon */}
                    <button className="hamburger-button">☰</button>
                </div>
                <div className="page-title">
                    <h1 className="page-name">{pageName}</h1> {/* Centered page name */}
                </div>
                <div className="toolbar-right">
                    <ColumnToggle
                        schema={schema}
                        selectedColumns={selectedColumns}
                        setSelectedColumns={setSelectedColumns}
                    />
                    <GlobalSearch
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                        filterData={filterData}
                    />
                    <ClearFiltersButton
                        setGlobalFilter={setGlobalFilter}
                        setFilteredData={setFilteredData}
                        data={data}
                        schema={schema}
                        setSelectedRows={setSelectedRows}
                        resetSorting={resetSorting}
                        setDateRangeFilter={setDateRangeFilter}
                    />

                </div>
            </div>
            <DataTableComponent
                data={data}
                filteredData={filteredData}
                setFilteredData={setFilteredData}
                rows={rows}
                globalFilter={globalFilter}
                selectedColumns={selectedColumns}
                handleEdit={handleEdit}
                toast={toast}
                schema={schema}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                sortField={sortField}
                setSortField={setSortField}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                setData={setData}
                dateRangeFilter={dateRangeFilter}
                setDateRangeFilter={setDateRangeFilter}
                setRows={setRows}

            />
        </div >
    );
};
export default DynamicTablesUI;