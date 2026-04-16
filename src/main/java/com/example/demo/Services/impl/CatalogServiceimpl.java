package com.example.demo.Services.impl;

import com.example.demo.Services.CatalogService;
import com.example.demo.model.Catalog;
import com.example.demo.payload.dto.CatalogDTO;
import com.example.demo.repository.CatalogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CatalogServiceimpl implements CatalogService {

    @Autowired
    private  CatalogRepository catalogRepository;

    @Override
    public CatalogDTO createCatalog(CatalogDTO catalogDTO){
//        return catalogRepository.save(catalogDTO);



        Catalog catalog = Catalog.builder()
                .code(catalogDTO.getCode())
                .name(catalogDTO.getName())
                .description(catalogDTO.getDescription())
                .displayOrder(catalogDTO.getDisplayOrder())
                .active(true)
                .build();

        if(catalogDTO.getParentCatalogId()!=null){
            Catalog parentCatalog = catalogRepository.findById(catalogDTO.getParentCatalogId()).get();
            catalog.setParentCatalog(parentCatalog);
        }
        Catalog savedCatalog = catalogRepository.save(catalog);

        CatalogDTO dto = CatalogDTO.builder()
                .id(savedCatalog.getId())
                .code(savedCatalog.getCode())
                .name(savedCatalog.getName())
                .description(savedCatalog.getDescription())
                .displayOrder(savedCatalog.getDisplayOrder())
                .active(savedCatalog.getActive())
                .createdAt(savedCatalog.getCreatedAt())
                .updatedAt(savedCatalog.getUpdatedAt())
                .build();

        if(savedCatalog.getParentCatalog()!=null){
            dto.setParentCatalogId(savedCatalog.getParentCatalog().getId());
            dto.setParentCatalogName(savedCatalog.getParentCatalog().getName());
        }

//        dto.setSubCatalog(savedCatalog.getSubCatalogs().stream()
//                .filter(subCatalog -> subCatalog.getActive())
//                .map(subCatalog ->));

//        dto.setBookCount((long)(savedCatalog.getB));

        return dto;
    }
}
