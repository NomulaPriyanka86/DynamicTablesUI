import React, { useState, useEffect, useRef } from 'react';
import { getPageSchema } from '../services/apiService';
import sampleData from '../data/page1MockData.json';
import { GlobalSearch } from './Pages/GlobalSearch';
import { RowsPerPage } from './Pages/RowsPerPage';
import { ClearFiltersButton } from './Pages/ClearFiltersButton';
import { ColumnToggle } from './Pages/ColumnToggle';
import { DataTableComponent } from './Pages/DataTableComponent';
import { Toast } from 'primereact/toast'; // Import Toast component
import { v4 as uuidv4 } from 'uuid'; // Import UUID to generate unique IDs for rows

// Utility function to format date into dd-mm-yy format
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return dateString; // Return original string if parsing fails
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    return `${day}-${month}-${year}`;
};

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

        // Only update if the new value is different from the old value
        if (newValue !== oldValue) {
            // Update data with the edited value
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
                const response = await getPageSchema(pageName);
                const schemaData = response.data;
                setSchema(schemaData);
                setSelectedColumns(schemaData.columns);

                const parsedData = sampleData.map(row => {
                    const parsedRow = {};
                    // Add a primary key (unique id) to each row
                    parsedRow.id = uuidv4(); // Unique ID for each row
                    schemaData.columns.forEach(col => {
                        if (row.hasOwnProperty(col.name)) {
                            // Check if the column type is 'Date' and format it
                            if (col.type === 'Date' && row[col.name]) {
                                parsedRow[col.name] = new Date(row[col.name]);
                            } else {
                                // If the column is 'status', dynamically set the value
                                if (col.name === 'status') {
                                    parsedRow[col.name] = row[col.name] === 'approve' ? 'Approved' : row[col.name] === 'reject' ? 'Rejected' : row[col.name];
                                } else {
                                    parsedRow[col.name] = row[col.name];
                                }
                            }
                        }
                    });
                    return parsedRow;
                });

                setData(parsedData);
                setFilteredData(parsedData); // Set initial filtered data
                setLoading(false);
            } catch (error) {
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

            <DataTableComponent
                filteredData={filteredData}
                setFilteredData={setFilteredData}
                rows={rows}
                globalFilter={globalFilter}
                selectedColumns={selectedColumns}
                formatDate={formatDate} // Pass the formatDate function to DataTableComponent
                handleEdit={handleEdit} // Pass the handleEdit function to allow editing
                toast={toast} // Pass toast reference to DataTableComponent for notifications
            />
        </div>
    );
};

export default DynamicTablesUI;