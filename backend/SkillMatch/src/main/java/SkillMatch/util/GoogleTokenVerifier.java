package SkillMatch.util;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
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
            GoogleIdToken token=verifier.verify(idToken);
            GoogleIdToken.Payload payload=token.getPayload();
            return payload;
        } catch (GeneralSecurityException e) {
            throw new RuntimeException(e);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public GoogleIdToken.Payload exchangeAndVerify(String authCode){
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
            throw new RuntimeException(e);
        }
    }





}
