import React from 'react';
import { Button } from 'primereact/button';

export const ClearFiltersButton = ({ setGlobalFilter, setFilteredData, data, schema }) => {
    const clearFilters = () => {
        setGlobalFilter('');
        setFilteredData(data);
    };

    return (
        <Button label="Clear Filters" icon="pi pi-times" onClick={clearFilters} style={{ marginRight: '1em' }} />
    );
};
