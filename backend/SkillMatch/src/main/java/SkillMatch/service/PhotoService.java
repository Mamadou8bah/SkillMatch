package SkillMatch.service;

import SkillMatch.model.Photo;
import SkillMatch.repository.PhotoRepository;
import java.io.IOException;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class PhotoService {


    private final CloudinaryService cloudinaryService;


    private final PhotoRepository photoRepository;

    public Photo createPhoto(MultipartFile photoFile)throws IOException {

        try{
            Map photo =cloudinaryService.uploadImage(photoFile);
            String url = photo.get("url").toString();
            String publicId = photo.get("public_id").toString();

            Photo newPhoto = new Photo();
            newPhoto.setUrl(url);
            newPhoto.setPublicId(publicId);
            return  photoRepository.save(newPhoto);
        }catch(Exception e){
            throw new IOException("Failed to Upload Photo: "+e.getMessage());
        }
    }

    public Photo createPhotoFromBase64(String base64Data) throws IOException {
        try {
            Map photo = cloudinaryService.uploadBase64(base64Data);
            String url = photo.get("url").toString();
            String publicId = photo.get("public_id").toString();

            Photo newPhoto = new Photo();
            newPhoto.setUrl(url);
            newPhoto.setPublicId(publicId);
            return photoRepository.save(newPhoto);
        } catch (Exception e) {
            throw new IOException("Failed to Upload Photo from Base64: " + e.getMessage());
        }
    }

   public ResponseEntity<?> deletePhoto(Photo photo)throws IOException {
        cloudinaryService.deleteImage(photo.getPublicId());
        photoRepository.delete(photo);
        return ResponseEntity.ok().build();
   }

    public ResponseEntity<?>updatePhoto(String url,MultipartFile file) throws IOException {
        Photo photo=photoRepository.findByUrl(url);
        if(photo!=null){
            cloudinaryService.deleteImage(photo.getPublicId());
            Map newPhoto=cloudinaryService.uploadImage(file);
            photo.setUrl(newPhoto.get("url").toString());
            photo.setPublicId(newPhoto.get("public_id").toString());
            return  ResponseEntity.ok().body(photoRepository.save(photo));
        }
        return ResponseEntity.notFound().build();
    }

}
