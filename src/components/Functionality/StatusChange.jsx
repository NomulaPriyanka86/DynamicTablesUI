// Approval Reject Actions
import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { setKycDataStore } from '../../services/localStorage';

const StatusChange = ({ selectedProducts, kycData, setKycData, setSelectedProducts }) => {
    const [statusReason, setStatusReason] = useState('');
    const [showRejectionInput, setShowRejectionInput] = useState(false);
    const toast = useRef(null);

    const handleApprove = () => {
        // Check if any selected rows have a status of 'Rejected'
        const hasRejectedRows = selectedProducts.some(product =>
            kycData.some(row => row.player_kyc_id === product.player_kyc_id && row.status === 'Rejected')
        );
        // If any selected row is rejected, show a toast message and exit the function
        if (hasRejectedRows) {
            toast.current.show({
                severity: 'error',
                summary: 'Action Not Allowed',
                detail: 'Cannot approve rejected records!',
                life: 3000
            });
            return; // Exit the function
        }
        const updatedKycData = kycData.map(row => {
            if (selectedProducts.some(product => product.player_kyc_id === row.player_kyc_id)) {
                return { ...row, status: 'Approved', status_reason: 'Approved' };
            }
            return row;
        });
        setKycData(updatedKycData);
        setKycDataStore(updatedKycData); // Use the new function to save updated data to local storage
        setSelectedProducts(null); // Reset selection after approval
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Status updated to Approved!', life: 2000 });
    };
    // Function to handle rejection button click
    const handleRejectButtonClick = () => {
        // Check if any selected rows are already rejected
        const alreadyRejected = selectedProducts.some(product =>
            kycData.some(row => row.player_kyc_id === product.player_kyc_id && row.status === 'Rejected')
        );
        if (alreadyRejected) {
            toast.current.show({
                severity: 'error',
                summary: 'Action Not Allowed',
                detail: 'Cannot reject already rejected records!',
                life: 3000
            });
        } else {
            setShowRejectionInput(true);  // Only show the rejection input if no row is already rejected
        }
    };
    // Function to handle actual rejection logic after submitting reason
    const handleReject = () => {
        if (!statusReason) {
            toast.current.show({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Status Reason is required for rejection!',
                life: 3000
            });
            return;
        }
        const updatedKycData = kycData.map(row => {
            if (selectedProducts.some(product => product.player_kyc_id === row.player_kyc_id)) {
                return { ...row, status: 'Rejected', status_reason: statusReason }; // Include status reason in the update
            }
            return row;
        });
        setKycData(updatedKycData);
        setKycDataStore(updatedKycData); // Use the new function to save updated data to local storage
        setSelectedProducts(null); // Reset selection after rejection
        setStatusReason(''); // Clear the status reason after rejection
        setShowRejectionInput(false); // Hide the rejection input after submission
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Status updated to Rejected!', life: 2000 });
    };

    return (
        <div className="mb-3">
            <Toast ref={toast} />
            {selectedProducts && selectedProducts.length > 0 && (
                <div className="mb-3">
                    <Button label="Approve" icon="pi pi-check" className="p-button-success" onClick={handleApprove} />
                    <Button label="Reject" icon="pi pi-times" className="p-button-danger mr-2" onClick={handleRejectButtonClick} />
                </div>
            )}
            {showRejectionInput && (
                <div className="mb-3">
                    <input
                        type="text"
                        value={statusReason}
                        onChange={(e) => setStatusReason(e.target.value)}
                        placeholder="Enter reason for rejection"
                        className="rejectMessageInput"
                    />
                    <Button label="Submit Reason" icon="pi pi-check" onClick={handleReject} />
                    <Button label="Cancel" icon="pi pi-times" onClick={() => { setShowRejectionInput(false); setStatusReason(''); }} />
                </div>
            )}
        </div>
    );
};

export default StatusChange;