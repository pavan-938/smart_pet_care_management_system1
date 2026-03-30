package com.petcare.service;

import com.petcare.entity.User;

public interface UserService {
    User updateProfile(Long userId, String name, String email);

    User getUserById(Long userId);

    long getCount();
}
