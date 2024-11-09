import React from 'react';

export const RowsPerPage = ({ rows, setRows, filteredData }) => {
    const handleRowChange = (e) => {
        const newRowsPerPage = Number(e.target.value);
        setRows(newRowsPerPage);
    };

    return (
        <div>
            <label htmlFor="rows-per-page" className="p-mr-2">Rows per page:</label>
            <input
                type="number"
                id="rows-per-page"
                value={rows}
                onChange={handleRowChange}
                min={1}
                max={filteredData.length}
                step={1}
                className="mr-2"
                style={{ width: '5em' }}
            />
        </div>
    );
};
