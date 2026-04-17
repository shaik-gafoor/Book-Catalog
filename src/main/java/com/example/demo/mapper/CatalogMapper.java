package com.example.demo.mapper;

import com.example.demo.model.Catalog;
import com.example.demo.payload.dto.CatalogDTO;

import java.util.stream.Collectors;

public class CatalogMapper {

    public static CatalogDTO toDTO(Catalog savedCatalog){
        if(savedCatalog == null){
            return null;
        }

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

        if(savedCatalog.getSubCatalogs() != null && !savedCatalog.getSubCatalogs().isEmpty()){
            dto.setSubCatalog(savedCatalog.getSubCatalogs().stream()
                    .filter(subCatalog -> subCatalog.getActive())
                    .map(subCatalog -> toDTO(subCatalog)).collect(Collectors.toList()));
        }


//        dto.setBookCount((long)(savedCatalog.getB));
        return dto;
    }
}
