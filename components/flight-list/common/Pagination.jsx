
'use client'

import { useState, useEffect } from "react";

const Pagination = ({ totalItems = 0, itemsPerPage = 10, currentPage = 1, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageClick = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const renderPage = (pageNumber, isActive = false) => {
    const className = `size-40 flex-center rounded-full cursor-pointer ${
      isActive ? "bg-dark-1 text-white" : ""
    }`;
    return (
      <div key={pageNumber} className="col-auto">
        <div className={className} onClick={() => handlePageClick(pageNumber)}>
          {pageNumber}
        </div>
      </div>
    );
  };

  const renderPages = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(renderPage(i, i === currentPage));
      }
    } else {
      // Mostrar páginas con puntos suspensivos
      pages.push(renderPage(1, currentPage === 1));

      if (currentPage > 3) {
        pages.push(
          <div key="dots-start" className="col-auto">
            <div className="size-40 flex-center rounded-full">...</div>
          </div>
        );
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(renderPage(i, i === currentPage));
      }

      if (currentPage < totalPages - 2) {
        pages.push(
          <div key="dots-end" className="col-auto">
            <div className="size-40 flex-center rounded-full">...</div>
          </div>
        );
      }

      pages.push(renderPage(totalPages, currentPage === totalPages));
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null; // No mostrar paginación si solo hay una página
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="border-top-light mt-30 pt-30">
      <div className="row x-gap-10 y-gap-20 justify-between md:justify-center">
        <div className="col-auto md:order-1">
          <button 
            className="button -blue-1 size-40 rounded-full border-light"
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            <i className="icon-chevron-left text-12" />
          </button>
        </div>

        <div className="col-md-auto md:order-3">
          <div className="row x-gap-20 y-gap-20 items-center md:d-none">
            {renderPages()}
          </div>

          <div className="row x-gap-10 y-gap-20 justify-center items-center d-none md:d-flex">
            {renderPages()}
          </div>

          <div className="text-center mt-30 md:mt-10">
            <div className="text-14 text-light-1">
              {startItem} – {endItem} de {totalItems} vuelos encontrados
            </div>
          </div>
        </div>

        <div className="col-auto md:order-2">
          <button 
            className="button -blue-1 size-40 rounded-full border-light"
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            <i className="icon-chevron-right text-12" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
