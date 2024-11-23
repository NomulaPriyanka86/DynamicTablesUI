import React from 'react';
import { Button } from 'primereact/button';

export const ClearFiltersButton = ({ setGlobalFilter, setFilteredData, data, schema, setSelectedRows, resetSorting, setDateRangeFilter }) => {
    const clearFilters = () => {
        setGlobalFilter('');
        setFilteredData(data);
        setSelectedRows([]); // Clear selected rows when filters are cleared.
        resetSorting(); // New function to reset sorting
        setDateRangeFilter(null);
    };

    return (
        <Button label="Clear Search" icon="pi pi-times" onClick={clearFilters} />
    );
};
