import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FaPencilAlt } from 'react-icons/fa'; // Pencil icon

export const DataTableComponent = ({ filteredData, rows, globalFilter, selectedColumns, formatDate, handleEdit }) => {
    const [editingCell, setEditingCell] = useState(null); // Track which cell is being edited
    const [hoveredCell, setHoveredCell] = useState(null); // Track hovered cell

    const renderColumn = (col) => {
        const matchMode = col.type === 'Date' ? 'dateIs' : 'contains';

        return (
            <Column
                key={col.name}
                field={col.name}
                header={col.name}
                sortable={true}
                filter={true}
                filterMatchMode={matchMode}
                filterPlaceholder={`Search ${col.name}`}
                body={(rowData, { rowIndex }) => {
                    const value = rowData[col.name];
                    const isEditable = col.editable; // Check if the column is editable

                    // Handle mouse enter and leave to track hovering over editable cells
                    const handleMouseEnter = () => {
                        if (isEditable) {
                            setHoveredCell({ rowIndex, colName: col.name }); // Set hovered cell
                        }
                    };

                    const handleMouseLeave = () => {
                        setHoveredCell(null); // Reset hovered cell
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
                                        handleEdit(e.target.value, col.name, rowIndex); // Save edited value
                                        setEditingCell(null); // Exit editing mode
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleEdit(e.target.value, col.name, rowIndex); // Save on Enter
                                            setEditingCell(null); // Exit editing mode
                                        }
                                    }}
                                />
                            ) : (
                                <>
                                    {col.type === 'Date' ? formatDate(value) : value}
                                    {/* Display pencil icon only if cell is editable and it's hovered or in edit mode */}
                                    {isEditable && (hoveredCell?.rowIndex === rowIndex && hoveredCell?.colName === col.name || editingCell?.rowIndex === rowIndex && editingCell?.colName === col.name) && (
                                        <FaPencilAlt
                                            style={{
                                                cursor: 'pointer',
                                                marginLeft: '5px',
                                                visibility: hoveredCell?.rowIndex === rowIndex && hoveredCell?.colName === col.name ? 'visible' : 'hidden', // Show on hover
                                            }}
                                            onClick={() => setEditingCell({ rowIndex, colName: col.name })} // Enter editing mode
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    );
                }}
                style={{ textAlign: 'center' }}
            />
        );
    };

    return (
        <DataTable
            value={filteredData}
            paginator={true}
            rows={rows}
            showGridlines
            stripedRows
            responsiveLayout="scroll"
            globalFilter={globalFilter}
            removableSort
        >
            {selectedColumns && selectedColumns.map(col => renderColumn(col))}
        </DataTable>
    );
};
