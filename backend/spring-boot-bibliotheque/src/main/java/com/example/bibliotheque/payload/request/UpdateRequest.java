package com.example.bibliotheque.payload.request;

import javax.validation.constraints.Size;
import java.util.Set;

public class UpdateRequest {
    String firstName;
    String lastName;
    String phoneNumber;
    String address;
    @Size(min = 6, max = 40)
    String oldPassword;
    @Size(min = 6, max = 40)
    String newPassword;
    Set<String> roles;

    public UpdateRequest(String firstName, String lastName, String phoneNumber, String address, String oldPassword, String newPassword, Set<String> roles) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.oldPassword = oldPassword;
        this.newPassword = newPassword;
        this.roles = roles;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public @Size(min = 6, max = 40) String getOldPassword() {
        return oldPassword;
    }

    public void setOldPassword(@Size(min = 6, max = 40) String oldPassword) {
        this.oldPassword = oldPassword;
    }

    public @Size(min = 6, max = 40) String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(@Size(min = 6, max = 40) String newPassword) {
        this.newPassword = newPassword;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }
}