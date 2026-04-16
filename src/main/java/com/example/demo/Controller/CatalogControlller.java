package com.example.demo.Controller;

import com.example.demo.Services.CatalogService;
import com.example.demo.model.Catalog;

import com.example.demo.payload.dto.CatalogDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catalog")
@RequiredArgsConstructor
public class CatalogControlller {

    private final CatalogService catalogService;

    @PostMapping("/create")
    public ResponseEntity<CatalogDTO> addcatalog(@RequestBody CatalogDTO catalog){
        CatalogDTO createdCatalog = catalogService.createCatalog(catalog);
        return ResponseEntity.ok(createdCatalog);
       
    }


}
