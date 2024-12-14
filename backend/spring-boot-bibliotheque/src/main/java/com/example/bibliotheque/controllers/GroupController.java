package com.example.bibliotheque.controllers;

import com.example.bibliotheque.models.Group;
import com.example.bibliotheque.payload.request.AddGroupRequest;
import com.example.bibliotheque.payload.request.UpdateGroupRequest;
import com.example.bibliotheque.payload.response.MessageResponse;
import com.example.bibliotheque.services.GroupService;
import com.example.bibliotheque.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;
    @Autowired
    private UserService userService;

    @GetMapping()
    @Operation(security = @SecurityRequirement(name = "projet"))
    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_MODERATOR') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<Group>> getGroups() {
        return ResponseEntity.ok(groupService.getGroups());
    }

    @GetMapping("/{groupId}")
    @Operation(security = @SecurityRequirement(name = "projet"))
    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_MODERATOR') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<Group> getGroup(@PathVariable("groupId") Integer id) {
        return ResponseEntity.ok(groupService.getGroup(id).orElse(null));
    }

    @PostMapping()
    @Operation(security = @SecurityRequirement(name = "projet"))
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Group> addGroup(@RequestBody AddGroupRequest addGroupRequest) {
        return ResponseEntity.ok(groupService.addGroup(addGroupRequest));
    }

    @PutMapping("/{groupId}")
    @Operation(security = @SecurityRequirement(name = "projet"))
    @PreAuthorize("hasRole('ROLE_MODERATOR') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<Group> updateGroup(@PathVariable("groupId") Integer id, @RequestBody UpdateGroupRequest updateGroupRequest) {
        return ResponseEntity.ok(groupService.updateGroup(id, updateGroupRequest)
                .orElse(null));
    }

    @DeleteMapping("/{groupId}")
    @Operation(security = @SecurityRequirement(name = "projet"))
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteGroup(@PathVariable("groupId") Integer id) {
        groupService.deleteGroup(id);
        return ResponseEntity.ok(new MessageResponse("Group deleted successfully!"));
    }

    @DeleteMapping()
    @Operation(security = @SecurityRequirement(name = "projet"))
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteGroups(@RequestParam("ids") List<Integer> groupIds) {
        groupService.deleteGroups(groupIds);
        return ResponseEntity.ok(new MessageResponse("Groups deleted successfully!"));
    }

    /*@PostMapping("/{groupId}/users/{userId}")
    @Operation(security = @SecurityRequirement(name = "projet"))
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<?> addUserToGroup(@PathVariable Integer groupId, @PathVariable Long userId) {
        groupService.addUserToGroup(groupId, userId);
        return ResponseEntity.ok(new MessageResponse("User added to group successfully"));
    }*/
    /*@PostMapping("/{groupId}/users")
    @Operation(security = @SecurityRequirement(name = "projet"))
    @PreAuthorize("hasRole('ROLE_MODERATOR') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> addUsersToGroup(@PathVariable Integer groupId, @RequestBody List<Long> usersIds) {
        groupService.addUsersToGroup(groupId, usersIds);
        return ResponseEntity.ok(new MessageResponse("Users added to group successfully"));
    }*/

    /*@GetMapping("/{groupId}/available-users")
    @Operation(security = @SecurityRequirement(name = "projet"))
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<List<User>> getAvailableUsers(@PathVariable Integer groupId) {
        List<User> availableUsers = groupService.getAvailableUsers(groupId);
        return ResponseEntity.ok(availableUsers);
    }*/

   /* @DeleteMapping("/{groupId}/users")
    @Operation(security = @SecurityRequirement(name = "projet"))
    @PreAuthorize("hasRole('ROLE_MODERATOR') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> removeUsersFromGroup(@PathVariable Integer groupId,  @RequestBody List<Long> usersIds) {
        groupService.removeUsersFromGroup(groupId, usersIds);
        return ResponseEntity.ok(new MessageResponse("Users removed from group successfully"));
    }*/


    @PutMapping("/{groupId}/users")
    @Operation(security = @SecurityRequirement(name = "projet"))
    @PreAuthorize("hasRole('ROLE_MODERATOR') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> updateGroupUsers(@PathVariable Integer groupId, @RequestBody List<Long> usersIds) {
        return ResponseEntity.ok(groupService.updateGroupUsers(groupId, usersIds));

    }

}
