import cv2
import numpy as np
import mediapipe as mp
import json
import base64
from io import BytesIO
from PIL import Image, ImageDraw, ImageFilter
import colorsys
import sys
import os
from scipy import ndimage
from scipy.spatial import distance
import warnings
warnings.filterwarnings('ignore')

class RealtimeMakeupEngine:
    def __init__(self):
        # Initialize MediaPipe
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        # Face mesh for detailed landmarks
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        
        # Define facial landmarks for different makeup areas
        self.makeup_landmarks = {
            # Lips landmarks
            'lips_outer': [61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318, 
                          78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415],
            'lips_upper': [61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318],
            'lips_lower': [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415],
            
            # Eyes landmarks
            'left_eye': [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
            'right_eye': [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],
            'left_eyebrow': [46, 53, 52, 51, 48, 115, 131, 134, 102, 49, 220, 305],
            'right_eyebrow': [276, 283, 282, 281, 278, 344, 360, 363, 331, 279, 440, 75],
            
            # Cheeks landmarks
            'left_cheek': [116, 117, 118, 119, 120, 121, 126, 142, 36, 205, 206, 207, 213, 192, 147, 187],
            'right_cheek': [345, 346, 347, 348, 349, 350, 355, 371, 266, 425, 426, 427, 436, 416, 376, 411],
            
            # Face contour
            'face_oval': [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 
                         397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 
                         172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109],
            
            # Forehead area
            'forehead': [10, 151, 9, 10, 151, 9, 67, 109, 10, 151, 54, 103, 67, 109, 10, 151],
            
            # Nose area
            'nose': [1, 2, 5, 4, 6, 19, 20, 94, 125, 141, 235, 236, 3, 51, 48, 115, 131, 134, 102, 49, 220, 305]
        }
        
        # Makeup color palettes
        self.makeup_colors = {
            'lipstick': {
                'red_classic': '#DC143C',
                'red_cherry': '#B22222',
                'red_wine': '#722F37',
                'pink_rose': '#FF69B4',
                'pink_coral': '#FF7F50',
                'pink_nude': '#F8BBD9',
                'berry_deep': '#8B008B',
                'berry_plum': '#DDA0DD',
                'orange_coral': '#FF6347',
                'brown_nude': '#D2691E',
                'purple_mauve': '#9370DB',
                'red_matte': '#8B0000'
            },
            'eyeshadow': {
                'brown_neutral': '#8B7355',
                'brown_chocolate': '#7B3F00',
                'gold_shimmer': '#FFD700',
                'bronze_metallic': '#CD7F32',
                'silver_metallic': '#C0C0C0',
                'purple_smoky': '#663399',
                'blue_navy': '#000080',
                'green_emerald': '#50C878',
                'pink_rose': '#FF69B4',
                'black_smoky': '#2F2F2F',
                'copper_warm': '#B87333',
                'champagne_light': '#F7E7CE'
            },
            'blush': {
                'pink_natural': '#FFB6C1',
                'coral_warm': '#FF7F50',
                'peach_soft': '#FFCCCB',
                'rose_classic': '#FF69B4',
                'berry_bold': '#DC143C',
                'apricot_glow': '#FBCEB1',
                'mauve_subtle': '#E0B0FF',
                'bronze_sun': '#CD7F32'
            },
            'foundation': {
                'porcelain': '#F5E6D3',
                'ivory': '#FFFFF0',
                'beige_light': '#F5F5DC',
                'beige_medium': '#E8C5A0',
                'tan_light': '#D2B48C',
                'tan_medium': '#D4A574',
                'bronze_light': '#CD853F',
                'bronze_deep': '#8B4513',
                'espresso': '#6F4E37',
                'ebony': '#555D50'
            },
            'eyeliner': {
                'black_classic': '#000000',
                'brown_soft': '#8B4513',
                'blue_electric': '#0080FF',
                'green_emerald': '#50C878',
                'purple_plum': '#8B008B',
                'gold_metallic': '#FFD700',
                'silver_metallic': '#C0C0C0',
                'navy_deep': '#000080'
            },
            'eyebrow': {
                'brown_light': '#A0522D',
                'brown_medium': '#8B4513',
                'brown_dark': '#654321',
                'black_soft': '#2F2F2F',
                'auburn': '#A52A2A',
                'blonde': '#D2B48C',
                'gray_ash': '#708090'
            }
        }
    
    def hex_to_rgb(self, hex_color):
        """Convert hex color to RGB tuple"""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    def apply_gaussian_blur(self, image, kernel_size=15):
        """Apply Gaussian blur for smooth makeup application"""
        return cv2.GaussianBlur(image, (kernel_size, kernel_size), 0)
    
    def create_gradient_mask(self, shape, center, radius, fade_factor=0.7):
        """Create a gradient mask for natural makeup blending"""
        mask = np.zeros(shape[:2], dtype=np.float32)
        y, x = np.ogrid[:shape[0], :shape[1]]
        distance_from_center = np.sqrt((x - center[0])**2 + (y - center[1])**2)
        
        # Create gradient
        mask = np.maximum(0, 1 - (distance_from_center / radius) ** fade_factor)
        return mask
    
    def apply_lipstick(self, image, landmarks, color_hex, intensity=0.8):
        """Apply realistic lipstick with proper blending"""
        height, width = image.shape[:2]
        color_rgb = self.hex_to_rgb(color_hex)
        
        # Create lip mask
        lip_points = []
        for idx in self.makeup_landmarks['lips_outer']:
            if idx < len(landmarks.landmark):
                x = int(landmarks.landmark[idx].x * width)
                y = int(landmarks.landmark[idx].y * height)
                lip_points.append([x, y])
        
        if len(lip_points) < 3:
            return image
        
        # Create mask
        lip_points = np.array(lip_points, dtype=np.int32)
        mask = np.zeros((height, width), dtype=np.uint8)
        cv2.fillPoly(mask, [lip_points], 255)
        
        # Apply morphological operations for smoother edges
        kernel = np.ones((3, 3), np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
        mask = cv2.GaussianBlur(mask, (5, 5), 0)
        
        # Create colored overlay
        overlay = image.copy()
        overlay[mask > 0] = [int(c * intensity + image[mask > 0][:, i] * (1 - intensity)) 
                           for i, c in enumerate(color_rgb)]
        
        # Blend with original image
        mask_normalized = mask.astype(np.float32) / 255.0
        mask_3d = np.stack([mask_normalized] * 3, axis=2)
        
        result = image * (1 - mask_3d * intensity) + overlay * mask_3d * intensity
        return result.astype(np.uint8)
    
    def apply_eyeshadow(self, image, landmarks, color_hex, intensity=0.6):
        """Apply eyeshadow with gradient blending"""
        height, width = image.shape[:2]
        color_rgb = self.hex_to_rgb(color_hex)
        
        result = image.copy()
        
        # Apply to both eyes
        for eye_landmarks in ['left_eye', 'right_eye']:
            eye_points = []
            for idx in self.makeup_landmarks[eye_landmarks]:
                if idx < len(landmarks.landmark):
                    x = int(landmarks.landmark[idx].x * width)
                    y = int(landmarks.landmark[idx].y * height)
                    eye_points.append([x, y])
            
            if len(eye_points) < 3:
                continue
            
            # Create extended eyeshadow area
            eye_points = np.array(eye_points, dtype=np.int32)
            
            # Expand the area upward for eyeshadow
            center_x = np.mean(eye_points[:, 0])
            center_y = np.mean(eye_points[:, 1])
            
            # Create eyeshadow mask with gradient
            mask = np.zeros((height, width), dtype=np.float32)
            
            # Create elliptical gradient for natural eyeshadow look
            for y in range(max(0, int(center_y - 40)), min(height, int(center_y + 20))):
                for x in range(max(0, int(center_x - 50)), min(width, int(center_x + 50))):
                    # Calculate distance from eye center
                    dx = (x - center_x) / 50.0
                    dy = (y - center_y + 10) / 30.0  # Shift upward for eyeshadow
                    distance = np.sqrt(dx*dx + dy*dy)
                    
                    if distance <= 1.0:
                        # Create gradient effect
                        alpha = max(0, 1 - distance) * intensity
                        if y < center_y:  # Apply more intensity above the eye
                            alpha *= 1.5
                        mask[y, x] = min(1.0, alpha)
            
            # Apply color with mask
            for i in range(3):
                result[:, :, i] = (result[:, :, i] * (1 - mask) + 
                                 color_rgb[i] * mask * intensity + 
                                 result[:, :, i] * mask * (1 - intensity))
        
        return result.astype(np.uint8)
    
    def apply_blush(self, image, landmarks, color_hex, intensity=0.4):
        """Apply blush to cheek areas"""
        height, width = image.shape[:2]
        color_rgb = self.hex_to_rgb(color_hex)
        
        result = image.copy()
        
        # Apply to both cheeks
        for cheek_landmarks in ['left_cheek', 'right_cheek']:
            cheek_points = []
            for idx in self.makeup_landmarks[cheek_landmarks]:
                if idx < len(landmarks.landmark):
                    x = int(landmarks.landmark[idx].x * width)
                    y = int(landmarks.landmark[idx].y * height)
                    cheek_points.append([x, y])
            
            if len(cheek_points) < 3:
                continue
            
            # Calculate cheek center
            cheek_points = np.array(cheek_points)
            center_x = np.mean(cheek_points[:, 0])
            center_y = np.mean(cheek_points[:, 1])
            
            # Create circular gradient mask
            mask = self.create_gradient_mask(image.shape, (center_x, center_y), 40, 0.8)
            
            # Apply blush color
            for i in range(3):
                result[:, :, i] = (result[:, :, i] * (1 - mask * intensity) + 
                                 color_rgb[i] * mask * intensity)
        
        return result.astype(np.uint8)
    
    def apply_foundation(self, image, landmarks, color_hex, intensity=0.3):
        """Apply foundation to face area"""
        height, width = image.shape[:2]
        color_rgb = self.hex_to_rgb(color_hex)
        
        # Create face mask
        face_points = []
        for idx in self.makeup_landmarks['face_oval']:
            if idx < len(landmarks.landmark):
                x = int(landmarks.landmark[idx].x * width)
                y = int(landmarks.landmark[idx].y * height)
                face_points.append([x, y])
        
        if len(face_points) < 3:
            return image
        
        # Create face mask
        face_points = np.array(face_points, dtype=np.int32)
        mask = np.zeros((height, width), dtype=np.uint8)
        cv2.fillPoly(mask, [face_points], 255)
        
        # Smooth the mask
        mask = cv2.GaussianBlur(mask, (15, 15), 0)
        mask_normalized = mask.astype(np.float32) / 255.0
        
        # Apply foundation with skin tone blending
        result = image.copy()
        for i in range(3):
            result[:, :, i] = (image[:, :, i] * (1 - mask_normalized * intensity) + 
                             color_rgb[i] * mask_normalized * intensity)
        
        return result.astype(np.uint8)
    
    def apply_eyeliner(self, image, landmarks, color_hex, intensity=0.9, thickness=2):
        """Apply eyeliner along the eye contour"""
        height, width = image.shape[:2]
        color_rgb = self.hex_to_rgb(color_hex)
        
        result = image.copy()
        
        # Apply to both eyes
        for eye_landmarks in ['left_eye', 'right_eye']:
            eye_points = []
            for idx in self.makeup_landmarks[eye_landmarks]:
                if idx < len(landmarks.landmark):
                    x = int(landmarks.landmark[idx].x * width)
                    y = int(landmarks.landmark[idx].y * height)
                    eye_points.append([x, y])
            
            if len(eye_points) < 3:
                continue
            
            # Draw eyeliner along upper eyelid
            eye_points = np.array(eye_points, dtype=np.int32)
            
            # Get upper eyelid points (approximate)
            upper_points = eye_points[:len(eye_points)//2]
            
            # Draw smooth eyeliner
            for i in range(len(upper_points) - 1):
                cv2.line(result, tuple(upper_points[i]), tuple(upper_points[i+1]), 
                        color_rgb, thickness)
        
        return result
    
    def apply_eyebrow_enhancement(self, image, landmarks, color_hex, intensity=0.5):
        """Enhance eyebrows with color and definition"""
        height, width = image.shape[:2]
        color_rgb = self.hex_to_rgb(color_hex)
        
        result = image.copy()
        
        # Apply to both eyebrows
        for brow_landmarks in ['left_eyebrow', 'right_eyebrow']:
            brow_points = []
            for idx in self.makeup_landmarks[brow_landmarks]:
                if idx < len(landmarks.landmark):
                    x = int(landmarks.landmark[idx].x * width)
                    y = int(landmarks.landmark[idx].y * height)
                    brow_points.append([x, y])
            
            if len(brow_points) < 3:
                continue
            
            # Create eyebrow mask
            brow_points = np.array(brow_points, dtype=np.int32)
            mask = np.zeros((height, width), dtype=np.uint8)
            
            # Draw filled polygon for eyebrow area
            cv2.fillPoly(mask, [brow_points], 255)
            
            # Apply morphological operations
            kernel = np.ones((3, 3), np.uint8)
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
            mask = cv2.GaussianBlur(mask, (3, 3), 0)
            
            # Apply color
            mask_normalized = mask.astype(np.float32) / 255.0
            for i in range(3):
                result[:, :, i] = (result[:, :, i] * (1 - mask_normalized * intensity) + 
                                 color_rgb[i] * mask_normalized * intensity)
        
        return result.astype(np.uint8)
    
    def apply_makeup_combination(self, image_data, makeup_settings):
        """Apply multiple makeup effects based on settings"""
        try:
            # Decode base64 image
            if ',' in image_data:
                image_bytes = base64.b64decode(image_data.split(',')[1])
            else:
                image_bytes = base64.b64decode(image_data)
                
            image = Image.open(BytesIO(image_bytes))
            image_np = np.array(image)
            
            # Convert RGB to BGR for OpenCV
            if len(image_np.shape) == 3 and image_np.shape[2] == 3:
                image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
            else:
                image_bgr = image_np
            
            # Detect face landmarks
            rgb_image = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(rgb_image)
            
            if not results.multi_face_landmarks:
                return {
                    "success": False,
                    "error": "No face detected in the image"
                }
            
            landmarks = results.multi_face_landmarks[0]
            result_image = image_bgr.copy()
            
            # Apply makeup in the correct order for realistic layering
            makeup_order = ['foundation', 'blush', 'eyeshadow', 'eyeliner', 'eyebrow', 'lipstick']
            
            for makeup_type in makeup_order:
                if makeup_type in makeup_settings and makeup_settings[makeup_type]['enabled']:
                    settings = makeup_settings[makeup_type]
                    color = settings.get('color', '#FF0000')
                    intensity = settings.get('intensity', 50) / 100.0
                    
                    if makeup_type == 'lipstick':
                        result_image = self.apply_lipstick(result_image, landmarks, color, intensity)
                    elif makeup_type == 'eyeshadow':
                        result_image = self.apply_eyeshadow(result_image, landmarks, color, intensity)
                    elif makeup_type == 'blush':
                        result_image = self.apply_blush(result_image, landmarks, color, intensity)
                    elif makeup_type == 'foundation':
                        result_image = self.apply_foundation(result_image, landmarks, color, intensity)
                    elif makeup_type == 'eyeliner':
                        thickness = settings.get('thickness', 2)
                        result_image = self.apply_eyeliner(result_image, landmarks, color, intensity, thickness)
                    elif makeup_type == 'eyebrow':
                        result_image = self.apply_eyebrow_enhancement(result_image, landmarks, color, intensity)
            
            # Convert back to RGB
            result_rgb = cv2.cvtColor(result_image, cv2.COLOR_BGR2RGB)
            
            # Convert to base64
            result_pil = Image.fromarray(result_rgb)
            buffer = BytesIO()
            result_pil.save(buffer, format='JPEG', quality=90)
            result_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            return {
                "success": True,
                "processed_image": f"data:image/jpeg;base64,{result_base64}",
                "landmarks_detected": len(landmarks.landmark),
                "makeup_applied": [k for k, v in makeup_settings.items() if v.get('enabled', False)]
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Makeup application failed: {str(e)}"
            }
    
    def get_available_colors(self):
        """Return all available makeup colors"""
        return self.makeup_colors

# Main execution
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image data or settings provided"}))
        sys.exit(1)
    
    try:
        # Parse arguments
        image_data = sys.argv[1]
        makeup_settings = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
        
        engine = RealtimeMakeupEngine()
        result = engine.apply_makeup_combination(image_data, makeup_settings)
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": f"Script execution failed: {str(e)}"}))
