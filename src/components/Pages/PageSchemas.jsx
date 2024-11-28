import React, { useState, useEffect } from 'react';
import { getAllPageNames } from '../../services/apiService';
import { Link } from 'react-router-dom';
import { Tree } from 'primereact/tree';

const PageSchemas = ({ tenantName }) => {
    const [schemas, setSchemas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSchemas = async () => {
            try {
                const response = await getAllPageNames(tenantName);
                console.log('The response data for the tenant is:', response);

                if (response.data && Array.isArray(response.data.pageData)) {
                    // Construct tree nodes with schemas as children of 'Available Pages Schemas'
                    const treeNodes = [
                        {
                            // label: `${tenantName} Pages `, // Root label
                            label: `Pages`,
                            key: 'available-pages-schemas',
                            children: response.data.pageData.map(page => ({
                                label: page.pageTitle,  // Schema as child
                                key: page.pageTitle,
                                data: page.pageTitle,  // Optional additional data
                                // You can link the page to its dynamic page URL
                                url: `/dynamic-table/${page.pageTitle}`
                            }))
                        }
                    ];
                    setSchemas(treeNodes);
                } else {
                    console.error('pageData not found or is not an array');
                    setSchemas([]);
                }
            } catch (error) {
                setError(error);
                console.error('Error fetching schemas:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchemas();
    }, [tenantName]);

    if (loading) return <div>Loading schemas...</div>;
    if (error) return <div>Error loading schemas: {error.message}</div>;

    return (
        <div className="page-schemas-container">
            {/* <h2 className="page-schemas-header">Available Pages Schemas for {tenantName}</h2> */}
            <div className="card flex justify-content-center">
                {/* PrimeReact Tree component */}
                <Tree
                    value={schemas}
                    className="w-full md:w-60rem"
                    nodeTemplate={(node) => (
                        <Link to={node.url} className="schema-link">
                            {node.label} {/* Display schema title */}
                        </Link>
                    )}
                />
            </div>
        </div>
    );
};

export default PageSchemas;
