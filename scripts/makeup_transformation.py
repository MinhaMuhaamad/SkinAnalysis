import cv2
import numpy as np
import mediapipe as mp
import json
import base64
import sys
import os
from io import BytesIO
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import colorsys
from scipy import ndimage
from scipy.spatial import distance
import math
import time
import warnings
warnings.filterwarnings('ignore')

class MakeupTransformationEngine:
    def __init__(self):
        # Initialize MediaPipe solutions
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        # Initialize face mesh with high precision
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.8,
            min_tracking_confidence=0.7
        )
        
        # Define makeup styles for different occasions
        self.makeup_styles = {
            "romantic": {
                "name": "Romantic Date Night",
                "lipstick": {"color": "#FF69B4", "intensity": 0.7, "finish": "glossy"},
                "eyeshadow": {"colors": ["#F7E7CE", "#E8B4A0", "#CD7F32"], "intensity": 0.5, "blend_mode": "gradient"},
                "blush": {"color": "#FFB6C1", "intensity": 0.4, "style": "natural"},
                "foundation": {"color": "#F5E6D3", "intensity": 0.3, "coverage": "light"},
                "eyeliner": {"color": "#654321", "intensity": 0.6, "thickness": 2, "style": "classic"},
                "eyebrow": {"color": "#8B4513", "intensity": 0.4, "style": "natural"}
            },
            "professional": {
                "name": "Professional Meeting",
                "lipstick": {"color": "#C68E17", "intensity": 0.6, "finish": "matte"},
                "eyeshadow": {"colors": ["#F3E5AB", "#CD853F", "#8B7355"], "intensity": 0.4, "blend_mode": "simple"},
                "blush": {"color": "#DCAE96", "intensity": 0.3, "style": "subtle"},
                "foundation": {"color": "#E8C5A0", "intensity": 0.4, "coverage": "medium"},
                "eyeliner": {"color": "#654321", "intensity": 0.7, "thickness": 2, "style": "classic"},
                "eyebrow": {"color": "#8B4513", "intensity": 0.5, "style": "defined"}
            },
            "bold": {
                "name": "Girls Night Out",
                "lipstick": {"color": "#DC143C", "intensity": 0.9, "finish": "matte"},
                "eyeshadow": {"colors": ["#2F2F2F", "#663399", "#000080"], "intensity": 0.8, "blend_mode": "smoky"},
                "blush": {"color": "#E30B5C", "intensity": 0.6, "style": "dramatic"},
                "foundation": {"color": "#E8C5A0", "intensity": 0.5, "coverage": "full"},
                "eyeliner": {"color": "#000000", "intensity": 0.9, "thickness": 4, "style": "dramatic"},
                "eyebrow": {"color": "#2F2F2F", "intensity": 0.7, "style": "bold"}
            },
            "elegant": {
                "name": "Wedding Guest",
                "lipstick": {"color": "#800020", "intensity": 0.8, "finish": "metallic"},
                "eyeshadow": {"colors": ["#E6E6FA", "#8B008B", "#4B0082"], "intensity": 0.6, "blend_mode": "gradient"},
                "blush": {"color": "#DB5079", "intensity": 0.5, "style": "natural"},
                "foundation": {"color": "#F5E6D3", "intensity": 0.4, "coverage": "medium"},
                "eyeliner": {"color": "#4B0082", "intensity": 0.8, "thickness": 3, "style": "winged"},
                "eyebrow": {"color": "#654321", "intensity": 0.6, "style": "defined"}
            },
            "natural": {
                "name": "Casual Day Out",
                "lipstick": {"color": "#F8BBD9", "intensity": 0.4, "finish": "matte"},
                "eyeshadow": {"colors": ["#F7E7CE", "#D2B48C"], "intensity": 0.3, "blend_mode": "simple"},
                "blush": {"color": "#FFCCCB", "intensity": 0.25, "style": "subtle"},
                "foundation": {"color": "#F5E6D3", "intensity": 0.2, "coverage": "light"},
                "eyeliner": {"color": "#8B4513", "intensity": 0.5, "thickness": 1, "style": "classic"},
                "eyebrow": {"color": "#A0522D", "intensity": 0.3, "style": "natural"}
            },
            "creative": {
                "name": "Festival Vibes",
                "lipstick": {"color": "#FF00FF", "intensity": 0.8, "finish": "metallic"},
                "eyeshadow": {"colors": ["#FFD700", "#FF4500", "#8A2BE2"], "intensity": 0.7, "blend_mode": "gradient"},
                "blush": {"color": "#FF6347", "intensity": 0.5, "style": "dramatic"},
                "foundation": {"color": "#E8C5A0", "intensity": 0.3, "coverage": "medium"},
                "eyeliner": {"color": "#8A2BE2", "intensity": 0.8, "thickness": 3, "style": "dramatic"},
                "eyebrow": {"color": "#654321", "intensity": 0.6, "style": "bold"}
            }
        }
        
        # Face landmark indices for makeup application
        self.face_landmarks = {
            'lips_outer': [61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318, 
                          78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415],
            'left_eye_full': [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
            'right_eye_full': [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],
            'left_eyebrow': [46, 53, 52, 51, 48, 115, 131, 134, 102, 49, 220, 305],
            'right_eyebrow': [276, 283, 282, 281, 278, 344, 360, 363, 331, 279, 440, 75],
            'left_cheek': [116, 117, 118, 119, 120, 121, 126, 142, 36, 205, 206, 207, 213, 192, 147, 187, 123],
            'right_cheek': [345, 346, 347, 348, 349, 350, 355, 371, 266, 425, 426, 427, 436, 416, 376, 411, 352],
            'face_oval': [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 
                         397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 
                         172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109],
            'left_eye_upper': [27, 28, 29, 30, 247, 30, 29, 27, 28],
            'right_eye_upper': [257, 258, 259, 260, 467, 260, 259, 257, 258]
        }
    
    def hex_to_rgb(self, hex_color):
        """Convert hex color to RGB tuple"""
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    def create_smooth_mask(self, shape, points, blur_radius=15, fade_factor=0.8):
        """Create a smooth mask with gradient edges"""
        mask = np.zeros(shape[:2], dtype=np.float32)
        
        if len(points) > 2:
            points_array = np.array(points, dtype=np.int32)
            cv2.fillPoly(mask, [points_array], 1.0)
            
            # Apply Gaussian blur for smooth edges
            mask = cv2.GaussianBlur(mask, (blur_radius, blur_radius), 0)
            
            # Apply fade factor
            mask = np.power(mask, fade_factor)
        
        return mask
    
    def apply_lipstick(self, image, landmarks, settings):
        """Apply lipstick with specified settings"""
        height, width = image.shape[:2]
        color_rgb = self.hex_to_rgb(settings['color'])
        intensity = settings['intensity']
        
        # Get lip points
        lip_points = []
        for idx in self.face_landmarks['lips_outer']:
            if idx < len(landmarks.landmark):
                x = int(landmarks.landmark[idx].x * width)
                y = int(landmarks.landmark[idx].y * height)
                lip_points.append([x, y])
        
        if len(lip_points) < 3:
            return image
        
        # Create smooth lip mask
        mask = self.create_smooth_mask(image.shape, lip_points, blur_radius=5)
        
        # Apply lipstick
        result = image.copy().astype(np.float32)
        
        if settings['finish'] == 'glossy':
            # Add shine effect
            highlight_mask = mask * 0.3
            for i in range(3):
                result[:, :, i] = (result[:, :, i] * (1 - mask * intensity) + 
                                 color_rgb[i] * mask * intensity +
                                 255 * highlight_mask)
        elif settings['finish'] == 'metallic':
            # Add metallic shimmer
            shimmer = np.random.random(image.shape[:2]) * 0.2 * mask
            for i in range(3):
                result[:, :, i] = (result[:, :, i] * (1 - mask * intensity) + 
                                 (color_rgb[i] + shimmer * 100) * mask * intensity)
        else:  # matte
            for i in range(3):
                result[:, :, i] = (result[:, :, i] * (1 - mask * intensity) + 
                                 color_rgb[i] * mask * intensity)
        
        return np.clip(result, 0, 255).astype(np.uint8)
    
    def apply_eyeshadow(self, image, landmarks, settings):
        """Apply eyeshadow with specified settings"""
        height, width = image.shape[:2]
        result = image.copy().astype(np.float32)
        colors = settings['colors']
        intensity = settings['intensity']
        
        # Apply to both eyes
        for eye_side in ['left', 'right']:
            eye_landmarks = f'{eye_side}_eye_full'
            
            eye_points = []
            for idx in self.face_landmarks[eye_landmarks]:
                if idx < len(landmarks.landmark):
                    x = int(landmarks.landmark[idx].x * width)
                    y = int(landmarks.landmark[idx].y * height)
                    eye_points.append([x, y])
            
            if len(eye_points) < 3:
                continue
            
            # Calculate eye center
            eye_points = np.array(eye_points)
            center_x = np.mean(eye_points[:, 0])
            center_y = np.mean(eye_points[:, 1])
            
            # Apply eyeshadow based on blend mode
            if settings['blend_mode'] == 'gradient':
                self.apply_gradient_eyeshadow(result, center_x, center_y, colors, intensity)
            elif settings['blend_mode'] == 'smoky':
                self.apply_smoky_eyeshadow(result, center_x, center_y, colors, intensity)
            else:
                self.apply_simple_eyeshadow(result, center_x, center_y, colors[0], intensity)
        
        return np.clip(result, 0, 255).astype(np.uint8)
    
    def apply_gradient_eyeshadow(self, image, center_x, center_y, colors, intensity):
        """Apply gradient eyeshadow effect"""
        height, width = image.shape[:2]
        
        for y in range(max(0, int(center_y - 50)), min(height, int(center_y + 20))):
            for x in range(max(0, int(center_x - 60)), min(width, int(center_x + 60))):
                dx = x - center_x
                dy = y - center_y + 15
                distance = np.sqrt(dx*dx + dy*dy)
                
                if distance <= 50:
                    # Determine color based on position
                    if len(colors) >= 3:
                        if distance < 15:
                            color = self.hex_to_rgb(colors[0])
                        elif distance < 30:
                            color = self.hex_to_rgb(colors[1])
                        else:
                            color = self.hex_to_rgb(colors[2])
                    else:
                        color = self.hex_to_rgb(colors[0])
                    
                    alpha = max(0, (1 - distance / 50) * intensity)
                    if y < center_y:
                        alpha *= 1.3
                    
                    for i in range(3):
                        image[y, x, i] = (image[y, x, i] * (1 - alpha) + 
                                        color[i] * alpha)
    
    def apply_smoky_eyeshadow(self, image, center_x, center_y, colors, intensity):
        """Apply smoky eyeshadow effect"""
        height, width = image.shape[:2]
        dark_color = self.hex_to_rgb(colors[-1])
        
        for layer in range(3):
            radius = 20 + layer * 15
            layer_intensity = intensity * (0.8 - layer * 0.2)
            
            for y in range(max(0, int(center_y - radius)), min(height, int(center_y + radius//2))):
                for x in range(max(0, int(center_x - radius)), min(width, int(center_x + radius))):
                    dx = x - center_x
                    dy = y - center_y + 10
                    distance = np.sqrt(dx*dx + dy*dy)
                    
                    if distance <= radius:
                        alpha = max(0, (1 - distance / radius) * layer_intensity)
                        
                        for i in range(3):
                            image[y, x, i] = (image[y, x, i] * (1 - alpha) + 
                                            dark_color[i] * alpha)
    
    def apply_simple_eyeshadow(self, image, center_x, center_y, color_hex, intensity):
        """Apply simple single-color eyeshadow"""
        height, width = image.shape[:2]
        color = self.hex_to_rgb(color_hex)
        
        for y in range(max(0, int(center_y - 40)), min(height, int(center_y + 15))):
            for x in range(max(0, int(center_x - 50)), min(width, int(center_x + 50))):
                dx = x - center_x
                dy = y - center_y + 10
                distance = np.sqrt(dx*dx + dy*dy)
                
                if distance <= 40:
                    alpha = max(0, (1 - distance / 40) * intensity)
                    if y < center_y:
                        alpha *= 1.2
                    
                    for i in range(3):
                        image[y, x, i] = (image[y, x, i] * (1 - alpha) + 
                                        color[i] * alpha)
    
    def apply_blush(self, image, landmarks, settings):
        """Apply blush with specified settings"""
        height, width = image.shape[:2]
        color_rgb = self.hex_to_rgb(settings['color'])
        intensity = settings['intensity']
        result = image.copy().astype(np.float32)
        
        # Apply to both cheeks
        for cheek_side in ['left', 'right']:
            cheek_landmarks = f'{cheek_side}_cheek'
            
            cheek_points = []
            for idx in self.face_landmarks[cheek_landmarks]:
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
            
            # Adjust radius and fade based on style
            if settings['style'] == 'dramatic':
                radius = 50
                fade_factor = 0.6
            elif settings['style'] == 'subtle':
                radius = 30
                fade_factor = 0.9
            else:  # natural
                radius = 40
                fade_factor = 0.8
            
            # Create blush mask
            mask = np.zeros(image.shape[:2], dtype=np.float32)
            
            for y in range(max(0, int(center_y - radius)), min(height, int(center_y + radius))):
                for x in range(max(0, int(center_x - radius)), min(width, int(center_x + radius))):
                    distance = np.sqrt((x - center_x)**2 + (y - center_y)**2)
                    if distance <= radius:
                        mask[y, x] = max(0, (1 - distance / radius) ** fade_factor)
            
            # Apply blush color
            for i in range(3):
                result[:, :, i] = (result[:, :, i] * (1 - mask * intensity) + 
                                 color_rgb[i] * mask * intensity)
        
        return np.clip(result, 0, 255).astype(np.uint8)
    
    def apply_foundation(self, image, landmarks, settings):
        """Apply foundation with specified settings"""
        height, width = image.shape[:2]
        color_rgb = self.hex_to_rgb(settings['color'])
        intensity = settings['intensity']
        
        # Get face points
        face_points = []
        for idx in self.face_landmarks['face_oval']:
            if idx < len(landmarks.landmark):
                x = int(landmarks.landmark[idx].x * width)
                y = int(landmarks.landmark[idx].y * height)
                face_points.append([x, y])
        
        if len(face_points) < 3:
            return image
        
        # Adjust intensity based on coverage
        coverage_multiplier = {
            'light': 0.5,
            'medium': 1.0,
            'full': 1.5,
            'heavy': 2.0
        }
        
        adjusted_intensity = intensity * coverage_multiplier.get(settings['coverage'], 1.0)
        
        # Create face mask
        mask = self.create_smooth_mask(image.shape, face_points, blur_radius=20)
        
        # Apply foundation
        result = image.copy().astype(np.float32)
        for i in range(3):
            result[:, :, i] = (result[:, :, i] * (1 - mask * adjusted_intensity) + 
                             color_rgb[i] * mask * adjusted_intensity)
        
        return np.clip(result, 0, 255).astype(np.uint8)
    
    def apply_eyeliner(self, image, landmarks, settings):
        """Apply eyeliner with specified settings"""
        height, width = image.shape[:2]
        color_rgb = self.hex_to_rgb(settings['color'])
        thickness = settings['thickness']
        result = image.copy()
        
        # Apply to both eyes
        for eye_side in ['left', 'right']:
            if eye_side == 'left':
                eye_points_upper = self.face_landmarks['left_eye_upper']
            else:
                eye_points_upper = self.face_landmarks['right_eye_upper']
            
            eye_line_points = []
            for idx in eye_points_upper:
                if idx < len(landmarks.landmark):
                    x = int(landmarks.landmark[idx].x * width)
                    y = int(landmarks.landmark[idx].y * height)
                    eye_line_points.append((x, y))
            
            if len(eye_line_points) < 2:
                continue
            
            # Draw eyeliner based on style
            if settings['style'] == 'winged':
                self.draw_winged_eyeliner(result, eye_line_points, color_rgb, thickness)
            elif settings['style'] == 'dramatic':
                self.draw_dramatic_eyeliner(result, eye_line_points, color_rgb, thickness * 2)
            else:  # classic
                self.draw_classic_eyeliner(result, eye_line_points, color_rgb, thickness)
        
        return result
    
    def draw_classic_eyeliner(self, image, points, color, thickness):
        """Draw classic eyeliner"""
        for i in range(len(points) - 1):
            cv2.line(image, points[i], points[i + 1], color, thickness)
    
    def draw_winged_eyeliner(self, image, points, color, thickness):
        """Draw winged eyeliner"""
        self.draw_classic_eyeliner(image, points, color, thickness)
        
        if len(points) >= 2:
            outer_point = points[-1]
            wing_end = (outer_point[0] + 15, outer_point[1] - 8)
            cv2.line(image, outer_point, wing_end, color, thickness)
            
            if len(points) >= 3:
                wing_connect = points[-2]
                cv2.line(image, wing_connect, wing_end, color, thickness)
    
    def draw_dramatic_eyeliner(self, image, points, color, thickness):
        """Draw dramatic thick eyeliner"""
        for offset in range(-thickness//2, thickness//2 + 1):
            adjusted_points = [(x, y + offset) for x, y in points]
            self.draw_classic_eyeliner(image, adjusted_points, color, 1)
    
    def apply_eyebrow_enhancement(self, image, landmarks, settings):
        """Apply eyebrow enhancement"""
        height, width = image.shape[:2]
        color_rgb = self.hex_to_rgb(settings['color'])
        intensity = settings['intensity']
        result = image.copy().astype(np.float32)
        
        # Apply to both eyebrows
        for brow_side in ['left', 'right']:
            brow_landmarks = f'{brow_side}_eyebrow'
            
            brow_points = []
            for idx in self.face_landmarks[brow_landmarks]:
                if idx < len(landmarks.landmark):
                    x = int(landmarks.landmark[idx].x * width)
                    y = int(landmarks.landmark[idx].y * height)
                    brow_points.append([x, y])
            
            if len(brow_points) < 3:
                continue
            
            # Create eyebrow mask based on style
            if settings['style'] == 'bold':
                mask = self.create_smooth_mask(image.shape, brow_points, blur_radius=3, fade_factor=0.6)
                intensity_multiplier = 1.5
            elif settings['style'] == 'defined':
                mask = self.create_smooth_mask(image.shape, brow_points, blur_radius=2, fade_factor=0.7)
                intensity_multiplier = 1.2
            else:  # natural
                mask = self.create_smooth_mask(image.shape, brow_points, blur_radius=4, fade_factor=0.8)
                intensity_multiplier = 1.0
            
            # Apply eyebrow color
            adjusted_intensity = intensity * intensity_multiplier
            for i in range(3):
                result[:, :, i] = (result[:, :, i] * (1 - mask * adjusted_intensity) + 
                                 color_rgb[i] * mask * adjusted_intensity)
        
        return np.clip(result, 0, 255).astype(np.uint8)
    
    def transform_image(self, image_data, style_name, look_id="default"):
        """Transform image with specified makeup style"""
        try:
            # Decode image
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
            face_results = self.face_mesh.process(rgb_image)
            
            if not face_results.multi_face_landmarks:
                return {
                    "success": False,
                    "error": "No face detected in the image"
                }
            
            landmarks = face_results.multi_face_landmarks[0]
            result_image = image_bgr.copy()
            
            # Get makeup style
            if style_name not in self.makeup_styles:
                style_name = "natural"  # Default fallback
            
            style = self.makeup_styles[style_name]
            
            # Apply makeup in proper order
            makeup_order = ['foundation', 'blush', 'eyeshadow', 'eyeliner', 'eyebrow', 'lipstick']
            applied_makeup = []
            
            for makeup_type in makeup_order:
                if makeup_type in style:
                    settings = style[makeup_type]
                    
                    if makeup_type == 'lipstick':
                        result_image = self.apply_lipstick(result_image, landmarks, settings)
                    elif makeup_type == 'eyeshadow':
                        result_image = self.apply_eyeshadow(result_image, landmarks, settings)
                    elif makeup_type == 'blush':
                        result_image = self.apply_blush(result_image, landmarks, settings)
                    elif makeup_type == 'foundation':
                        result_image = self.apply_foundation(result_image, landmarks, settings)
                    elif makeup_type == 'eyeliner':
                        result_image = self.apply_eyeliner(result_image, landmarks, settings)
                    elif makeup_type == 'eyebrow':
                        result_image = self.apply_eyebrow_enhancement(result_image, landmarks, settings)
                    
                    applied_makeup.append(makeup_type)
            
            # Convert back to RGB
            result_rgb = cv2.cvtColor(result_image, cv2.COLOR_BGR2RGB)
            
            # Convert to base64
            result_pil = Image.fromarray(result_rgb)
            buffer = BytesIO()
            result_pil.save(buffer, format='JPEG', quality=90)
            result_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            return {
                "success": True,
                "original_image": image_data,
                "transformed_image": f"data:image/jpeg;base64,{result_base64}",
                "style_applied": style_name,
                "style_name": style['name'],
                "makeup_applied": applied_makeup,
                "landmarks_detected": len(landmarks.landmark),
                "processing_time": time.time()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Transformation failed: {str(e)}"
            }

# Main execution
if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Insufficient arguments provided"}))
        sys.exit(1)
    
    try:
        image_data = sys.argv[1]
        style_data = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
        look_id = sys.argv[3] if len(sys.argv) > 3 else "default"
        
        # Extract style name from style_data or use look_id
        style_name = style_data.get('style', look_id.lower())
        
        engine = MakeupTransformationEngine()
        result = engine.transform_image(image_data, style_name, look_id)
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": f"Script execution failed: {str(e)}"}))
