package com.example.demo.Services;

import com.example.demo.exception.CatalogException;
import com.example.demo.model.Catalog;
import com.example.demo.payload.dto.CatalogDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CatalogService {

    CatalogDTO createCatalog(CatalogDTO catalog);

    List<CatalogDTO>  getAllCatalog();

    CatalogDTO getCatalogById(Long catalogId) throws CatalogException;

    CatalogDTO updateCatalog(Long catalogId, CatalogDTO catalog) throws CatalogException;

    CatalogDTO deleteCatalog(Long catalogId);

    CatalogDTO hardDeleteCatalog(Long catalogId);

    List<CatalogDTO> getAllActiveCatalogWithSubCatalogs();

    List<CatalogDTO> getTopLevelCatalog();

    Page<CatalogDTO> searchCatalog(String searchTerm, Pageable pageable);

    long getTotalActiveCatalog();

    long getBookCountByCatalog(Long catalogId);
}
