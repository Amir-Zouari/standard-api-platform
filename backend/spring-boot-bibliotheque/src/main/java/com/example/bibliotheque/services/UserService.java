package com.example.bibliotheque.services;


import com.example.bibliotheque.models.ERole;
import com.example.bibliotheque.models.Group;
import com.example.bibliotheque.models.Role;
import com.example.bibliotheque.models.User;
import com.example.bibliotheque.payload.request.AddRequest;
import com.example.bibliotheque.payload.request.UpdateRequest;
import com.example.bibliotheque.repository.GroupRepository;
import com.example.bibliotheque.repository.RoleRepository;
import com.example.bibliotheque.repository.UserRepository;
import com.example.bibliotheque.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.webjars.NotFoundException;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {
    @Autowired
    UserRepository userRepo;

    @Autowired
    PasswordEncoder encoder;
    @Autowired
    RoleRepository roleRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private GroupRepository groupRepository;

    public List<User> getUsers() {
        return userRepo.findAll();
    }

    public Optional<User> getUser(Long id) {
        return userRepo.findById(id);
    }

    public Optional<User> updateUser(Long id, UpdateRequest updateRequest) {
        /*if (userRepo.existsByUsername(updateRequest.username())) {
            ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
            return;
        }*/

        /*if (userRepo.existsByEmail(updateRequest.email()) && !id.equals(userRepo.findByEmail(updateRequest.email()).getId())) {
            throw new RuntimeException("Error: Email is already taken!");
        }*/
        User user = userRepo.getById(id);
        Set<String> strRoles = updateRequest.getRoles();
        Set<Role> roles = new HashSet<>();

        if(updateRequest.getFirstName()!=null) user.setFirstName(updateRequest.getFirstName());
        if(updateRequest.getLastName()!=null) user.setLastName(updateRequest.getLastName());
        if(updateRequest.getPhoneNumber()!=null) user.setPhoneNumber(updateRequest.getPhoneNumber());
        if(updateRequest.getAddress()!=null) user.setAddress(updateRequest.getAddress());
        if (updateRequest.getOldPassword() != null && updateRequest.getNewPassword() != null) {
            if (!passwordEncoder.matches(updateRequest.getOldPassword(), user.getPassword())) {
                throw new IllegalArgumentException("Old password is wrong");
            } else user.setPassword(encoder.encode(updateRequest.getNewPassword()));
        }

        if (strRoles != null) {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(adminRole);

                        break;
                    case "moderator":
                        Role modRole = roleRepository.findByName(ERole.ROLE_MODERATOR)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(modRole);

                        break;
                    default:
                        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(userRole);
                }
            });
            user.setRoles(roles);
        }

        //user.setUsername(updateRequest.username());
        /*user.setEmail(updateRequest.email());*/
        /*if (!updateRequest.password().isEmpty()) user.setPassword(encoder.encode(updateRequest.password()));*/

        userRepo.save(user);
        return userRepo.findById(id);
    }

    public Optional<User> addUser(AddRequest addRequest) {
        if (userRepo.existsByUsername(addRequest.username())) {
            /*return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));*/
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (userRepo.existsByEmail(addRequest.email())) {
           /* return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));*/
            throw new RuntimeException("Error: Email is already in use!");
        }



        User user = new User();

        Set<String> strRoles = addRequest.roles();
        Set<Role> roles = new HashSet<>();


        if (strRoles == null) {
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(adminRole);

                        break;
                    case "moderator":
                        Role modRole = roleRepository.findByName(ERole.ROLE_MODERATOR)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(modRole);

                        break;
                    default:
                        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(userRole);
                }
            });
        }
        user.setRoles(roles);
        user.setUsername(addRequest.username());
        user.setEmail(addRequest.email());
        user.setPassword( encoder.encode(addRequest.password()));
        user.setFirstName(addRequest.firstName());
        user.setLastName(addRequest.lastName());
        user.setPhoneNumber(addRequest.phoneNumber());
        user.setAddress(addRequest.address());
        userRepo.save(user);
        return userRepo.findByUsername(addRequest.username());
    }

    public void deleteUser(Long id) {
        userRepo.deleteById(id);
    }

    public void deleteUsers(List<Long> userIds) {
        userRepo.deleteAllById(userIds);
    }

    public Boolean checkEmailAvailability(String email)
    {
        return !userRepo.existsByEmail(email);
    }

    public Boolean checkUsernameAvailability(String username)
    {
        return !userRepo.existsByUsername(username);
    }

    public List<String> getAssignableRoles() {
        Long currentUserId = getCurrentUser().getId();
        User currentUser = userRepo.getById(currentUserId);
        List<String> assignableRoles = Arrays.stream(ERole.values())
                .map(role -> role.name().replace("ROLE_", "").toLowerCase())
                .collect(Collectors.toList());
        if (!currentUser.getRoles().stream().anyMatch(role ->
                role.getName() == ERole.ROLE_ADMIN))
        {
            if (currentUser.getRoles().stream().anyMatch(role ->
                    role.getName() == ERole.ROLE_MODERATOR)) {
                assignableRoles.remove("admin");
            }
            else
            {
                assignableRoles.clear();
                throw new RuntimeException("Error: must be an admin or a moderator to assign roles.");
            }
        }

        return assignableRoles;
    }

    public UserDetailsImpl getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl user = (UserDetailsImpl) authentication.getPrincipal();
        return user;
    }

    public void leaveGroup(Integer groupId) {
        UserDetailsImpl currentUser =  getCurrentUser();
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new NotFoundException("Group not found"));
        group.getUsers().removeIf(member -> member.getId().equals(currentUser.getId()));
        groupRepository.save(group);
    }

    public Optional<User> updateProfile(UpdateRequest updateRequest) {
        Long currentUserId = getCurrentUser().getId();
        User currentUser = userRepo.getById(currentUserId);
        if(updateRequest.getFirstName()!=null) currentUser.setFirstName(updateRequest.getFirstName());
        if(updateRequest.getLastName()!=null) currentUser.setLastName(updateRequest.getLastName());
        if(updateRequest.getPhoneNumber()!=null) currentUser.setPhoneNumber(updateRequest.getPhoneNumber());
        if(updateRequest.getAddress()!=null) currentUser.setAddress(updateRequest.getAddress());
        if (updateRequest.getOldPassword() != null && updateRequest.getNewPassword() != null) {
            if (!passwordEncoder.matches(updateRequest.getOldPassword(), currentUser.getPassword())) {
                throw new RuntimeException("Old password is wrong");
            } else currentUser.setPassword(encoder.encode(updateRequest.getNewPassword()));
        }
        userRepo.save(currentUser);
        return userRepo.findById(currentUserId);
    }

    /*public List<User> getBasicUsers()
    {
        List<User> managableUsers = userRepo.findAll();
        managableUsers.removeIf(u ->
                u.getRoles().stream().anyMatch(role ->
                        role.getName() == ERole.ROLE_ADMIN || role.getName() == ERole.ROLE_MODERATOR
                )
        );        return managableUsers;
    }

    public List<User> getManageableUsers(Long id)
    {
        User user = userRepo.getById(id);
        List<User> managableUsers = userRepo.findAll();
        managableUsers.remove(user);
        Set<Role> roles = user.getRoles();
        if (roles.contains(ERole.ROLE_MODERATOR))
            managableUsers.removeIf(u-> u.getRoles().contains(ERole.ROLE_ADMIN));
        else if (roles.contains(ERole.ROLE_USER))
            managableUsers.removeIf(u-> u.getRoles().containsAll(Arrays.asList(ERole.ROLE_ADMIN,ERole.ROLE_MODERATOR)));
        return managableUsers;
    }*/
}
