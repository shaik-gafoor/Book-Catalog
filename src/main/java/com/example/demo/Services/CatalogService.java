package com.example.demo.Services;

import com.example.demo.model.Catalog;
import com.example.demo.payload.dto.CatalogDTO;

public interface CatalogService {

    CatalogDTO createCatalog(CatalogDTO catalog);
}
