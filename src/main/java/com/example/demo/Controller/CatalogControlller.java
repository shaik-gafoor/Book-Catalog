package com.example.demo.Controller;

import com.example.demo.Services.CatalogService;
import com.example.demo.exception.CatalogException;
import com.example.demo.model.Catalog;

import com.example.demo.payload.dto.CatalogDTO;
import com.example.demo.payload.response.ApiResponse;
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

    @GetMapping()
    public ResponseEntity<?> getAllCatalogs(){
        List<CatalogDTO> catalogs = catalogService.getAllCatalog();
        return ResponseEntity.ok(catalogs);
    }

    @GetMapping("/{catalogId}")
    public ResponseEntity<?> getCatalogById(@PathVariable Long catalogId
    ) throws CatalogException {
        CatalogDTO catalogs = catalogService.getCatalogById(catalogId);
        return ResponseEntity.ok(catalogs);
    }

    @PutMapping("/{catalogId}")
    public ResponseEntity<?> updateCatalog(@PathVariable("catalogId") Long catalogId,
                                           @RequestBody CatalogDTO catalog
    ) throws CatalogException {
        CatalogDTO catalogs = catalogService.updateCatalog(catalogId,catalog);
        return ResponseEntity.ok(catalogs);
    }

    @DeleteMapping("/{catalogId}")
    public ResponseEntity<?> deleteCatalog(@PathVariable("catalogId") Long catalogId
    ) throws CatalogException {
        catalogService.deleteCatalog(catalogId);
        ApiResponse response = new ApiResponse("catalog deleted - soft delete",true);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{catalogId}/hard")
    public ResponseEntity<?> hardDeleteCatalog(@PathVariable("catalogId") Long catalogId
    ) throws CatalogException {
        catalogService.hardDeleteCatalog(catalogId);
        ApiResponse response = new ApiResponse("catalog deleted - hard delete",true);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/top-level")
    public ResponseEntity<?> getTopLevelCatalogs(){
        List<CatalogDTO> catalogs = catalogService.getTopLevelCatalog();
        return ResponseEntity.ok(catalogs);
    }

    @GetMapping("/count")
    public ResponseEntity<?> getTotalActiveCatalogs(){
        Long catalogs = catalogService.getTotalActiveCatalog();
        return ResponseEntity.ok(catalogs);
    }

    @GetMapping("/{id}/book-count")
    public ResponseEntity<?> getBookCountByCatalogs(@PathVariable Long id){
        Long count = catalogService.getBookCountByCatalog(id);
        return ResponseEntity.ok(count);
    }
}
