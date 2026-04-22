package com.example.demo.repository;

import com.example.demo.model.Catalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CatalogRepository extends JpaRepository<Catalog, Long> {

    List<Catalog> findByActiveTrueOrderByDisplayOrderAsc();

    List<Catalog>findByParentCatalogIsNullActiveTrueOrderByDisplayOrderAsc();

    List<Catalog>findByParentCatalogIdAndActiveTrueOrderByDisplayOrderAsc(
        Long parentCatalogId
    );

    long countByActiveTrue();


//    @Query("select count(b) from book b where b.catalog.id=:catalogId")
//    long countBooksByCatalog(@Param("catalogId") Long catalogId);

}
