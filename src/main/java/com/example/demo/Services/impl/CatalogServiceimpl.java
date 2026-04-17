package com.example.demo.Services.impl;

import com.example.demo.Services.CatalogService;
import com.example.demo.mapper.CatalogMapper;
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

        CatalogDTO dto = CatalogMapper.toDTO(savedCatalog);

        return dto;
    }
}
