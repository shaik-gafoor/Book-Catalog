package com.example.demo.Services;

import com.example.demo.model.Catalog;
import com.example.demo.payload.dto.CatalogDTO;

import java.util.List;

public interface CatalogService {

    CatalogDTO createCatalog(CatalogDTO catalog);

    List<CatalogDTO>  getAllCatalog();
}
