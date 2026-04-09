package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//import java.awt.print.Book;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Catalog {
    @Id
//    that means we dont need to provide this id from frontend,Id is automatically created
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @NotBlank(message = "Catalog Code is Mandatory")
    private String code;

    @NotBlank(message = "Catalog name is Mandatory")
    private String name;

    @Size(max = 500, message = " description should be under 500 characters")
    private String description;

    @Min(value = 0, message = " display order cannot be negative")
    private Integer displayOrder = 0;

    @Column(nullable = false)
    private Boolean active = true;

    @ManyToOne
    private Catalog parentCatalog;

    @OneToMany
    private List<Catalog> subCatalogs = new ArrayList<Catalog>();

//    @OneToMany(mappedBy = "Catelog", cascade = CascadeType.PERSIST)
//    private List<Book> books =  new ArrayList<Book>();
}
