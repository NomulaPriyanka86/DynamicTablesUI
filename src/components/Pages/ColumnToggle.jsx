import React from 'react';
import { MultiSelect } from 'primereact/multiselect';

export const ColumnToggle = ({ schema, selectedColumns, setSelectedColumns }) => {
    const onColumnToggle = (e) => {
        const sortedColumns = schema.columns.filter(col => e.value.some(selected => selected.name === col.name));
        setSelectedColumns(sortedColumns);
    };

    return (
        <MultiSelect
            value={selectedColumns}
            options={schema ? schema.columns : []}
            optionLabel="name"
            onChange={onColumnToggle}
            placeholder="Select Columns to Show"
            style={{ width: '80em' }}
            display="chip"
        />
    );
};
