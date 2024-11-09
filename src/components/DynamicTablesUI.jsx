import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { MultiSelect } from 'primereact/multiselect';
import { InputText } from 'primereact/inputtext'; // For the global search input
import { Button } from 'primereact/button'; // For the clear button
import { getPageSchema } from '../services/apiService';
import sampleData from '../data/page1MockData.json';
import 'primereact/resources/themes/saga-blue/theme.css'; // Theme CSS
import 'primereact/resources/primereact.min.css'; // Core CSS
import 'primeicons/primeicons.css'; // PrimeIcons CSS

const DynamicTablesUI = ({ pageName }) => {
    const [schema, setSchema] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [globalFilter, setGlobalFilter] = useState(''); // For global search input
    const [rows, setRows] = useState(10); // Number of rows to display
    const [filteredData, setFilteredData] = useState([]); // To hold the filtered data

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getPageSchema(pageName);
                const schemaData = response.data;
                setSchema(schemaData);
                setSelectedColumns(schemaData.columns); // Initialize with all columns visible

                // Filter sample data to include only columns that match the schema
                const filteredData = sampleData.map(row => {
                    const filteredRow = {};
                    schemaData.columns.forEach(col => {
                        if (row.hasOwnProperty(col.name)) {
                            filteredRow[col.name] = row[col.name];
                        }
                    });
                    return filteredRow;
                });

                setData(filteredData);
                setFilteredData(filteredData); // Set the filtered data
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

    const renderColumn = (col) => (
        <Column
            key={col.name}
            field={col.name}
            header={col.name}
            sortable={true}
            filter={true}
            filterPlaceholder={`Search ${col.name}`}
            editor={col.editable ? (options) => (
                <input
                    type={col.type === 'Date' ? 'date' : 'text'}
                    value={options.value}
                    onChange={(e) => options.editorCallback(e.target.value)}
                />
            ) : null}
            body={(rowData) => <span>{rowData[col.name]}</span>}
            style={{ textAlign: 'center' }} // Center-aligns the data
        />
    );

    const onColumnToggle = (e) => {
        // Sort the selected columns based on their order in the original schema
        const sortedColumns = schema.columns.filter(col => e.value.some(selected => selected.name === col.name));
        setSelectedColumns(sortedColumns);
    };

    const clearFilters = () => {
        // Reset the global filter and any specific column filters
        setGlobalFilter('');
        setFilteredData(data); // Reset to all data when cleared
        setSelectedColumns(schema ? schema.columns : []);
    };

    const handleRowChange = (e) => {
        const newRowsPerPage = Number(e.target.value);
        setRows(newRowsPerPage);
    };

    return (
        <div>
            <h1>Page Schema for {pageName}</h1>

            {/* Container for Row Size Input, Global Search, and Clear Filter in the same line */}
            {/* Rows per Page Input */}
            <div className="p-d-flex p-ai-center">
                <label htmlFor="rows-per-page" className="p-mr-2">Rows per page:</label>
                <input
                    type="number"
                    id="rows-per-page"
                    value={rows}
                    onChange={handleRowChange}
                    min={1}
                    max={filteredData.length} // Max rows to show is the filtered data length
                    step={1}
                    className="mr-2"
                    style={{ width: '5em' }}
                />
            </div>
            <div className="p-d-flex p-ai-center p-mb-3">

                {/* Global Search Input */}
                <InputText
                    value={globalFilter}
                    onChange={(e) => {
                        setGlobalFilter(e.target.value);
                        filterData(e.target.value); // Filter data on search
                    }}
                    placeholder="Global Search"
                    style={{ width: '20em', marginRight: '1em' }}
                />

                {/* Clear Filters Button */}
                <Button label="Clear Filters" icon="pi pi-times" onClick={clearFilters} style={{ marginRight: '1em' }} />


            </div>

            {/* Column Toggle */}
            <MultiSelect
                value={selectedColumns}
                options={schema ? schema.columns : []}
                optionLabel="name"
                onChange={onColumnToggle}
                placeholder="Select Columns to Show"
                style={{ width: '80em' }}
                display="chip"
            />

            <DataTable
                value={filteredData} // Use filtered data here
                paginator={true}
                rows={rows} // Set the number of rows based on the state
                totalRecords={filteredData.length} // Total records for pagination
                showGridlines
                stripedRows
                responsiveLayout="scroll"
                globalFilter={globalFilter} // Applying the global search filter
            >
                {selectedColumns && selectedColumns.map(col => renderColumn(col))}
            </DataTable>
        </div>
    );
};

export default DynamicTablesUI;
