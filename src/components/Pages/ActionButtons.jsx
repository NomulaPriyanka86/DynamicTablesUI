import React from 'react';
import { Button } from 'primereact/button';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ActionButtons = ({ selectedRows, setSelectedRows, filteredData, setFilteredData }) => {
    const updateStatus = (status) => {
        const updatedFilteredData = filteredData.map(dataRow => {
            const rowToUpdate = selectedRows.find(selected => selected.player_kyc_id === dataRow.player_kyc_id);
            if (rowToUpdate) {
                if (status === 'approved' && dataRow.status === 'rejected') {
                    toast.warn('Rejected rows cannot be approved!');
                    return dataRow;
                } else if (status === 'rejected' && dataRow.status === 'rejected') {
                    toast.warn('This row is already rejected!');
                    return dataRow;
                } else if (status === 'approved' && dataRow.status === 'approved') {
                    toast.warn('This row is already approved!');
                    return dataRow;
                } else {
                    toast.success(`This Row is now ${status}!`);
                    return { ...dataRow, status };
                }
            }
            return dataRow;
        });

        setFilteredData(updatedFilteredData);
        setSelectedRows([]);
    };

    const handleApprove = () => updateStatus('approved');
    const handleReject = () => updateStatus('rejected');

    return (
        <div style={{ marginBottom: '1rem' }}>
            {selectedRows.length > 0 && (
                <>
                    <Button
                        label="Approve"
                        icon="pi pi-check"
                        className="p-button-success"
                        onClick={handleApprove}
                    />
                    <Button
                        label="Reject"
                        icon="pi pi-times"
                        className="p-button-danger mr-2"
                        onClick={handleReject}
                    />
                </>
            )}
        </div>
    );
};

export default ActionButtons;
