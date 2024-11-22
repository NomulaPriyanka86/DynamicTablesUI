import React from 'react';
import { InputText } from 'primereact/inputtext';
import 'primeicons/primeicons.css'; // Import PrimeIcons CSS for icons

export const GlobalSearch = ({ globalFilter, setGlobalFilter, filterData }) => {
    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Search Icon */}
            <i
                className="pi pi-search"
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '10px',
                    transform: 'translateY(-50%)',
                    color: '#999',
                    pointerEvents: 'none', // Ensure icon doesn't block input clicks
                }}
            ></i>
            {/* Input Field */}
            <InputText
                value={globalFilter}
                onChange={(e) => {
                    setGlobalFilter(e.target.value);
                    filterData(e.target.value);
                }}
                placeholder="Global Search"
                style={{
                    paddingLeft: '2rem', // Space for the search icon
                    width: '20em',
                }}
            />
        </div>
    );
};
