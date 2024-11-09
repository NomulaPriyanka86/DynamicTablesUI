import React, { useState } from 'react';

const ActionButtons = ({ selectedRows, setSelectedRows }) => {
    const [approving, setApproving] = useState(false);
    const [rejecting, setRejecting] = useState(false);

    // Handle the approval process
    const handleApprove = () => {
        setApproving(true); // Indicate approval is in progress

        // Simulate a delay or actual approval logic (you can replace this with API calls)
        setTimeout(() => {
            console.log('Approved:', selectedRows);
            setSelectedRows([]); // Clear the selected rows after approval
            setApproving(false); // Reset the approval state
        }, 1000); // Simulate some delay (e.g., network request)
    };

    // Handle the rejection process
    const handleReject = () => {
        setRejecting(true); // Indicate rejection is in progress

        // Simulate a delay or actual rejection logic (you can replace this with API calls)
        setTimeout(() => {
            console.log('Rejected:', selectedRows);
            setSelectedRows([]); // Clear the selected rows after rejection
            setRejecting(false); // Reset the rejection state
        }, 1000); // Simulate some delay (e.g., network request)
    };

    return (
        selectedRows.length > 0 && (
            <div style={{ marginTop: '10px' }}>
                <button onClick={handleApprove} disabled={approving} style={{ marginRight: '10px' }}>
                    {approving ? 'Approving...' : 'Approve'}
                </button>
                <button onClick={handleReject} disabled={rejecting}>
                    {rejecting ? 'Rejecting...' : 'Reject'}
                </button>
            </div>
        )
    );
};

export default ActionButtons;
