import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FaPencilAlt } from 'react-icons/fa';
import { Checkbox } from 'primereact/checkbox';
import ActionButtons from './ActionButtons';
import { Calendar } from 'primereact/calendar';
import { ToastContainer } from 'react-toastify';

// Utility function to format date to DD-MM-YYYY
const formatDateToDDMMYYYY = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
};

export const DataTableComponent = ({ filteredData, setFilteredData, rows, globalFilter, selectedColumns, handleEdit }) => {
    const [editingCell, setEditingCell] = useState(null);
    const [hoveredCell, setHoveredCell] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [columnFilters, setColumnFilters] = useState({});
    const [initialValue, setInitialValue] = useState(null);

    // Handle row selection
    const handleRowSelect = (rowData) => {
        const newSelectedRows = selectedRows.includes(rowData.id)
            ? selectedRows.filter(id => id !== rowData.id)
            : [...selectedRows, rowData.id];
        setSelectedRows(newSelectedRows);
    };

    // Handle "Select All" functionality
    const handleSelectAll = () => {
        if (selectedRows.length === filteredData.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(filteredData.map(row => row.id));
        }
    };

    // Handle filter change for date columns
    const handleDateFilterChange = (value, columnName) => {
        const formattedFilterDate = formatDateToDDMMYYYY(value);

        setColumnFilters(prevFilters => ({
            ...prevFilters,
            [columnName]: formattedFilterDate,
        }));

        const filtered = filteredData.filter(row => {
            const rowValueFormatted = formatDateToDDMMYYYY(row[columnName]);
            return rowValueFormatted === formattedFilterDate;
        });

        setFilteredData(filtered);
        // Reset the filter input after applying the filter
        setColumnFilters((prevFilters) => {
            const updatedFilters = { ...prevFilters };
            delete updatedFilters[columnName]; // Clear the current column filter after applying
            return updatedFilters;
        });
    };

    const renderColumn = (col) => {
        const matchMode = col.type === 'Date' ? 'dateIs' : 'contains';

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
                                    defaultValue={col.type === 'Date' ? formatDateToDDMMYYYY(value) : value || ''}
                                    autoFocus
                                    onFocus={() => setInitialValue(col.type === 'Date' ? formatDateToDDMMYYYY(value) : value || '')}
                                    onBlur={(e) => {
                                        const newValue = e.target.value;

                                        // Only process if the new value is different from the initial value
                                        if (newValue !== initialValue) {
                                            if (col.type === 'Date') {
                                                // Validate and parse the input date in DD-MM-YYYY format
                                                const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
                                                const match = newValue.match(dateRegex);

                                                if (match) {
                                                    const [_, day, month, year] = match;
                                                    const formattedDate = `${year}-${month}-${day}`; // Convert to YYYY-MM-DD format

                                                    const parsedDate = new Date(formattedDate);

                                                    // If it's a valid date, save it in YYYY-MM-DD format
                                                    if (!isNaN(parsedDate)) {
                                                        // Call handleEdit with the date in the correct format (YYYY-MM-DD)
                                                        handleEdit(parsedDate.toISOString().split('T')[0], col.name, rowData.id); // Send date in YYYY-MM-DD format

                                                        // Show toast with the formatted date in DD-MM-YYYY
                                                        const formattedToastDate = formatDateToDDMMYYYY(parsedDate);
                                                        toast.success(`Date updated to: ${formattedToastDate}`);
                                                    } else {
                                                        console.error('Invalid date format');
                                                    }
                                                } else {
                                                    console.error('Invalid date format');
                                                }
                                            } else {
                                                // Handle non-date fields
                                                handleEdit(newValue, col.name, rowData.id);
                                            }
                                        }

                                        setEditingCell(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const newValue = e.target.value;

                                            if (newValue !== initialValue) {
                                                if (col.type === 'Date') {
                                                    // Validate and parse the input date in DD-MM-YYYY format
                                                    const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
                                                    const match = newValue.match(dateRegex);

                                                    if (match) {
                                                        const [_, day, month, year] = match;
                                                        const formattedDate = `${year}-${month}-${day}`; // Convert to YYYY-MM-DD format

                                                        const parsedDate = new Date(formattedDate);

                                                        if (!isNaN(parsedDate)) {
                                                            // Save the date in YYYY-MM-DD format
                                                            handleEdit(parsedDate.toISOString().split('T')[0], col.name, rowData.id);

                                                            // Show toast with the formatted date
                                                            const formattedToastDate = formatDateToDDMMYYYY(parsedDate);
                                                            toast.success(`Date updated to: ${formattedToastDate}`);
                                                        } else {
                                                            console.error('Invalid date format');
                                                        }
                                                    } else {
                                                        console.error('Invalid date format');
                                                    }
                                                } else {
                                                    handleEdit(newValue, col.name, rowData.id);
                                                }
                                            }
                                            setEditingCell(null);
                                        }
                                    }}
                                />
                            ) : (
                                <>
                                    {col.type === 'Date' ? formatDateToDDMMYYYY(value) : value}
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

                filterElement={(options) => {
                    if (col.type === 'Date') {
                        return (
                            <div className="p-inputgroup">
                                <Calendar
                                    value={columnFilters[col.name] ? new Date(columnFilters[col.name].split('-').reverse().join('-')) : null}
                                    onChange={(e) => handleDateFilterChange(e.value, col.name)}
                                    showIcon
                                    dateFormat="dd-mm-yy"
                                    showButtonBar
                                />
                            </div>
                        );
                    } else {
                        return (
                            <input
                                type="text"
                                value={options.value}
                                onChange={(e) => options.filterCallback(e.target.value)}
                                placeholder={`Search ${col.name}`}
                            />
                        );
                    }
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
            <ToastContainer />

            <DataTable
                value={filteredData.length > 0 ? filteredData : []}  // Conditional rendering for rows
                paginator={true}
                rows={rows}
                showGridlines
                emptyMessage="No data available"
                globalFilter={globalFilter}
                selection={selectedRows}
                onSelectionChange={(e) => setSelectedRows(e.value)}
                dataKey="id"
                selectionMode="checkbox"
                onHeaderCheckboxToggle={handleSelectAll}
                removableSort
            >
                {selectedColumns.map((col) => renderColumn(col))}
            </DataTable>
        </div>
    );
};
