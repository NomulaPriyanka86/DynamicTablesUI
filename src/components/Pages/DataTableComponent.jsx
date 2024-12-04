import React, { useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FaPencilAlt } from 'react-icons/fa';
import { Checkbox } from 'primereact/checkbox';
import ActionButtons from './ActionButtons';
import { Calendar } from 'primereact/calendar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for styling
import { validateField } from './Validations';
import { RowsPerPage } from './RowsPerPage';
// Function to format dates as mm/dd/yy
function formatDateToMMDDYY(date) {
    if (typeof date === 'string') {
        // If date is already a string, assume it’s in 'mm/dd/yy' format
        if (date.includes('/')) {
            return date;  // Return as is if already in correct format
        }
    }

    // If the value is a Date object or timestamp, convert it to 'mm/dd/yy' format
    if (date instanceof Date || !isNaN(new Date(date))) {
        const dateObject = new Date(date);
        const month = String(dateObject.getMonth() + 1).padStart(2, '0');  // Get month (1-based)
        const day = String(dateObject.getDate()).padStart(2, '0');  // Get day and ensure two digits
        const year = dateObject.getFullYear();  // Get last two digits of year
        return `${month}/${day}/${year}`;  // Format as 'mm/dd/yy'
    }

    return '';  // Return an empty string for invalid date values
}

export const DataTableComponent = ({
    data,
    filteredData,
    setFilteredData,
    rows,
    setRows,
    globalFilter,
    selectedColumns,
    handleEdit,
    schema,
    selectedRows,
    setSelectedRows,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    setData, dateRangeFilter, setDateRangeFilter,
    pageTitle
}) => {
    const [editingCell, setEditingCell] = useState(null);
    const [hoveredCell, setHoveredCell] = useState(null);
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
    const handleRangeFilterChange = (value, columnName) => {
        console.log('Selected date range:', value); // Log the selected range
        setDateRangeFilter(value); // Store the selected range in state

        if (value && value.length > 0) {
            const startDate = value[0]; // Get the start date (first item)
            let endDate = value[1] || new Date('9999-12-31'); // If no end date, set to a large future date

            // Ensure the end date is at the end of the day to include all records on that day
            endDate = new Date(endDate.setHours(23, 59, 59, 999));

            // Filter the data based on the selected date range
            const filtered = filteredData.filter(row => {
                let rowDate = row[columnName];

                // If rowDate is a string and matches the expected 'MM/DD/YYYY' format, split it
                if (typeof rowDate === 'string' && rowDate.includes('-')) {
                    rowDate = new Date(rowDate.split('-').reverse().join('-')); // Convert 'MM/DD/YYYY' to a Date object
                } else if (rowDate instanceof Date && !isNaN(rowDate)) {
                    // If it's already a Date object, we can directly use it
                    rowDate = new Date(rowDate);
                } else {
                    return false; // Skip if it's not a valid date format
                }

                // Compare row date against start and end date
                const isWithinRange = rowDate >= startDate && rowDate <= endDate;
                return isWithinRange;
            });

            setFilteredData(filtered);
        } else {
            // Reset filter if no range is selected
            setFilteredData(filteredData); // Resets the data to original
            setDateRangeFilter(null); // Clear the range input (this will reset the calendar input)
        }
    };
    // In your renderColumn method:
    const renderColumn = (col) => {
        const matchMode = col.type === 'date' ? 'dateIs' : 'contains';

        return (
            <Column
                key={col.name}
                field={col.name}
                header={col.displayName || col.name} // Use displayName if available, fallback to name
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
                                col.type === 'date' ? (
                                    <Calendar
                                        value={value && typeof value === 'string'
                                            ? new Date(value.split('-').reverse().join('-'))  // Convert 'MM/DD/YYYY' to Date (month and date will be correctly parsed)
                                            : value instanceof Date
                                                ? value
                                                : null
                                        }
                                        onChange={(e) => {
                                            if (e.value) {
                                                const day = String(e.value.getDate()).padStart(2, '0');
                                                const month = String(e.value.getMonth() + 1).padStart(2, '0');
                                                const year = e.value.getFullYear();
                                                const formattedDate = `${month}/${day}/${year}`;

                                                handleEdit(formattedDate, col.name, rowData.id);  // Update with formatted date
                                                // Refresh the page after the first edit
                                                window.location.reload();
                                            }

                                            setEditingCell(null);  // Close the edit mode
                                        }}
                                        dateFormat="mm/dd/yy"
                                        autoFocus
                                    />
                                ) : col.possibleValues ? (
                                    // Dropdown for columns with possibleValues
                                    <select
                                        value={value || ''}
                                        onChange={(e) => {
                                            handleEdit(e.target.value, col.name, rowData.id);
                                        }}
                                        autoFocus
                                    >
                                        <option value="">Select {col.displayName}</option>
                                        {col.possibleValues.map((val) => (
                                            <option key={val} value={val}>
                                                {val}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        defaultValue={value || ''}
                                        autoFocus
                                        onFocus={() => setInitialValue(value || '')}
                                        onBlur={(e) => {
                                            const newValue = e.target.value;
                                            if (col.type !== 'date') {
                                                const validationMessage = validateField(newValue, col.name, schema);
                                                if (validationMessage !== true) {
                                                    toast.error(validationMessage, {
                                                        position: "top-right",
                                                    });
                                                } else {
                                                    handleEdit(newValue, col.name, rowData.id);
                                                }
                                            }
                                            setEditingCell(null);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const newValue = e.target.value;
                                                if (col.type !== 'date') {
                                                    const validationMessage = validateField(newValue, col.name, schema);
                                                    if (validationMessage !== true) {
                                                        toast.error(validationMessage, {
                                                            position: "top-right",
                                                        });
                                                    } else {
                                                        handleEdit(newValue, col.name, rowData.id);
                                                    }
                                                }
                                                setEditingCell(null);
                                            }
                                        }}
                                    />
                                )
                            ) : (
                                <>
                                    {col.type === 'date' ? formatDateToMMDDYY(value) : value} {/* Use the function to format dates */}
                                    {isEditable &&
                                        (hoveredCell?.rowIndex === rowIndex && hoveredCell?.colName === col.name ||
                                            editingCell?.rowIndex === rowIndex && editingCell?.colName === col.name) && (
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
                    if (col.type === 'date') {
                        return (
                            <Calendar
                                value={dateRangeFilter}
                                onChange={(e) => handleRangeFilterChange(e.value, col.name)}
                                selectionMode="range"
                                placeholder="Select date range"
                                dateFormat="mm/dd/yy"  // Ensure date format is mm/dd/yy
                                showIcon
                            />
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
                pageTitle={pageTitle}
            />
            <ToastContainer />

            <DataTable
                data={data}
                value={filteredData.length > 0 ? filteredData : []} // Conditional rendering for rows
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
                paginatorLeft={<RowsPerPage rows={rows} setRows={setRows} filteredData={filteredData} />}
                paginatorRight
            >
                {/* Conditionally render the "Select All" column */}
                {selectedColumns.some(col => col.possibleValues) && (
                    <Column
                        header={
                            <div style={{ alignItems: 'center', width: '7rem' }}>
                                <Checkbox
                                    checked={selectedRows.length === filteredData.length}
                                    onChange={handleSelectAll}  // "Select All" functionality
                                />
                                <span style={{ paddingLeft: "10px" }}>Select All</span>
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
                )}
                {selectedColumns && selectedColumns.map(col => renderColumn(col))}
            </DataTable>
        </div>
    );
};
