package com.example.demo.Controller;

import com.example.demo.Services.CatalogService;
import com.example.demo.model.Catalog;

import com.example.demo.payload.dto.CatalogDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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


    @GetMapping ()
    public ResponseEntity<?> getAllCatalogs(){
        List<CatalogDTO> catalogs = catalogService.getAllCatalog();
        return ResponseEntity.ok(catalogs);

    }

}
