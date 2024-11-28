export const fetchData = async (tenantName, pageName) => {
    // const tenantName = 'bluboy'; // Fixed tenant name

    try {
        const response = await fetch(`http://localhost:8080/api/v1/page-schema/${tenantName}/${pageName}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // credentials: 'include' // Uncomment if you need to include credentials
        });

        // Check if the response is OK (status in the range 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the response JSON
        const data = await response.json();
        console.log('Response data:', data); // Log the response data

        return data;

    } catch (error) {
        console.error('Error fetching data:', error);
        return null; // Return null on error
    }
};