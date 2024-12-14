package com.example.bibliotheque.services;

import com.example.bibliotheque.models.Group;
import com.example.bibliotheque.models.User;
import com.example.bibliotheque.payload.request.AddGroupRequest;
import com.example.bibliotheque.payload.request.UpdateGroupRequest;
import com.example.bibliotheque.repository.GroupRepository;
import com.example.bibliotheque.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private UserRepository userRepository;

    public List<Group> getGroups() {
        return groupRepository.findAll();
    }

    public Optional<Group> getGroup(Integer id) {
        return groupRepository.findById(id);
    }

    public Group addGroup(AddGroupRequest addGroupRequest) {
        Group newGroup = new Group();
        newGroup.setName(addGroupRequest.name());
        newGroup.setDescription(addGroupRequest.description());
        return groupRepository.save(newGroup);
    }

    public Optional<Group> updateGroup(Integer id, UpdateGroupRequest updatedGroup) {
        Optional<Group> existingGroup = groupRepository.findById(id);

        if (existingGroup.isPresent()) {
            Group groupToUpdate = existingGroup.get();
            // Update relevant fields from updatedGroup to groupToUpdate
            groupToUpdate.setName(updatedGroup.name());
            groupToUpdate.setDescription(updatedGroup.description());
            // ... update other fields as needed

            return Optional.of(groupRepository.save(groupToUpdate));
        } else {
            return Optional.empty();
        }
    }

    public void deleteGroup(Integer id) {
        groupRepository.deleteById(id);
    }

    public void deleteGroups(List<Integer> groupIds) {
        groupRepository.deleteAllById(groupIds);
    }


    /*public void addUsersToGroup(Integer groupId, List<Long> usersIds) {
        Optional<Group> group = groupRepository.findById(groupId);
        if (group.isPresent()) {
            group.get().getUsers().addAll(userRepository.findAllById(usersIds));
            groupRepository.save(group.get());

        } else {
            throw new EntityNotFoundException("Group not found with id: " + groupId);
        }
    }*/

    /*public List<User> getAvailableUsers(Integer groupId) {
        Optional<Group> group = groupRepository.findById(groupId);
        if (group.isPresent()) {
            return groupRepository.findUsersNotInGroup(groupId).stream().toList();
        } else throw new EntityNotFoundException("Group not found with id: " + groupId);

    }*/
    /*@Transactional
    public void removeUsersFromGroup(Integer groupId, List<Long> usersIds) {
            Group group = groupRepository.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found"));
            Set<User> groupUsers = group.getUsers();
            groupUsers.removeAll(userRepository.findAllById(usersIds));
            group.setUsers(groupUsers);
            groupRepository.save(group);
    }*/
    /*@Transactional
    public void removeUserFromGroup(Integer groupId, Long userId) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        Set<User> groupUsers = group.getUsers();
        groupUsers.remove(userRepository.findById(userId));
        group.setUsers(groupUsers);
        groupRepository.save(group);
    }*/

    public Group updateGroupUsers(Integer groupId, List<Long> usersIds) {
        if (groupId == 1)
            throw new RuntimeException("Simulated error: Group ID 1 cannot be updated.");
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        group.getUsers().clear();
        List<User> usersToAdd = userRepository.findAllById(usersIds);
        group.getUsers().addAll(usersToAdd);
        return groupRepository.save(group);
    }

}
