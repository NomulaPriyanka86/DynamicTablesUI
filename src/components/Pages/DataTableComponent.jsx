import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

export const DataTableComponent = ({ filteredData, rows, globalFilter, selectedColumns }) => {

    const renderColumn = (col) => (
        <Column
            key={col.name}
            field={col.name}
            header={col.name}
            sortable={true}
            filter={true}
            filterPlaceholder={`Search ${col.name}`}
            body={(rowData) => <span>{rowData[col.name]}</span>}
            style={{ textAlign: 'center' }}
        />
    );

    return (
        <DataTable
            value={filteredData}
            paginator={true}
            rows={rows}
            totalRecords={filteredData.length}
            showGridlines
            stripedRows
            responsiveLayout="scroll"
            globalFilter={globalFilter}
        >
            {selectedColumns && selectedColumns.map(col => renderColumn(col))}
        </DataTable>
    );
};
