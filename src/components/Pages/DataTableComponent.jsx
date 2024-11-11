import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FaPencilAlt } from 'react-icons/fa';
import { Checkbox } from 'primereact/checkbox';
import ActionButtons from './ActionButtons';

export const DataTableComponent = ({ filteredData, setFilteredData, rows, globalFilter, selectedColumns, formatDate, handleEdit, toast }) => {
    const [editingCell, setEditingCell] = useState(null);
    const [hoveredCell, setHoveredCell] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);

    const handleRowSelect = (rowData) => {
        let newSelectedRows = [...selectedRows];
        if (newSelectedRows.includes(rowData)) {
            newSelectedRows = newSelectedRows.filter(row => row !== rowData);
        } else {
            newSelectedRows.push(rowData);
        }
        setSelectedRows(newSelectedRows);
    };

    const handleSelectAll = () => {
        if (selectedRows.length === filteredData.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(filteredData);
        }
    };

    const renderColumn = (col) => {
        const matchMode = col.type === 'Date' ? 'dateIs' : 'contains';
        const columnWidth = '20%';

        return (
            <Column
                key={col.name}
                field={col.name}
                header={col.name}
                headerClassName="wide-column"
                sortable={true}
                filter={true}
                filterMatchMode={matchMode}
                filterPlaceholder={`Search ${col.name}`}
                style={{ textAlign: 'center', width: columnWidth }}
                body={(rowData, { rowIndex }) => {
                    const value = rowData[col.name];
                    const isEditable = col.editable;

                    const handleMouseEnter = () => {
                        if (isEditable) {
                            setHoveredCell({ rowIndex, colName: col.name });
                        }
                    };

                    const handleMouseLeave = () => {
                        setHoveredCell(null);
                    };

                    return (
                        <div
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            {isEditable && editingCell?.rowIndex === rowIndex && editingCell?.colName === col.name ? (
                                <input
                                    type="text"
                                    defaultValue={value}
                                    autoFocus
                                    onBlur={(e) => {
                                        handleEdit(e.target.value, col.name, rowIndex);
                                        setEditingCell(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleEdit(e.target.value, col.name, rowIndex);
                                            setEditingCell(null);
                                        }
                                    }}
                                />
                            ) : (
                                <>
                                    {col.type === 'Date' ? formatDate(value) : value}
                                    {isEditable && (hoveredCell?.rowIndex === rowIndex && hoveredCell?.colName === col.name || editingCell?.rowIndex === rowIndex && editingCell?.colName === col.name) && (
                                        <FaPencilAlt
                                            style={{
                                                cursor: 'pointer',
                                                marginLeft: '5px',
                                                visibility: hoveredCell?.rowIndex === rowIndex && hoveredCell?.colName === col.name ? 'visible' : 'hidden',
                                            }}
                                            onClick={() => setEditingCell({ rowIndex, colName: col.name })}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    );
                }}
            />
        );
    };

    return (
        <div style={{ overflowX: 'auto' }}>
            <ActionButtons
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                filteredData={filteredData}
                setFilteredData={setFilteredData}
                toast={toast}
            />

            <DataTable
                value={filteredData}
                paginator={true}
                rows={rows}
                showGridlines
                stripedRows
                responsiveLayout="scroll"
                globalFilter={globalFilter}
                removableSort
                selection={selectedRows}
                onSelectionChange={(e) => setSelectedRows(e.value)}
            >
                <Column
                    header={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Checkbox
                                checked={selectedRows.length === filteredData.length}
                                onChange={handleSelectAll}
                            />
                            <span style={{ marginLeft: '5px' }}>Select All</span>
                        </div>
                    }
                    body={(rowData) => (
                        <Checkbox
                            checked={selectedRows.includes(rowData)}
                            onChange={() => handleRowSelect(rowData)}
                        />
                    )}
                    style={{ width: '3rem', textAlign: 'center' }}
                />

                {selectedColumns && selectedColumns.map(col => renderColumn(col))}
            </DataTable>
        </div>
    );
};
