import cv2
import numpy as np
import mediapipe as mp
import json
import base64
from io import BytesIO
from PIL import Image
import colorsys
import sys
import os
from sklearn.cluster import KMeans
from scipy import ndimage
import warnings
warnings.filterwarnings('ignore')

class AdvancedSkinAnalyzer:
    def __init__(self):
        # Initialize MediaPipe
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_face_detection = mp.solutions.face_detection
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        # Face mesh for detailed landmarks
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        
        # Face detection for bounding boxes
        self.face_detection = self.mp_face_detection.FaceDetection(
            model_selection=1,
            min_detection_confidence=0.7
        )
        
        # Define facial regions for analysis
        self.facial_regions = {
            'forehead': [10, 151, 9, 10, 151, 9, 67, 109, 10, 151],
            'left_cheek': [116, 117, 118, 119, 120, 121, 126, 142, 36, 205],
            'right_cheek': [345, 346, 347, 348, 349, 350, 355, 371, 266, 425],
            'nose': [1, 2, 5, 4, 6, 19, 20, 94, 125, 141, 235, 236, 3, 51, 48, 115],
            'chin': [18, 175, 199, 200, 9, 10, 151, 175, 18, 200],
            'eye_area': [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
            'lip_area': [61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318]
        }
        
    def preprocess_image(self, image):
        """Enhanced image preprocessing"""
        # Convert to RGB if needed
        if len(image.shape) == 3 and image.shape[2] == 3:
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        else:
            image_rgb = image
            
        # Enhance image quality
        # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        lab = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2LAB)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        lab[:,:,0] = clahe.apply(lab[:,:,0])
        enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
        
        # Noise reduction
        denoised = cv2.bilateralFilter(enhanced, 9, 75, 75)
        
        return denoised
    
    def extract_face_region(self, image, landmarks):
        """Extract face region using convex hull"""
        height, width = image.shape[:2]
        
        # Get face contour points
        face_points = []
        face_oval_indices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 
                           397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 
                           172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
        
        for idx in face_oval_indices:
            if idx < len(landmarks.landmark):
                x = int(landmarks.landmark[idx].x * width)
                y = int(landmarks.landmark[idx].y * height)
                face_points.append([x, y])
        
        # Create mask
        face_points = np.array(face_points, dtype=np.int32)
        mask = np.zeros((height, width), dtype=np.uint8)
        cv2.fillPoly(mask, [face_points], 255)
        
        # Apply mask to image
        face_region = cv2.bitwise_and(image, image, mask=mask)
        
        return face_region, mask
    
    def analyze_skin_tone_advanced(self, image, landmarks):
        """Advanced skin tone analysis using multiple regions"""
        height, width = image.shape[:2]
        
        skin_samples = []
        region_colors = {}
        
        # Analyze each facial region
        for region_name, indices in self.facial_regions.items():
            if region_name in ['eye_area', 'lip_area']:  # Skip non-skin regions
                continue
                
            region_pixels = []
            for idx in indices:
                if idx < len(landmarks.landmark):
                    x = int(landmarks.landmark[idx].x * width)
                    y = int(landmarks.landmark[idx].y * height)
                    
                    # Sample area around landmark
                    for dy in range(-3, 4):
                        for dx in range(-3, 4):
                            ny, nx = y + dy, x + dx
                            if 0 <= ny < height and 0 <= nx < width:
                                pixel = image[ny, nx]
                                if np.sum(pixel) > 30:  # Avoid very dark pixels
                                    region_pixels.append(pixel)
            
            if region_pixels:
                region_avg = np.mean(region_pixels, axis=0)
                region_colors[region_name] = region_avg
                skin_samples.extend(region_pixels)
        
        if not skin_samples:
            return "Medium", "Neutral", 50
            
        # Use K-means clustering to find dominant skin colors
        skin_array = np.array(skin_samples)
        if len(skin_array) > 100:
            # Sample subset for performance
            indices = np.random.choice(len(skin_array), 100, replace=False)
            skin_array = skin_array[indices]
        
        # K-means clustering
        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        kmeans.fit(skin_array)
        
        # Get the most representative color (largest cluster)
        labels = kmeans.labels_
        unique, counts = np.unique(labels, return_counts=True)
        dominant_cluster = unique[np.argmax(counts)]
        dominant_color = kmeans.cluster_centers_[dominant_cluster]
        
        # Analyze skin tone and undertone
        skin_tone = self.classify_skin_tone_advanced(dominant_color, region_colors)
        undertone = self.classify_undertone_advanced(dominant_color, region_colors)
        confidence = min(95, max(70, len(skin_samples) // 10))
        
        return skin_tone, undertone, confidence
    
    def classify_skin_tone_advanced(self, dominant_color, region_colors):
        """Advanced skin tone classification"""
        # Convert to different color spaces for analysis
        rgb = dominant_color / 255.0
        hsv = colorsys.rgb_to_hsv(rgb[0], rgb[1], rgb[2])
        
        # Calculate brightness and saturation
        brightness = np.mean(dominant_color)
        saturation = hsv[1]
        
        # More nuanced classification
        if brightness > 220:
            return "Very Fair"
        elif brightness > 190:
            return "Fair" 
        elif brightness > 160:
            return "Light"
        elif brightness > 130:
            return "Light Medium"
        elif brightness > 100:
            return "Medium"
        elif brightness > 80:
            return "Medium Deep"
        elif brightness > 60:
            return "Deep"
        else:
            return "Very Deep"
    
    def classify_undertone_advanced(self, dominant_color, region_colors):
        """Advanced undertone classification"""
        r, g, b = dominant_color
        
        # Multiple undertone detection methods
        methods = []
        
        # Method 1: RGB ratios
        if r > g and r > b:
            if (r - g) > (r - b):
                methods.append("Warm")
            else:
                methods.append("Neutral")
        elif g > r and g > b:
            methods.append("Olive")
        elif b > r and b > g:
            methods.append("Cool")
        else:
            methods.append("Neutral")
        
        # Method 2: HSV analysis
        hsv = colorsys.rgb_to_hsv(r/255, g/255, b/255)
        hue = hsv[0] * 360
        
        if 15 <= hue <= 45:  # Yellow-orange range
            methods.append("Warm")
        elif 200 <= hue <= 260:  # Blue-purple range
            methods.append("Cool")
        elif 45 <= hue <= 80:  # Green-yellow range
            methods.append("Olive")
        else:
            methods.append("Neutral")
        
        # Method 3: Color temperature
        color_temp = (r + g) / (2 * b) if b > 0 else 1
        if color_temp > 1.1:
            methods.append("Warm")
        elif color_temp < 0.9:
            methods.append("Cool")
        else:
            methods.append("Neutral")
        
        # Consensus decision
        from collections import Counter
        undertone_counts = Counter(methods)
        return undertone_counts.most_common(1)[0][0]
    
    def detect_skin_concerns_advanced(self, image, landmarks, face_region):
        """Advanced skin concern detection"""
        concerns = []
        height, width = image.shape[:2]
        
        # Convert to grayscale for texture analysis
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # 1. Texture analysis for acne/blemishes
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        if laplacian_var > 800:
            concerns.append("Textural irregularities")
        elif laplacian_var > 400:
            concerns.append("Minor skin texture variations")
        
        # 2. Detect dark circles
        eye_regions = self.get_eye_regions(landmarks, width, height)
        for eye_region in eye_regions:
            if eye_region:
                avg_darkness = np.mean(gray[eye_region])
                if avg_darkness < 80:
                    concerns.append("Dark under-eye circles")
                    break
        
        # 3. Detect uneven skin tone
        face_pixels = face_region[face_region > 0]
        if len(face_pixels) > 100:
            std_dev = np.std(face_pixels)
            if std_dev > 40:
                concerns.append("Uneven skin tone")
            elif std_dev > 25:
                concerns.append("Slight color variations")
        
        # 4. Detect oily/dry areas
        # Use Sobel edge detection to find texture patterns
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        sobel_combined = np.sqrt(sobelx**2 + sobely**2)
        
        # Analyze T-zone for oiliness
        t_zone_mask = self.get_t_zone_mask(landmarks, width, height)
        if t_zone_mask is not None:
            t_zone_texture = np.mean(sobel_combined[t_zone_mask > 0])
            if t_zone_texture > 30:
                concerns.append("Oily T-zone")
        
        # 5. Age-related concerns
        # Detect fine lines using Hough line detection
        edges = cv2.Canny(gray, 50, 150)
        lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=20, minLineLength=10, maxLineGap=5)
        if lines is not None and len(lines) > 50:
            concerns.append("Fine lines and wrinkles")
        
        # 6. Redness detection
        # Analyze red channel dominance
        red_channel = image[:,:,0]
        green_channel = image[:,:,1]
        blue_channel = image[:,:,2]
        
        redness_mask = (red_channel > green_channel + 10) & (red_channel > blue_channel + 10)
        redness_percentage = np.sum(redness_mask) / (width * height) * 100
        
        if redness_percentage > 5:
            concerns.append("Facial redness")
        elif redness_percentage > 2:
            concerns.append("Mild skin sensitivity")
        
        return concerns if concerns else ["Clear, healthy complexion"]
    
    def get_eye_regions(self, landmarks, width, height):
        """Extract eye regions for dark circle detection"""
        left_eye_indices = [33, 7, 163, 144, 145, 153, 154, 155, 133]
        right_eye_indices = [362, 382, 381, 380, 374, 373, 390, 249, 263]
        
        regions = []
        for eye_indices in [left_eye_indices, right_eye_indices]:
            points = []
            for idx in eye_indices:
                if idx < len(landmarks.landmark):
                    x = int(landmarks.landmark[idx].x * width)
                    y = int(landmarks.landmark[idx].y * height)
                    points.append([x, y])
            
            if points:
                points = np.array(points, dtype=np.int32)
                mask = np.zeros((height, width), dtype=np.uint8)
                cv2.fillPoly(mask, [points], 255)
                regions.append(mask > 0)
            else:
                regions.append(None)
        
        return regions
    
    def get_t_zone_mask(self, landmarks, width, height):
        """Create T-zone mask for oiliness detection"""
        # T-zone includes forehead and nose
        t_zone_indices = [10, 151, 9, 67, 109, 1, 2, 5, 4, 6, 19, 20, 94, 125, 141, 235, 236]
        
        points = []
        for idx in t_zone_indices:
            if idx < len(landmarks.landmark):
                x = int(landmarks.landmark[idx].x * width)
                y = int(landmarks.landmark[idx].y * height)
                points.append([x, y])
        
        if points:
            points = np.array(points, dtype=np.int32)
            mask = np.zeros((height, width), dtype=np.uint8)
            cv2.fillPoly(mask, [points], 255)
            return mask
        
        return None
    
    def generate_advanced_recommendations(self, skin_tone, undertone, concerns, confidence):
        """Generate advanced, personalized recommendations"""
        recommendations = {
            "foundations": [],
            "concealers": [],
            "lipsticks": [],
            "eyeshadows": [],
            "blushes": [],
            "skincare": [],
            "techniques": []
        }
        
        # Foundation recommendations based on detailed analysis
        base_coverage = "full" if any("irregularities" in concern for concern in concerns) else "medium"
        finish_type = "matte" if "Oily" in str(concerns) else "natural"
        
        recommendations["foundations"] = [
            f"{skin_tone} shade with {undertone.lower()} undertones",
            f"{base_coverage.title()} coverage foundation with {finish_type} finish",
            "Color-matching foundation with SPF 30+ protection",
            "Long-wearing, oxidation-resistant formula"
        ]
        
        # Concealer recommendations based on specific concerns
        if "Dark under-eye circles" in concerns:
            recommendations["concealers"].append("Peach/orange color corrector for dark circles")
        if "redness" in str(concerns).lower():
            recommendations["concealers"].append("Green color corrector for redness")
        if "irregularities" in str(concerns):
            recommendations["concealers"].append("High-coverage spot concealer")
        
        recommendations["concealers"].extend([
            "Hydrating under-eye concealer one shade lighter",
            "Setting powder to prevent creasing"
        ])
        
        # Undertone-specific color recommendations
        if undertone == "Warm":
            recommendations["lipsticks"] = [
                "Coral Sunset - Warm coral with golden undertones",
                "Terracotta Rose - Earthy rose perfect for warm skin",
                "Golden Red - Classic red with warm gold base",
                "Peach Nude - Natural peachy nude"
            ]
            recommendations["eyeshadows"] = [
                "Golden Bronze - Warm metallic highlight",
                "Copper Shimmer - Rich copper accent",
                "Warm Taupe - Neutral brown base",
                "Champagne Gold - Inner corner highlight"
            ]
            recommendations["blushes"] = [
                "Peachy Coral - Warm peach tone",
                "Apricot Glow - Soft warm apricot"
            ]
        elif undertone == "Cool":
            recommendations["lipsticks"] = [
                "Berry Crush - Cool berry with blue undertones",
                "Rose Pink - Classic cool pink",
                "True Red - Blue-based red",
                "Mauve Nude - Cool-toned nude"
            ]
            recommendations["eyeshadows"] = [
                "Silver Shimmer - Cool metallic highlight",
                "Plum Purple - Deep cool purple",
                "Cool Gray - Sophisticated neutral",
                "Icy Pink - Light cool accent"
            ]
            recommendations["blushes"] = [
                "Rose Pink - Cool pink flush",
                "Berry Tint - Subtle berry tone"
            ]
        elif undertone == "Olive":
            recommendations["lipsticks"] = [
                "Brick Red - Earthy red for olive skin",
                "Nude Mauve - Sophisticated neutral",
                "Warm Berry - Berry with golden undertones",
                "Terracotta - Earthy orange-brown"
            ]
            recommendations["eyeshadows"] = [
                "Bronze Gold - Warm metallic",
                "Olive Green - Complementary green",
                "Warm Brown - Rich brown base",
                "Gold Shimmer - Warm highlight"
            ]
            recommendations["blushes"] = [
                "Warm Coral - Coral with golden undertones",
                "Dusty Rose - Muted rose tone"
            ]
        else:  # Neutral
            recommendations["lipsticks"] = [
                "Nude Rose - Universal nude",
                "Mauve Perfect - Balanced mauve",
                "Classic Red - Versatile red",
                "Pink Nude - Soft everyday pink"
            ]
            recommendations["eyeshadows"] = [
                "Rose Gold - Universal metallic",
                "Neutral Taupe - Versatile brown",
                "Soft Champagne - Light highlight",
                "Warm Brown - Classic brown"
            ]
            recommendations["blushes"] = [
                "Dusty Rose - Perfect neutral rose",
                "Soft Coral - Balanced coral"
            ]
        
        # Skincare recommendations based on concerns
        if "Oily" in str(concerns):
            recommendations["skincare"].extend([
                "Oil-free, non-comedogenic moisturizer",
                "Salicylic acid cleanser for pore control",
                "Clay mask 2-3 times per week"
            ])
        elif "dryness" in str(concerns).lower():
            recommendations["skincare"].extend([
                "Hydrating hyaluronic acid serum",
                "Rich, nourishing moisturizer",
                "Gentle, cream-based cleanser"
            ])
        
        if "Dark under-eye circles" in concerns:
            recommendations["skincare"].append("Caffeine-based eye cream")
        
        if "redness" in str(concerns).lower():
            recommendations["skincare"].extend([
                "Gentle, fragrance-free products",
                "Niacinamide serum for redness reduction"
            ])
        
        # Application techniques
        recommendations["techniques"] = [
            "Use primer to extend makeup longevity",
            "Apply foundation with damp beauty sponge for natural finish",
            "Set makeup with translucent powder",
            "Use setting spray for all-day wear"
        ]
        
        return recommendations
    
    def analyze_image(self, image_data):
        """Main analysis function with comprehensive AI processing"""
        try:
            # Decode base64 image
            if ',' in image_data:
                image_bytes = base64.b64decode(image_data.split(',')[1])
            else:
                image_bytes = base64.b64decode(image_data)
                
            image = Image.open(BytesIO(image_bytes))
            image_np = np.array(image)
            
            # Preprocess image
            processed_image = self.preprocess_image(image_np)
            
            # MediaPipe face detection and landmarks
            face_results = self.face_mesh.process(processed_image)
            detection_results = self.face_detection.process(processed_image)
            
            if not face_results.multi_face_landmarks:
                return {"error": "No face detected in the image. Please ensure your face is clearly visible and well-lit."}
            
            face_landmarks = face_results.multi_face_landmarks[0]
            
            # Extract face region
            face_region, face_mask = self.extract_face_region(processed_image, face_landmarks)
            
            # Advanced skin analysis
            skin_tone, undertone, confidence = self.analyze_skin_tone_advanced(processed_image, face_landmarks)
            
            # Detect skin concerns
            concerns = self.detect_skin_concerns_advanced(processed_image, face_landmarks, face_region)
            
            # Generate recommendations
            recommendations = self.generate_advanced_recommendations(skin_tone, undertone, concerns, confidence)
            
            # Calculate face quality score
            face_quality = self.calculate_face_quality(detection_results, face_landmarks)
            
            return {
                "success": True,
                "skinTone": skin_tone,
                "undertone": undertone,
                "concerns": concerns,
                "recommendations": recommendations,
                "confidence": min(confidence, face_quality),
                "faceQuality": face_quality,
                "landmarks": [[lm.x, lm.y, lm.z] for lm in face_landmarks.landmark],
                "method": "mediapipe_advanced_analysis",
                "processingDetails": {
                    "landmarksDetected": len(face_landmarks.landmark),
                    "faceRegionExtracted": True,
                    "multiRegionAnalysis": True,
                    "advancedConcernDetection": True
                }
            }
            
        except Exception as e:
            return {"error": f"Analysis failed: {str(e)}"}
    
    def calculate_face_quality(self, detection_results, landmarks):
        """Calculate face quality score for confidence adjustment"""
        quality_score = 85  # Base score
        
        # Check face detection confidence
        if detection_results.detections:
            detection_confidence = detection_results.detections[0].score[0]
            quality_score += min(10, detection_confidence * 10)
        
        # Check landmark completeness
        if len(landmarks.landmark) >= 468:  # Full face mesh
            quality_score += 5
        
        return min(99, quality_score)

# Main execution
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "No image data provided"}))
        sys.exit(1)
    
    image_data = sys.argv[1]
    analyzer = AdvancedSkinAnalyzer()
    result = analyzer.analyze_image(image_data)
    print(json.dumps(result))
