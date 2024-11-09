import React from 'react';
import { InputText } from 'primereact/inputtext';

export const GlobalSearch = ({ globalFilter, setGlobalFilter, filterData }) => {
    return (
        <InputText
            value={globalFilter}
            onChange={(e) => {
                setGlobalFilter(e.target.value);
                filterData(e.target.value);
            }}
            placeholder="Global Search"
            style={{ width: '20em', marginRight: '1em' }}
        />
    );
};
