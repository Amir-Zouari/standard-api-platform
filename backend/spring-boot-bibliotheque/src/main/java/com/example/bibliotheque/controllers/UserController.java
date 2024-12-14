package com.example.bibliotheque.controllers;


import com.example.bibliotheque.payload.request.AddRequest;
import com.example.bibliotheque.payload.request.UpdateRequest;
import com.example.bibliotheque.payload.response.MessageResponse;
import com.example.bibliotheque.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("api/users")
public class UserController {


    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping()
    @Operation(security = @SecurityRequirement(name = "projet"))
    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_MODERATOR') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getUsers() {
        return ResponseEntity.ok(userService.getUsers());
    }

    @GetMapping("/{userId}")
    @Operation(security = @SecurityRequirement(name = "projet"))
    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_MODERATOR') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getUser(@PathVariable("userId") Long id) {
        return ResponseEntity.ok(userService.getUser(id));
    }

    @PutMapping("/{userId}")
    @Operation(security = @SecurityRequirement(name = "projet"))
    @PreAuthorize("hasRole('ROLE_MODERATOR') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable("userId") Long id,@Valid @RequestBody UpdateRequest updateRequest) {
        return ResponseEntity.ok(userService.updateUser(id, updateRequest));
    }

    @PostMapping()
    @Operation(security = @SecurityRequirement(name = "projet"))
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> addUser(@Valid @RequestBody AddRequest addRequest){
        return  ResponseEntity.ok(userService.addUser(addRequest));
    }
    @DeleteMapping("/{userId}")
    @Operation(security = @SecurityRequirement(name = "projet"))
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable("userId") Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(new MessageResponse("user deleted successfully!"));

    }

    @DeleteMapping()
    @Operation(security = @SecurityRequirement(name = "projet"))
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteUsers(@RequestParam("ids") List<Long> userIds) {
        userService.deleteUsers(userIds);
        return ResponseEntity.ok(new MessageResponse("users deleted successfully!"));
    }

    @GetMapping("/check-email-availability")
    public ResponseEntity<?> checkEmailAvailability(@RequestParam("email") String email)
    {
        return ResponseEntity.ok(userService.checkEmailAvailability(email));
    }

    @GetMapping("/check-username-availability")
    public ResponseEntity<?> checkUsernameAvailability(@RequestParam("username") String username)
    {
        return ResponseEntity.ok(userService.checkUsernameAvailability(username));
    }


    @DeleteMapping("/me/groups/{groupId}/leave")
    @Operation(security = @SecurityRequirement(name = "projet"))
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> leaveGroup(@PathVariable Integer groupId) {
        try {
            userService.leaveGroup(groupId);
            return ResponseEntity.ok(new MessageResponse("User left group successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/me")
    @Operation(summary="update authenticated user profile" ,security = @SecurityRequirement(name = "projet"))
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateRequest updateRequest) {
        try {
            return ResponseEntity.ok(userService.updateProfile(updateRequest));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/me/assignable-roles")
    @Operation(security = @SecurityRequirement(name = "projet"))
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAssignableRoles()
    {
        try {
            return ResponseEntity.ok(userService.getAssignableRoles());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(e.getMessage()));
        }
    }
   /* @GetMapping("/basic-users")
    @Operation(security = @SecurityRequirement(name = "projet"))
    @PreAuthorize("hasRole('ROLE_MODERATOR') or hasRole('ROLE_ADMIN') or hasRole('ROLE_USER')")
    public ResponseEntity<?> getBasicUsers()
    {
        return ResponseEntity.ok(userService.getBasicUsers());
    }*/

}
