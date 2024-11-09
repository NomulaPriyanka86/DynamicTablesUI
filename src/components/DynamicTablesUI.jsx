import React, { useState, useEffect } from 'react';
import { getPageSchema } from '../services/apiService';
import sampleData from '../data/page1MockData.json';
import { GlobalSearch } from './Pages/GlobalSearch';
import { RowsPerPage } from './Pages/RowsPerPage';
import { ClearFiltersButton } from './Pages/ClearFiltersButton';
import { ColumnToggle } from './Pages/ColumnToggle';
import { DataTableComponent } from './Pages/DataTableComponent';

const DynamicTablesUI = ({ pageName }) => {
    const [schema, setSchema] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [rows, setRows] = useState(10);
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getPageSchema(pageName);
                const schemaData = response.data;
                setSchema(schemaData);
                setSelectedColumns(schemaData.columns);
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
                setFilteredData(filteredData);
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
            />
        </div>
    );
};

export default DynamicTablesUI;
