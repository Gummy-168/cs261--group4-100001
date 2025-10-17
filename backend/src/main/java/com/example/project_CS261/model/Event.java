package com.example.project_CS261.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Event {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FR-4 name/description; CoS fields
    @Nationalized
    @Column(nullable = false, length = 200)
    private String title;

    @Nationalized
    @Column(nullable = false, length = 2000)
    private String description;

    // FR-1, FR-4: day & time -> use startAt/endAt (end optional)
    @Column(nullable = false)
    private LocalDateTime startAt;

    private LocalDateTime endAt;

    // FR-4: location
    @Nationalized
    @Column(nullable = false, length = 300)
    private String location;

    // FR-4, FR-9: capacity/remaining (derive isFull)
    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private Integer reserved; // seats already taken

    // FR-6: category, unit/faculty
    @Nationalized
    @Column(nullable = false, length = 100)
    private String category;

    @Nationalized
    @Column(nullable = false, length = 150)
    private String organizerUnit;  // คณะ/หน่วยงานที่จัด

    // FR-4: organizer & contact
    @Nationalized
    @Column(nullable = false, length = 120)
    private String organizerName;

    @Nationalized
    @Column(nullable = false, length = 120)
    private String organizerContact; // email/phone/line id

    // FR-5: poster image (jpg/png only; validated in service)
    @Column(nullable = false, length = 500)
    private String posterUrl;

    // FR-7: external register link
    @Column(length = 500)
    private String registerUrl;

    // FR-10: edited flag when time/location updated
    @Column(nullable = false)
    private boolean edited;

    // bookkeeping
    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Helper
    @Transient
    public int getRemaining() {
        int left = (capacity == null ? 0 : capacity) - (reserved == null ? 0 : reserved);
        return Math.max(left, 0);
    }

    @Transient
    public boolean isFull() {
        return getRemaining() <= 0;
    }
}
