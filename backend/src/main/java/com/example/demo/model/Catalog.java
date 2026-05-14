package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Catalog {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @NotBlank(message = "Catalog Code is Mandatory")
    private String code;

    @NotBlank(message = "Catalog name is Mandatory")
    private String name;

    @Size(max = 500, message = "description should be under 500 characters")
    private String description;

    @Min(value = 0, message = "display order cannot be negative")
    private Integer displayOrder = 0;

    @Column(nullable = false)
    private Boolean active = true;

    // ✅ FIXED: Proper mapping for parent-child
    @ManyToOne
    @JoinColumn(name = "parent_id")
    @JsonBackReference
    private Catalog parentCatalog;

    // ✅ FIXED: mappedBy added + JSON handling
    @OneToMany(mappedBy = "parentCatalog", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Catalog> subCatalogs = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}