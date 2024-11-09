import React, { useState, useEffect } from 'react';
import { getPageSchema } from '../services/apiService';
import sampleData from '../data/page1MockData.json';
import sampleuserspinData from '../data/sampleMockData.json';
import { GlobalSearch } from './Pages/GlobalSearch';
import { RowsPerPage } from './Pages/RowsPerPage';
import { ClearFiltersButton } from './Pages/ClearFiltersButton';
import { ColumnToggle } from './Pages/ColumnToggle';
import { DataTableComponent } from './Pages/DataTableComponent';

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

    // Handle editing of cell data
    const handleEdit = (newValue, colName, rowIndex) => {
        const updatedData = [...data];
        updatedData[rowIndex][colName] = newValue;
        setData(updatedData);
        setFilteredData(updatedData); // Reapply filter after editing
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
                setFilteredData(parsedData);
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
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
                rows={rows}
                globalFilter={globalFilter}
                selectedColumns={selectedColumns}
                formatDate={formatDate} // Pass the formatDate function to DataTableComponent
                handleEdit={handleEdit} // Pass the handleEdit function to allow editing
            />
        </div>
    );
};

export default DynamicTablesUI;
