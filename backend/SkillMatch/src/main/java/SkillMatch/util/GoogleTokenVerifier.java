package SkillMatch.util;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonObjectParser;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

@Component
public class GoogleTokenVerifier {

    private GoogleIdTokenVerifier verifier;
    private String clientId;
    private String clientSecret;

    public GoogleTokenVerifier(
            @Value("${google.client.id}") String clientId,
            @Value("${google.client.secret}") String clientSecret
    ) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.verifier=new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        ).setAudience(Collections.singletonList(clientId))
                .build();

    }

    public GoogleIdToken.Payload verify(String idToken){
        try {
            // Check if it's an access token (implicit flow) or ID token
            GoogleIdToken token = verifier.verify(idToken);
            if (token != null) {
                return token.getPayload();
            }
            return null; 
        } catch (GeneralSecurityException | IOException | IllegalArgumentException e) {
            return null;
        }
    }

    public GoogleIdToken.Payload fetchFromAccessToken(String accessToken) {
        if (accessToken == null || accessToken.isBlank()) {
            return null;
        }
        try {
            NetHttpTransport transport = new NetHttpTransport();
            GsonFactory gsonFactory = GsonFactory.getDefaultInstance();
            com.google.api.client.http.HttpRequestFactory requestFactory = transport.createRequestFactory();
            com.google.api.client.http.GenericUrl url = new com.google.api.client.http.GenericUrl("https://www.googleapis.com/oauth2/v3/userinfo");
            
            com.google.api.client.http.HttpRequest request = requestFactory.buildGetRequest(url);
            request.getHeaders().setAuthorization("Bearer " + accessToken);
            request.setParser(new JsonObjectParser(gsonFactory));
            
            com.google.api.client.http.HttpResponse response = request.execute();
            java.util.Map<String, Object> data = response.parseAs(java.util.Map.class);
            
            GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
            payload.setEmail((String) data.get("email"));
            payload.setEmailVerified((Boolean) data.get("email_verified"));
            payload.setSubject((String) data.get("sub"));
            payload.set("given_name", data.get("given_name"));
            payload.set("family_name", data.get("family_name"));
            return payload;
        } catch (IOException e) {
            return null;
        }
    }

    public GoogleIdToken.Payload exchangeAndVerify(String authCode){
        if (authCode == null || authCode.isBlank()) {
            return null;
        }
        try {
            // Check if we are in production or local
            String redirectUri = "postmessage";
            
            GoogleTokenResponse tokenResponse= new GoogleAuthorizationCodeTokenRequest(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance(),
                    clientId,
                    clientSecret,
                    authCode,
                    redirectUri
            ).execute();
            String idToken=tokenResponse.getIdToken(); // CRITICAL: Use getIdToken(), not getAccessToken()
            GoogleIdToken.Payload payload=verify(idToken);
            return payload;
        } catch (IOException e) {
            return null;
        }
    }





}
