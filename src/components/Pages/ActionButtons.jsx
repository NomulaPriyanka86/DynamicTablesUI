import { Button } from 'primereact/button';
import React from 'react';
import { toast } from 'react-toastify'; // Import toast
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

const ActionButtons = ({ selectedRows, setSelectedRows, filteredData, setFilteredData }) => {
    const updateStatus = (status) => {
        const updatedFilteredData = filteredData.map(dataRow => {
            // If the row id is in the selectedRows array, update its status
            if (selectedRows.includes(dataRow.id)) {
                return { ...dataRow, status };
            }
            return dataRow;  // Otherwise, leave the row unchanged
        });

        setFilteredData(updatedFilteredData);
        setSelectedRows([]); // Deselect after updating

        // Show a toast message based on the status
        if (status === 'approved') {
            toast.success('Approved successfully!');
        } else if (status === 'rejected') {
            toast.error('Rejected successfully!');
        }
    };


    // Check if all selected rows have the same status
    const allApproved = selectedRows.every(row => row.status === 'approved');
    const allRejected = selectedRows.every(row => row.status === 'rejected');

    const handleApprove = () => updateStatus('approved');
    const handleReject = () => updateStatus('rejected');

    return (
        <div style={{ marginBottom: '1rem' }}>
            {selectedRows.length > 0 && (
                <>
                    {/* Approve button */}
                    <Button
                        label="Approve"
                        icon="pi pi-check"
                        className="p-button-success"
                        onClick={handleApprove}
                        disabled={allApproved}
                    />
                    {/* Reject button */}
                    <Button
                        label="Reject"
                        icon="pi pi-times"
                        className="p-button-danger mr-2"
                        onClick={handleReject}
                        disabled={allRejected}
                        color="reject"
                    />
                </>
            )}
        </div>
    );
};

export default ActionButtons;
