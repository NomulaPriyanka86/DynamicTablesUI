import React, { useState, useEffect } from 'react';
import { getPageSchema } from '../services/apiService';

const PageSchema = ({ pageName }) => {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPageSchema(pageName)
      .then(response => {
        setSchema(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, [pageName]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Page Schema for {pageName}</h1>
      <pre>{JSON.stringify(schema, null, 2)}</pre>
    </div>
  );
};

export default PageSchema;
