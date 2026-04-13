package com.example.demo.Services.impl;

import com.example.demo.Services.CatalogService;
import com.example.demo.model.Catalog;
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
    public Catalog createCatalog(Catalog catalog){
        return catalogRepository.save(catalog);
    }
}
