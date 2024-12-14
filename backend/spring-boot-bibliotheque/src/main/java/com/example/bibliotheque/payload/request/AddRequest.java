package com.example.bibliotheque.payload.request;
import java.util.Set;

public record AddRequest(String username,String email, String firstName,String lastName,String phoneNumber,String address, String password,Set<String> roles) {
}
