package SkillMatch.validator;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Component
public class ObjectValidator <T>{

    private final ValidatorFactory validatorFactory= Validation.buildDefaultValidatorFactory();
    private final Validator validator = validatorFactory.getValidator();

    public Set<String> validate(T object){
        Set<ConstraintViolation<T>> violations = validator.validate(object);
        if(!violations.isEmpty()){
            return violations.stream().map(
                    ConstraintViolation::getMessage
            ).collect(Collectors.toSet());
        }
        return Collections.emptySet();
    }


}
