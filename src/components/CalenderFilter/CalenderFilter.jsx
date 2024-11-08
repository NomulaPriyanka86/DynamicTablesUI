import React from 'react';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';

const CalendarFilter = ({ options, clearColumnFilter }) => {
    const { field } = options;

    const formatDate = (date) => {
        if (!date) return null;

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };

    return (
        <div className="calendar-filter">
            <Calendar
                value={options.value}
                onChange={(e) => {
                    const selectedDate = e.value ? e.value : null;
                    const formattedDate = selectedDate ? formatDate(selectedDate) : null;
                    console.log(`selected date is ${formattedDate}`);
                    options.filterCallback(formattedDate, 'custom');
                }}
                dateFormat="dd-mm-yy"
                placeholder="dd-mm-yy"
                showIcon
            />
            {/* <Button
                icon="pi pi-times"
                onClick={() => clearColumnFilter(field)}
                className="p-button-primary"
            >
                Clear
            </Button> */}
        </div>
    );
};

export default CalendarFilter;
