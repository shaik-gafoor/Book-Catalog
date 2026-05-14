package com.example.demo.payload.dto;

import com.example.demo.model.Catalog;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Setter
public class CatalogDTO {
    private Long id;

    @NotBlank(message = "Catalog Code is Mandatory")
    private String code;

    @NotBlank(message = "Catalog name is Mandatory")
    private String name;

    @Size(max = 500, message = "description should be under 500 characters")
    private String description;

    @Min(value = 0, message = "display order cannot be negative")
    private Integer displayOrder = 0;

    private Boolean active;

    private Long parentCatalogId;

    private String parentCatalogName;

    private List<CatalogDTO> subCatalog;

    private Long bookCount;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String parentCatalog;


}
