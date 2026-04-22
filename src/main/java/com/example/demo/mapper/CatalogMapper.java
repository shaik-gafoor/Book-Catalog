package com.example.demo.mapper;
import com.example.demo.model.Catalog;
import com.example.demo.payload.dto.CatalogDTO;
import com.example.demo.repository.CatalogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor

public class CatalogMapper {

    private final CatalogRepository catalogRepository;

    public  CatalogDTO toDTO(Catalog savedCatalog){
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

    public Catalog toEntity(CatalogDTO catalogDTO) {
        if (catalogDTO == null) {
            return null;
        }

        Catalog catalog = Catalog.builder()
                .code(catalogDTO.getCode())
                .name(catalogDTO.getName())
                .description(catalogDTO.getDescription())
                .displayOrder(catalogDTO.getDisplayOrder())
                .active(true)
                .build();

        if (catalogDTO.getParentCatalogId() != null) {
            catalogRepository.findById(catalogDTO.getParentCatalogId())
                    .ifPresent(parentCatalog -> catalog.setParentCatalog(parentCatalog));
        }

        return catalog;

    }

    public void updateEntityFromDTO(CatalogDTO dto, Catalog existingCatalog){
        if(dto == null || existingCatalog == null){
            return ;
        }

        existingCatalog.setCode(dto.getCode());
        existingCatalog.setName(dto.getName());
        existingCatalog.setDescription(dto.getDescription());
        existingCatalog.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0);
        if(dto.getActive() != null){
            catalogRepository.findById(dto.getParentCatalogId())
                    .ifPresent(existingCatalog::setParentCatalog);
        }
    }
}
