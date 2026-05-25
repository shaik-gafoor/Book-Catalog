package com.example.demo.Services.impl;

import com.example.demo.domain.UserRole;
import com.example.demo.model.Book;
import com.example.demo.model.Catalog;
import com.example.demo.model.SubscriptionPlan;
import com.example.demo.model.User;
import com.example.demo.repository.BookRepository;
import com.example.demo.repository.CatalogRepository;
import com.example.demo.repository.SubscriptionPlanRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializationComponent implements CommandLineRunner {

    public final UserRepository userRepository;
    public final CatalogRepository catalogRepository;
    public final BookRepository bookRepository;
    public final SubscriptionPlanRepository subscriptionPlanRepository;
    public final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args){
        initializedAdminUser();
        initializedSubscriptionPlans();
        initializedCatalogsAndBooks();
    }

    private void initializedAdminUser(){
        String adminEmail = "gafoor7898@gmail.com";
        String adminPassword = "123456789";

        if(userRepository.findByEmail(adminEmail) == null){
            User user = User.builder()
                    .password(passwordEncoder.encode(adminPassword))
                    .email(adminEmail)
                    .fullName("Shaik Gafoor")
                    .role(String.valueOf(UserRole.ROLE_ADMIN))
                    .build();

            User admin = userRepository.save(user);
        }
    }

            private void initializedSubscriptionPlans() {
            createPlanIfMissing(
                "FREE",
                "Free",
                0L,
                36500,
                3,
                1,
                7,
                0,
                false,
                "Default",
                "Free plan for all new users"
            );
            createPlanIfMissing(
                "BASIC",
                "Basic",
                99L,
                30,
                15,
                5,
                14,
                1,
                false,
                "Most Popular",
                "Monthly plan with reserve and wishlist access"
            );
            createPlanIfMissing(
                "PREMIUM",
                "Premium",
                499L,
                30,
                -1,
                10,
                30,
                3,
                true,
                "Best Value",
                "Unlimited monthly borrowing with priority reservations"
            );
            }

            private void createPlanIfMissing(
                String code,
                String name,
                Long price,
                int durationDays,
                int maxBooksPerMonth,
                int maxConcurrentCheckouts,
                int maxDaysPerBook,
                int maxRenewalsPerBook,
                boolean priorityReservation,
                String badgeText,
                String description
            ) {
            if (subscriptionPlanRepository.findByPlanCode(code) != null) {
                return;
            }

            SubscriptionPlan plan = SubscriptionPlan.builder()
                .planCode(code)
                .name(name)
                .description(description)
                .price(price)
                .currency("INR")
                .durationDays(durationDays)
                .maxBooksAllowed(maxConcurrentCheckouts)
                .maxBooksPerMonth(maxBooksPerMonth)
                .maxConcurrentCheckouts(maxConcurrentCheckouts)
                .maxDaysPerBook(maxDaysPerBook)
                .maxRenewalsPerBook(maxRenewalsPerBook)
                .priorityReservation(priorityReservation)
                .badgeText(badgeText)
                .isActive(true)
                .displayOrder("FREE".equals(code) ? 1 : "BASIC".equals(code) ? 2 : 3)
                .build();
            subscriptionPlanRepository.save(plan);
            }

            private void initializedCatalogsAndBooks() {
            Catalog technology = createCatalogIfMissing("TECH", "Technology", 1);
            Catalog fiction = createCatalogIfMissing("FIC", "Fiction", 2);
            Catalog business = createCatalogIfMissing("BUS", "Business", 3);
            Catalog education = createCatalogIfMissing("EDU", "Education", 4);
            Catalog general = createCatalogIfMissing("GEN", "General", 5);

            seedBook("9780132350884", "Clean Code", "Robert C. Martin", technology,
                "Prentice Hall", LocalDate.of(2008, 8, 1), 464,
                "A handbook of agile software craftsmanship.");
            seedBook("9780134494166", "Clean Architecture", "Robert C. Martin", technology,
                "Prentice Hall", LocalDate.of(2017, 9, 20), 432,
                "Practical guidance for building maintainable software systems.");
            seedBook("9780134685991", "Effective Java", "Joshua Bloch", technology,
                "Addison-Wesley", LocalDate.of(2017, 12, 27), 416,
                "Best practices for the Java platform.");
            seedBook("9781617294945", "Spring in Action", "Craig Walls", technology,
                "Manning", LocalDate.of(2018, 10, 5), 520,
                "A hands-on guide to Spring applications.");
            seedBook("9781492078005", "Designing Data-Intensive Applications", "Martin Kleppmann", technology,
                "O'Reilly Media", LocalDate.of(2017, 3, 16), 611,
                "Concepts for scalable data systems.");

            seedBook("9780062316110", "The Alchemist", "Paulo Coelho", fiction,
                "HarperOne", LocalDate.of(2014, 4, 15), 208,
                "A modern allegory about following your dream.");
            seedBook("9781400079278", "The Kite Runner", "Khaled Hosseini", fiction,
                "Riverhead Books", LocalDate.of(2004, 5, 29), 372,
                "A powerful story of friendship and redemption.");
            seedBook("9780743273565", "The Great Gatsby", "F. Scott Fitzgerald", fiction,
                "Scribner", LocalDate.of(2004, 9, 30), 180,
                "A classic novel set in the Jazz Age.");
            seedBook("9781501128035", "It Ends with Us", "Colleen Hoover", fiction,
                "Atria Books", LocalDate.of(2016, 8, 2), 385,
                "A contemporary romance about love and resilience.");
            seedBook("9780316769488", "The Catcher in the Rye", "J.D. Salinger", fiction,
                "Little, Brown and Company", LocalDate.of(2001, 7, 1), 277,
                "A coming-of-age story about Holden Caulfield.");

            seedBook("9780062315007", "Atomic Habits", "James Clear", business,
                "Avery", LocalDate.of(2018, 10, 16), 320,
                "Tiny changes with remarkable results.");
            seedBook("9780735211292", "The Lean Startup", "Eric Ries", business,
                "Crown Business", LocalDate.of(2011, 9, 13), 336,
                "How today's entrepreneurs use continuous innovation.");
            seedBook("9780062457714", "Principles", "Ray Dalio", business,
                "Simon & Schuster", LocalDate.of(2017, 9, 19), 592,
                "Life and work principles from Ray Dalio.");
            seedBook("9781476784937", "Thinking, Fast and Slow", "Daniel Kahneman", business,
                "Farrar, Straus and Giroux", LocalDate.of(2013, 4, 2), 512,
                "A deep look into how we think and decide.");
            seedBook("9780307887894", "Zero to One", "Peter Thiel", business,
                "Crown Business", LocalDate.of(2014, 9, 16), 224,
                "Notes on startups and building the future.");

            seedBook("9780134685991-EDU", "Java Programming", "Joyce Farrell", education,
                "Cengage Learning", LocalDate.of(2019, 1, 1), 800,
                "Introductory Java programming concepts and examples.");
            seedBook("9780321356680", "Introduction to Algorithms", "Thomas H. Cormen", education,
                "MIT Press", LocalDate.of(2009, 7, 31), 1312,
                "A comprehensive algorithms textbook.");
            seedBook("9780134757599", "Computer Networks", "Andrew S. Tanenbaum", education,
                "Pearson", LocalDate.of(2010, 10, 19), 960,
                "Foundations of networking and protocols.");
            seedBook("9780133594140", "Operating System Concepts", "Abraham Silberschatz", education,
                "Wiley", LocalDate.of(2018, 12, 28), 976,
                "Operating systems theory and practice.");
            seedBook("9781292061226", "Database System Concepts", "Abraham Silberschatz", education,
                "McGraw-Hill", LocalDate.of(2019, 1, 1), 1376,
                "Database design, querying, and management.");

            seedBook("9781982137274", "The Midnight Library", "Matt Haig", general,
                "Viking", LocalDate.of(2020, 8, 13), 304,
                "A story about second chances and choices.");
            }

            private Catalog createCatalogIfMissing(String code, String name, int displayOrder) {
            return catalogRepository.findAll().stream()
                .filter(catalog -> code.equalsIgnoreCase(catalog.getCode()))
                .findFirst()
                .orElseGet(() -> catalogRepository.save(Catalog.builder()
                    .code(code)
                    .name(name)
                    .description(name + " books")
                    .displayOrder(displayOrder)
                    .active(true)
                    .build()));
            }

            private void seedBook(
                String isbn,
                String title,
                String author,
                Catalog catalog,
                String publisher,
                LocalDate publicationDate,
                int pages,
                String description
            ) {
            if (bookRepository.existsByIsbn(isbn)) {
                return;
            }

            Book book = Book.builder()
                .isbn(isbn)
                .title(title)
                .author(author)
                .catalog(catalog)
                .publisher(publisher)
                .publisheddate(publicationDate)
                .language("English")
                .pages(pages)
                .description(description)
                .totalCopies(5)
                .availableCopies(5)
                .price(null)
                .coverImageUrl(null)
                .active(true)
                .build();

            bookRepository.save(book);
            }
}
