import { Button } from 'primereact/button';
import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { saveToLocalStorage } from '../../services/localStorage';

const ActionButtons = ({ selectedRows, setSelectedRows, filteredData, setFilteredData }) => {
    const updateStatus = (status) => {
        let statusChanged = false;
        const updatedFilteredData = filteredData.map(dataRow => {
            if (selectedRows.includes(dataRow.id)) {
                if (dataRow.status === 'rejected' && status === 'approved') {
                    toast.warning('Rejected items cannot be approved.');
                    return dataRow;
                }
                if (dataRow.status !== status) {
                    statusChanged = true;
                    return { ...dataRow, status };
                }
            }
            return dataRow;
        });
        console.log('Updated Filtered Data:', updatedFilteredData);
        setFilteredData(updatedFilteredData);
        saveToLocalStorage('tableData', updatedFilteredData);
        setSelectedRows([]);

        if (statusChanged) {
            if (status === 'approved') {
                toast.success('Approved successfully!');
            } else if (status === 'rejected') {
                toast.error('Rejected successfully!');
            }
        }
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