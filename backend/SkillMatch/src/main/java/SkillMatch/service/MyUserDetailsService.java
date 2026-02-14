package SkillMatch.service;

import SkillMatch.model.User;
import SkillMatch.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MyUserDetailsService implements UserDetailsService {


    private final UserRepo repo;
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user= repo.findByEmail(email);
        if(user==null){
            throw new  UsernameNotFoundException("User Not Found");
        }
        return user;
    }
}
