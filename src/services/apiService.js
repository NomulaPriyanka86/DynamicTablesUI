const API_URL = "http://localhost:8081/api/v1/kyc-data";

export const fetchKycData = async () => {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        // console.log("Fetched KYC Data:", data); // Check the structure of the data
        if (data.data) {
            return data.data; // This should be an array
        }
        else {
            console.error('Fetched data is not in the expected format:', data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
};
