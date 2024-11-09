import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FaPencilAlt } from 'react-icons/fa'; // Pencil icon
import { Checkbox } from 'primereact/checkbox'; // For checkboxes
import ActionButtons from './ActionButtons'; // Import ActionButtons component

export const DataTableComponent = ({ filteredData, rows, globalFilter, selectedColumns, formatDate, handleEdit }) => {
    const [editingCell, setEditingCell] = useState(null); // Track which cell is being edited
    const [hoveredCell, setHoveredCell] = useState(null); // Track hovered cell
    const [selectedRows, setSelectedRows] = useState([]); // Track selected rows

    // Toggle selection for a row
    const handleRowSelect = (rowData) => {
        let newSelectedRows = [...selectedRows];
        if (newSelectedRows.includes(rowData)) {
            newSelectedRows = newSelectedRows.filter(row => row !== rowData); // Deselect
        } else {
            newSelectedRows.push(rowData); // Select
        }
        setSelectedRows(newSelectedRows);
    };

    // Handle "Select All" checkbox
    const handleSelectAll = () => {
        if (selectedRows.length === filteredData.length) {
            setSelectedRows([]); // Deselect all
        } else {
            setSelectedRows(filteredData); // Select all
        }
    };

    const renderColumn = (col) => {
        const matchMode = col.type === 'Date' ? 'dateIs' : 'contains';

        // Define a fixed width for each column or make it dynamic if you prefer
        const columnWidth = '20%';  // Default width of 20% or use dynamic width based on `col.width`

        return (
            <Column
                key={col.name}
                field={col.name}
                header={col.name}
                headerClassName="wide-column" // Apply custom class to the header
                sortable={true}
                filter={true}
                filterMatchMode={matchMode}
                filterPlaceholder={`Search ${col.name}`}
                style={{ textAlign: 'center', width: columnWidth }} // Fixed width for each column
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
            />
        );
    };

    return (
        <div style={{ overflowX: 'auto' }}> {/* Enable horizontal scrolling */}

            {/* Pass selectedRows and setSelectedRows to ActionButtons component */}
            <ActionButtons
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
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
                selection={selectedRows} // Pass selected rows to the DataTable
                onSelectionChange={(e) => setSelectedRows(e.value)} // Update selected rows on change
            >
                {/* Add Select All checkbox beside the header of the first column */}
                <Column
                    header={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {/* Place the "Select All" checkbox beside the header */}
                            <Checkbox
                                checked={selectedRows.length === filteredData.length}
                                onChange={handleSelectAll} // Handle "Select All"
                            />
                            <span style={{ marginLeft: '5px' }}>Select All</span>
                        </div>
                    }
                    body={(rowData) => (
                        <Checkbox
                            checked={selectedRows.includes(rowData)}
                            onChange={() => handleRowSelect(rowData)} // Select/deselect the row
                        />
                    )}
                    style={{ width: '3rem', textAlign: 'center' }} // Adjust width
                />

                {/* Render the other columns */}
                {selectedColumns && selectedColumns.map(col => renderColumn(col))}
            </DataTable>

        </div>
    );
};
