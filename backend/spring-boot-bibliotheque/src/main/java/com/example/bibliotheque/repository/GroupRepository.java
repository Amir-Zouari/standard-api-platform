package com.example.bibliotheque.repository;

import com.example.bibliotheque.models.Group;
import com.example.bibliotheque.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GroupRepository extends JpaRepository<Group, Integer> {
    /*@Query("SELECT DISTINCT(u) FROM User u LEFT JOIN u.groups g WHERE g.id <> ?1 OR g IS NULL"  )
    List<User> findUsersNotInGroup(@Param("groupId") Integer groupId);*/
}

