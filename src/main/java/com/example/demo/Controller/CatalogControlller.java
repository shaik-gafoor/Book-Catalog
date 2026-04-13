package com.example.demo.Controller;

import com.example.demo.Services.CatalogService;
import com.example.demo.model.Catalog;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catalog")
public class CatalogControlller {

    private final CatalogService catalogService;

    public CatalogControlller(CatalogService catalogService) {
        this.catalogService = catalogService;
    }


    @PostMapping("/create")
    public ResponseEntity<Catalog> addcatalog(@RequestBody Catalog catalog){
        Catalog createdCatalog = catalogService.createCatalog(catalog);
        return ResponseEntity.ok(createdCatalog);
    }
}
