import React, { useState, useEffect, useRef } from 'react';
import { getPageSchema } from '../services/apiService';
import sampleData from '../data/sampleMockData2.json';
import { GlobalSearch } from './Pages/GlobalSearch';
import { RowsPerPage } from './Pages/RowsPerPage';
import { ClearFiltersButton } from './Pages/ClearFiltersButton';
import { ColumnToggle } from './Pages/ColumnToggle';
import { DataTableComponent } from './Pages/DataTableComponent';
import { Toast } from 'primereact/toast'; // Import Toast component
import { v4 as uuidv4 } from 'uuid'; // Import UUID to generate unique IDs for rows
import { validateField } from './Pages/Validations';
import { getKycData, getUserSpins } from '../services/dataService';

const DynamicTablesUI = ({ pageName }) => {
    const [schema, setSchema] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [rows, setRows] = useState(10);
    const [filteredData, setFilteredData] = useState([]);
    const toast = useRef(null); // Create a toast reference

    const handleEdit = (newValue, colName, rowId) => {
        // Find the row to check if the value is actually different
        const row = data.find(row => row.id === rowId);
        const oldValue = row[colName];

        // Ensure newValue is a valid string or number before proceeding with validation
        if (newValue == null || newValue === '') {
            toast.current.show({
                severity: 'error',
                summary: 'Validation Error',
                detail: `${colName} cannot be empty`,
                life: 3000,
            });
            return;
        }

        if (newValue !== oldValue) {
            const validationResult = validateField(newValue, colName, schema);

            if (validationResult !== true) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Validation Error',
                    detail: validationResult,
                    life: 3000,
                });
                return; // Exit early if validation fails
            }

            const updatedData = data.map(row => {
                if (row.id === rowId) {
                    row[colName] = newValue; // Update only the matching row
                }
                return row;
            });

            // Update both data and filteredData
            setData(updatedData);
            setFilteredData(updatedData); // Directly reapply the updated data

            // Display a success toast when data is updated
            toast.current.show({
                severity: 'success',
                summary: 'Data Updated',
                detail: `${colName} updated to ${newValue}`,
                life: 3000,
            });
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const schemaResponse = await getPageSchema(pageName);
                const schemaData = schemaResponse.data;
                setSchema(schemaData);
                setSelectedColumns(schemaData.columns);

                const kycResponse = await getUserSpins();
                const kycData = kycResponse.data;

                console.log('KYC Data Array:', kycData.data);

                if (Array.isArray(kycData.data)) {
                    const parsedData = kycData.data.map(row => {
                        const parsedRow = {};
                        parsedRow.id = uuidv4(); // Unique ID for each row

                        let isValidRow = true; // Flag to track if row has valid data

                        schemaData.columns.forEach(col => {
                            if (row.hasOwnProperty(col.name)) {
                                if (col.type === 'Date' && row[col.name]) {
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

                    setData(parsedData);
                    setFilteredData(parsedData); // Set initial filtered data
                } else {
                    console.error('KYC Data is not in the expected array format:', kycData.data);
                    setError(new Error('KYC Data is not in the expected format'));
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
            filterData(globalFilter);
        } else {
            setFilteredData(data);
        }
    }, [data, globalFilter]); // Re-run the effect when data or globalFilter changes

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <Toast ref={toast} /> {/* Add Toast component */}

            <h1>Page Schema for {pageName}</h1>

            <div className="p-d-flex p-ai-center">
                <RowsPerPage
                    rows={rows}
                    setRows={setRows}
                    filteredData={filteredData}
                />
            </div>

            <div className="p-d-flex p-ai-center p-mb-3">
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
                />
            </div>

            <ColumnToggle
                schema={schema}
                selectedColumns={selectedColumns}
                setSelectedColumns={setSelectedColumns}
            />

            {/* Conditional rendering of the table headers or a no data message */}
            {filteredData.length === 0 ? (
                <table className="p-d-table">
                    <thead>
                        <tr>
                            {selectedColumns.map((col, index) => (
                                <th key={index} className="table-header">{col.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 || filteredData.every(row => Object.values(row).every(value => !value)) ? (
                            // If no data or all data is mismatched (empty or falsy), display only the headers
                            <tr>
                                <td colSpan={selectedColumns.length} className="no-data">No data available</td>
                            </tr>
                        ) : (
                            // If data is available and not mismatched, display the table rows
                            filteredData.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {selectedColumns.map((col, colIndex) => (
                                        <td key={colIndex}>{row[col.name]}</td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>


            ) : (
                <DataTableComponent
                    filteredData={filteredData}
                    setFilteredData={setFilteredData}
                    rows={rows}
                    globalFilter={globalFilter}
                    selectedColumns={selectedColumns}
                    handleEdit={handleEdit}
                    toast={toast}
                />
            )}
        </div>
    );
};

export default DynamicTablesUI;