import java.util.List;

public record RegistrationStage3Request(
        String companyName,

        String industry,

        String description,
        
        List<String> skills
) {
}
