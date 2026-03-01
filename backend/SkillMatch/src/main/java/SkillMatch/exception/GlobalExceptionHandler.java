package SkillMatch.exception;

import SkillMatch.dto.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@lombok.extern.slf4j.Slf4j
public class GlobalExceptionHandler {

    private ResponseEntity<ApiResponse<Object>> error(String message, HttpStatus status) {
        return ResponseEntity.status(status).body(ApiResponse.error(message));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> notFound(ResourceNotFoundException ex) {
        return error(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler({
            UserAlreadyExistException.class,
            DuplicateApplicationException.class
    })
    public ResponseEntity<ApiResponse<Object>> conflict(Exception ex) {
        return error(ex.getMessage(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(InvalidCodeOrTokenException.class)
    public ResponseEntity<ApiResponse<Object>> invalidCode(InvalidCodeOrTokenException ex) {
        return error(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({
            InvalidCredentialsException.class,
            AuthenticationException.class,
            InvalidTokenException.class,
            TokenExpiredException.class
    })
    public ResponseEntity<ApiResponse<Object>> unauthorized(Exception ex) {
        return error(ex.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(
            EmailNotVerifiedException.class
    )
    public ResponseEntity<ApiResponse<Object>> emailNotVerified(EmailNotVerifiedException ex) {
        return error(ex.getMessage(), HttpStatus.FORBIDDEN);
    }
    @ExceptionHandler({
            ValidationException.class,
            PasswordMismatchException.class,
            InvalidResetTokenException.class,
            UnknownIdentifierException.class,
            IllegalArgumentException.class
    })
    public ResponseEntity<ApiResponse<Object>> badRequest(Exception ex) {
        return error(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> dtoValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));

        return ResponseEntity.badRequest().body(
                new ApiResponse<>(false, "Validation failed", errors, LocalDateTime.now())
        );
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> paramValidation(ConstraintViolationException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations()
                .forEach(v -> errors.put(v.getPropertyPath().toString(), v.getMessage()));

        return ResponseEntity.badRequest().body(
                new ApiResponse<>(false, "Validation failed", errors, LocalDateTime.now())
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> internalError(Exception ex) {
        log.error("Unhandled exception: ", ex);
        return error("An internal server error occurred: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
