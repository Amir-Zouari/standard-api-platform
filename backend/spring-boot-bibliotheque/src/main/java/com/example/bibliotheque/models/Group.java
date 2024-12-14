package com.example.bibliotheque.models;

import org.springframework.lang.Nullable;

import javax.persistence.*;
import java.util.Set;

@Entity
@Table(name = "groups")
public class Group {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
    @Nullable
    private String description;
    @ManyToMany
    @JoinTable(name = "group_users", joinColumns =
    @JoinColumn(name = "group_id", insertable = false, updatable = false),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    private Set<User> users;

    public Group() {
    }

    public Group(Integer id, String name, @Nullable String description, Set<User> users) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.users = users;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Nullable
    public String getDescription() {
        return description;
    }

    public void setDescription(@Nullable String description) {
        this.description = description;
    }

    public Set<User> getUsers() {
        return users;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }
}
