// CustomPagination.jsx
import React from 'react';
import ReactPaginate from 'react-paginate';

export default function CustomPagination({ pageCount, currentPage, onPageChange }) {
    return (
        <ReactPaginate
            previousLabel={"Previous"}
            nextLabel={"Next"}
            breakLabel={"..."}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            forcePage={currentPage} // Ensure current page is controlled
            onPageChange={onPageChange}
            containerClassName={"pagination"}
            pageClassName={"page-item"}
            pageLinkClassName={"page-link"}
            previousClassName={"page-item"}
            previousLinkClassName={"page-link"}
            nextClassName={"page-item"}
            nextLinkClassName={"page-link"}
            activeClassName={"active"}
        />
    );
}
