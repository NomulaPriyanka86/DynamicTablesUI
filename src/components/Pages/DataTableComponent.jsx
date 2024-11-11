import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FaPencilAlt } from 'react-icons/fa';
import { Checkbox } from 'primereact/checkbox';
import ActionButtons from './ActionButtons';
import { ToastContainer } from 'react-toastify';

export const DataTableComponent = ({ filteredData, setFilteredData, rows, globalFilter, selectedColumns, formatDate, handleEdit }) => {
    const [editingCell, setEditingCell] = useState(null);
    const [hoveredCell, setHoveredCell] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);

    // Use 'id' as the unique key for each row
    const handleRowSelect = (rowData) => {
        const newSelectedRows = selectedRows.includes(rowData.id)
            ? selectedRows.filter(id => id !== rowData.id)  // Deselect if already selected
            : [...selectedRows, rowData.id];  // Select if not already selected
        setSelectedRows(newSelectedRows);
    };

    const handleSelectAll = () => {
        if (selectedRows.length === filteredData.length) {
            setSelectedRows([]);  // Deselect all if all rows are selected
        } else {
            setSelectedRows(filteredData.map(row => row.id));  // Select all rows by their unique 'id'
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
                                        handleEdit(e.target.value, col.name, rowData.id);  // Pass 'rowData.id' to identify the row
                                        setEditingCell(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleEdit(e.target.value, col.name, rowData.id);  // Pass 'rowData.id' to identify the row
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
            />
            <ToastContainer /> {/* Add this line */}

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
                rowKey="id"  // Use 'id' as the primary key for rows
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
                            checked={selectedRows.includes(rowData.id)}  // Check based on 'id'
                            onChange={() => handleRowSelect(rowData)}  // Pass the whole row for selection
                        />
                    )}
                    style={{ width: '3rem', textAlign: 'center' }}
                />

                {selectedColumns && selectedColumns.map(col => renderColumn(col))}
            </DataTable>
        </div>
    );
};