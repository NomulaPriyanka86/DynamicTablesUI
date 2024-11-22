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
            // placeholder="Toggle the Columns to Show/hide"
            style={{ width: '15em' }}
            display="chip"
            selectedItemTemplate={() => (
                <span style={{ color: 'gray' }}>Columns to Show/Hide</span>
            )} // Always show the placeholder
        />
    );
};
