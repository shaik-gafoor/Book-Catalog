package com.example.demo.Services.impl;

import com.example.demo.Services.CatalogService;
import com.example.demo.mapper.CatalogMapper;
import com.example.demo.model.Catalog;
import com.example.demo.payload.dto.CatalogDTO;
import com.example.demo.repository.CatalogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.demo.exception.CatalogException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CatalogServiceimpl implements CatalogService {

    @Autowired
    private  CatalogRepository catalogRepository;
    private final CatalogMapper catalogMapper;

    @Override
    public CatalogDTO createCatalog(CatalogDTO catalogDTO){

        Catalog catalog = catalogMapper.toEntity(catalogDTO);
        Catalog savedCatalog = catalogRepository.save(catalog);

        return catalogMapper.toDTO(savedCatalog);

    }

    @Override
    public List<CatalogDTO> getAllCatalog() {
        return catalogRepository.findAll().stream()
                .map(catalogMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CatalogDTO getCatalogById(Long catalogId) throws CatalogException {
        Catalog catalog = catalogRepository.findById(catalogId).orElseThrow(
                ()-> new CatalogException("catalog not found")
        );
        return catalogMapper.toDTO(catalog);
    }

    @Override
    public CatalogDTO updateCatalog(Long catalogId, CatalogDTO catalogDTO) throws CatalogException {

        Catalog existingCatalog = catalogRepository.findById(catalogId).orElseThrow(
                ()->new CatalogException("catalog not found")
        );

        catalogMapper.updateEntityFromDTO(catalogDTO, existingCatalog);
        Catalog updatedCatalog = catalogRepository.save(existingCatalog);
        return catalogMapper.toDTO(updatedCatalog);
    }

    @Override
    public CatalogDTO deleteCatalog(Long catalogId) throws CatalogException {
        Catalog existingCatalog = catalogRepository.findById(catalogId).orElseThrow(
                ()->new CatalogException("catalog not found")
        );
        existingCatalog.setActive(false);
        catalogRepository.save(existingCatalog);
        return null;
    }

    @Override
    public CatalogDTO hardDeleteCatalog(Long catalogId) throws CatalogException {
        Catalog existingCatalog = catalogRepository.findById(catalogId).orElseThrow(
                ()->new CatalogException("catalog not found")
        );
        catalogRepository.delete(existingCatalog);
        return null;
    }

    @Override
    public List<CatalogDTO> getAllActiveCatalogWithSubCatalogs() {
        List<Catalog> topLevelCatalogs = catalogRepository
                .findByParentCatalogIsNullAndActiveTrueOrderByDisplayOrderAsc();
        return catalogMapper.toDTOList(topLevelCatalogs);
    }

    @Override
    public List<CatalogDTO> getTopLevelCatalog() {
        List<Catalog> topLevelCatalogs = catalogRepository
                .findByParentCatalogIsNullAndActiveTrueOrderByDisplayOrderAsc();
        return catalogMapper.toDTOList(topLevelCatalogs);
    }

    @Override
    public Page<CatalogDTO> searchCatalog(String searchTerm, Pageable pageable) {
        return null;
    }

    @Override
    public long getTotalActiveCatalog() {
        return catalogRepository.countByActiveTrue();
    }

    @Override
    public long getBookCountByCatalog(Long catalogId) {
        return 0;
    }
}
