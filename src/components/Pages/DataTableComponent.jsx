import React, { useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FaPencilAlt } from 'react-icons/fa';
import { Checkbox } from 'primereact/checkbox';
import ActionButtons from './ActionButtons';
import { Calendar } from 'primereact/calendar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';  // Import the CSS for styling
import { validateField } from './Validations';
function formatDateToDDMMYYYY(date) {
    if (typeof date === 'string' && date.includes('-')) {
        // Assume the input is in DD-MM-YYYY format already
        return date;
    }

    // If it's a Date object, format it
    if (date instanceof Date && !isNaN(date)) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    return '';
}
export const DataTableComponent = ({ filteredData, setFilteredData, rows, globalFilter, selectedColumns, handleEdit, schema, selectedRows, setSelectedRows, sortField,
    setSortField,
    sortOrder,
    setSortOrder, setData }) => {
    const [editingCell, setEditingCell] = useState(null);
    const [hoveredCell, setHoveredCell] = useState(null);
    const [columnFilters, setColumnFilters] = useState({});
    const [initialValue, setInitialValue] = useState(null);
    const toastRef = useRef(null);

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
                                col.type === 'Date' ? (
                                    // Calendar component for selecting date
                                    <Calendar
                                        value={
                                            value && typeof value === 'string'
                                                ? new Date(value.split('-').reverse().join('-')) // Convert string to Date object
                                                : value instanceof Date
                                                    ? value
                                                    : null
                                        }
                                        onChange={(e) => {
                                            if (e.value) {
                                                // Format date as DD-MM-YYYY after selecting from calendar
                                                const day = String(e.value.getDate()).padStart(2, '0');
                                                const month = String(e.value.getMonth() + 1).padStart(2, '0');
                                                const year = e.value.getFullYear();
                                                const formattedDate = `${day}-${month}-${year}`;

                                                handleEdit(formattedDate, col.name, rowData.id); // Update with formatted date
                                            }
                                            setEditingCell(null); // Close the edit mode
                                        }}
                                        dateFormat="dd-mm-yy"
                                        autoFocus
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        defaultValue={value || ''}
                                        autoFocus
                                        onFocus={() => setInitialValue(value || '')}
                                        onBlur={(e) => {
                                            const newValue = e.target.value;
                                            if (col.type !== 'Date') {
                                                // Non-date field validation
                                                const validationMessage = validateField(newValue, col.name, schema);
                                                if (validationMessage !== true) {
                                                    toast.error(validationMessage, {
                                                        position: "top-right",
                                                    });
                                                } else {
                                                    handleEdit(newValue, col.name, rowData.id); // Update with non-date value
                                                }
                                            }
                                            setEditingCell(null); // Close the edit mode
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const newValue = e.target.value;
                                                if (col.type !== 'Date') {
                                                    // Non-date field validation
                                                    const validationMessage = validateField(newValue, col.name, schema);
                                                    if (validationMessage !== true) {
                                                        toast.error(validationMessage, {
                                                            position: "top-right",
                                                        });
                                                    } else {
                                                        handleEdit(newValue, col.name, rowData.id); // Update with non-date value
                                                    }
                                                }
                                                setEditingCell(null); // Close the edit mode
                                            }
                                        }}
                                    />
                                )
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
                setData={setData}
            />
            <ToastContainer />

            <DataTable
                value={filteredData.length > 0 ? filteredData : []}  // Conditional rendering for rows
                paginator={true}
                rows={rows}
                showGridlines
                emptyMessage="No data available"
                globalFilter={globalFilter}
                selection={selectedRows}  // Controlled by `selectedRows`
                onSelectionChange={(e) => setSelectedRows(e.value)}  // Updates the selected rows when checkboxes are clicked
                dataKey="id"
                removableSort
                sortField={sortField}
                sortOrder={sortOrder}
                onSort={(e) => {
                    setSortField(e.sortField);
                    setSortOrder(e.sortOrder);
                }}
            >
                <Column
                    header={
                        <div style={{ alignItems: 'center', width: '6rem' }}>
                            <div style={{ marginBottom: '10px' }}>Select All</div>
                            <Checkbox
                                checked={selectedRows.length === filteredData.length}
                                onChange={handleSelectAll}  // "Select All" functionality
                            />
                        </div>
                    }
                    body={(rowData) => (
                        <Checkbox
                            checked={selectedRows.includes(rowData.id)}  // Checkbox state is controlled by `selectedRows`
                            onChange={() => handleRowSelect(rowData)}  // Only update selection when checkbox is clicked
                        />
                    )}
                    style={{ width: '3rem', textAlign: 'center' }}
                />
                {selectedColumns && selectedColumns.map(col => renderColumn(col))}
            </DataTable>
        </div>
    );
};
