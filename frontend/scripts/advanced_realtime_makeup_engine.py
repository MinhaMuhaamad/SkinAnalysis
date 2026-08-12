import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
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

class AdvancedRealtimeMakeupEngine:
    def __init__(self):
        # Initialize MediaPipe solutions
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_hands = mp.solutions.hands
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        # Initialize face mesh with high precision
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.8,
            min_tracking_confidence=0.7
        )
        
        # Initialize hand tracking for gesture control
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        
        # Initialize pose detection
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        
        # Face landmark indices for makeup application
        self.face_landmarks = {
            # Lips - more precise mapping
            'lips_outer': [61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318, 
                          78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415],
            'lips_upper': [61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318],
            'lips_lower': [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415],
            'lips_inner': [13, 82, 81, 80, 78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13],
            
            # Eyes - detailed mapping
            'left_eye_upper': [27, 28, 29, 30, 247, 30, 29, 27, 28],
            'left_eye_lower': [23, 24, 25, 26, 110, 24, 23],
            'left_eye_full': [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
            'right_eye_upper': [257, 258, 259, 260, 467, 260, 259, 257, 258],
            'right_eye_lower': [253, 254, 255, 256, 339, 254, 253],
            'right_eye_full': [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],
            
            # Eyebrows - enhanced precision
            'left_eyebrow': [46, 53, 52, 51, 48, 115, 131, 134, 102, 49, 220, 305],
            'right_eyebrow': [276, 283, 282, 281, 278, 344, 360, 363, 331, 279, 440, 75],
            
            # Cheeks - expanded area
            'left_cheek': [116, 117, 118, 119, 120, 121, 126, 142, 36, 205, 206, 207, 213, 192, 147, 187, 123, 147, 213, 192, 147],
            'right_cheek': [345, 346, 347, 348, 349, 350, 355, 371, 266, 425, 426, 427, 436, 416, 376, 411, 352, 376, 436, 416, 376],
            
            # Face contour and foundation
            'face_oval': [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 
                         397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 
                         172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109],
            
            # Forehead
            'forehead': [10, 151, 9, 10, 151, 9, 67, 109, 10, 151, 54, 103, 67, 109, 10, 151, 
                        103, 67, 109, 10, 151, 9, 10, 151, 9, 67, 109],
            
            # Nose
            'nose_bridge': [6, 51, 115, 131, 134, 102, 49, 220, 305, 281, 275, 274, 5, 4, 1, 19, 94, 125],
            'nose_tip': [1, 2, 5, 4, 6, 19, 20, 94, 125, 141, 235, 236, 3, 51, 48],
            'nose_wings': [131, 134, 102, 49, 220, 305, 281, 275, 274, 360, 363, 331],
            
            # Chin and jawline
            'chin': [18, 175, 199, 200, 9, 10, 151, 175, 199, 200, 9, 10, 151],
            'jawline': [172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361, 323]
        }
        
        # Comprehensive makeup color palettes
        self.makeup_palettes = {
            'lipstick': {
                # Reds
                'classic_red': '#DC143C',
                'cherry_red': '#B22222',
                'wine_red': '#722F37',
                'ruby_red': '#E0115F',
                'crimson': '#DC143C',
                'burgundy': '#800020',
                'matte_red': '#8B0000',
                'fire_red': '#FF2D00',
                
                # Pinks
                'rose_pink': '#FF69B4',
                'coral_pink': '#FF7F50',
                'nude_pink': '#F8BBD9',
                'hot_pink': '#FF1493',
                'baby_pink': '#F8BBD9',
                'dusty_rose': '#DCAE96',
                'mauve_pink': '#E0B0FF',
                'fuchsia': '#FF00FF',
                
                # Berries
                'deep_berry': '#8B008B',
                'plum_berry': '#DDA0DD',
                'blackberry': '#4B0082',
                'raspberry': '#E30B5C',
                'mulberry': '#C54B8C',
                
                # Oranges and Corals
                'coral_orange': '#FF6347',
                'peach': '#FFCBA4',
                'tangerine': '#FF8C00',
                'sunset_orange': '#FF4500',
                
                # Nudes and Browns
                'nude_brown': '#D2691E',
                'caramel': '#C68E17',
                'chocolate': '#7B3F00',
                'mocha': '#967117',
                'taupe': '#483C32',
                
                # Purples
                'purple_mauve': '#9370DB',
                'lavender': '#E6E6FA',
                'violet': '#8A2BE2',
                'grape': '#6F2DA8'
            },
            
            'eyeshadow': {
                # Neutrals
                'champagne': '#F7E7CE',
                'vanilla': '#F3E5AB',
                'cream': '#FFFDD0',
                'ivory': '#FFFFF0',
                'pearl': '#EAE0C8',
                
                # Browns
                'light_brown': '#CD853F',
                'medium_brown': '#8B4513',
                'dark_brown': '#654321',
                'chocolate': '#7B3F00',
                'espresso': '#6F4E37',
                'mahogany': '#C04000',
                'chestnut': '#954535',
                'coffee': '#6F4E37',
                
                # Metallics
                'gold': '#FFD700',
                'rose_gold': '#E8B4A0',
                'bronze': '#CD7F32',
                'copper': '#B87333',
                'silver': '#C0C0C0',
                'platinum': '#E5E4E2',
                'pewter': '#96A8A1',
                
                # Colors
                'purple_smoky': '#663399',
                'navy_blue': '#000080',
                'emerald_green': '#50C878',
                'forest_green': '#228B22',
                'royal_blue': '#4169E1',
                'teal': '#008080',
                'burgundy': '#800020',
                'plum': '#8E4585',
                
                # Dramatic
                'black_smoky': '#2F2F2F',
                'charcoal': '#36454F',
                'slate': '#708090',
                'gunmetal': '#2C3539'
            },
            
            'blush': {
                # Pinks
                'natural_pink': '#FFB6C1',
                'rose_pink': '#FF69B4',
                'baby_pink': '#F8BBD9',
                'hot_pink': '#FF1493',
                'dusty_pink': '#DCAE96',
                'mauve_pink': '#E0B0FF',
                
                # Corals
                'coral_warm': '#FF7F50',
                'peach_coral': '#FFCBA4',
                'salmon': '#FA8072',
                'coral_pink': '#F88379',
                
                # Peaches
                'peach_soft': '#FFCCCB',
                'apricot_glow': '#FBCEB1',
                'peach_cream': '#FFCC9C',
                'cantaloupe': '#FFA366',
                
                # Berries
                'berry_bold': '#DC143C',
                'raspberry': '#E30B5C',
                'cranberry': '#DB5079',
                'wine_berry': '#722F37',
                
                # Bronzes
                'bronze_sun': '#CD7F32',
                'golden_bronze': '#CD853F',
                'copper_glow': '#B87333',
                'terracotta': '#E2725B'
            },
            
            'foundation': {
                # Fair tones
                'porcelain': '#F5E6D3',
                'ivory': '#FFFFF0',
                'alabaster': '#F2F0E6',
                'fair_neutral': '#F7E7CE',
                'fair_pink': '#F8E8E7',
                'fair_yellow': '#F5E6A3',
                
                # Light tones
                'light_beige': '#F5F5DC',
                'light_neutral': '#E8C5A0',
                'light_pink': '#F0D0C4',
                'light_yellow': '#F0E68C',
                'vanilla': '#F3E5AB',
                
                # Medium tones
                'medium_beige': '#D2B48C',
                'medium_neutral': '#D4A574',
                'medium_pink': '#E8B4A0',
                'medium_yellow': '#DAA520',
                'honey': '#D2691E',
                'caramel': '#C68E17',
                
                # Tan tones
                'tan_light': '#D2B48C',
                'tan_medium': '#CD853F',
                'tan_dark': '#A0522D',
                'golden_tan': '#B8860B',
                
                # Deep tones
                'bronze_light': '#CD853F',
                'bronze_medium': '#A0522D',
                'bronze_deep': '#8B4513',
                'cocoa': '#875A3A',
                'mahogany': '#C04000',
                'chestnut': '#954535',
                'espresso': '#6F4E37',
                'ebony': '#555D50',
                'deep_brown': '#654321',
                'rich_brown': '#4A4A4A'
            },
            
            'eyeliner': {
                # Classics
                'jet_black': '#000000',
                'soft_black': '#2F2F2F',
                'charcoal': '#36454F',
                'dark_brown': '#654321',
                'medium_brown': '#8B4513',
                'light_brown': '#A0522D',
                
                # Colors
                'navy_blue': '#000080',
                'royal_blue': '#4169E1',
                'electric_blue': '#0080FF',
                'teal': '#008080',
                'emerald_green': '#50C878',
                'forest_green': '#228B22',
                'purple_plum': '#8B008B',
                'violet': '#8A2BE2',
                'burgundy': '#800020',
                'wine': '#722F37',
                
                # Metallics
                'gold_metallic': '#FFD700',
                'silver_metallic': '#C0C0C0',
                'bronze_metallic': '#CD7F32',
                'copper_metallic': '#B87333',
                'rose_gold': '#E8B4A0'
            },
            
            'eyebrow': {
                # Light shades
                'light_blonde': '#F5DEB3',
                'medium_blonde': '#D2B48C',
                'dark_blonde': '#B8860B',
                'strawberry_blonde': '#FF8C69',
                
                # Brown shades
                'light_brown': '#A0522D',
                'medium_brown': '#8B4513',
                'dark_brown': '#654321',
                'chocolate_brown': '#7B3F00',
                'espresso_brown': '#6F4E37',
                
                # Auburn and red
                'auburn': '#A52A2A',
                'red_brown': '#A0522D',
                'mahogany': '#C04000',
                
                # Black and gray
                'soft_black': '#2F2F2F',
                'jet_black': '#000000',
                'ash_gray': '#708090',
                'silver_gray': '#C0C0C0'
            },
            
            'highlighter': {
                # Champagne tones
                'champagne': '#F7E7CE',
                'golden_champagne': '#F3E5AB',
                'rose_champagne': '#F8E8E7',
                
                # Gold tones
                'gold': '#FFD700',
                'rose_gold': '#E8B4A0',
                'bronze_gold': '#CD853F',
                
                # Pearl tones
                'pearl': '#EAE0C8',
                'ivory_pearl': '#FFFFF0',
                'pink_pearl': '#F8BBD9',
                
                # Unique tones
                'moonstone': '#E6E6FA',
                'opal': '#A8C3BC',
                'holographic': '#E0E6F8'
            },
            
            'contour': {
                # Cool tones
                'cool_light': '#D2B48C',
                'cool_medium': '#A0522D',
                'cool_dark': '#8B4513',
                
                # Warm tones
                'warm_light': '#CD853F',
                'warm_medium': '#B8860B',
                'warm_dark': '#A0522D',
                
                # Neutral tones
                'neutral_light': '#D4A574',
                'neutral_medium': '#C68E17',
                'neutral_dark': '#954535',
                
                # Deep tones
                'deep_bronze': '#8B4513',
                'deep_brown': '#654321',
                'deep_espresso': '#6F4E37'
            }
        }
        
        # Gesture recognition patterns
        self.gesture_patterns = {
            'peace_sign': self.detect_peace_sign,
            'thumbs_up': self.detect_thumbs_up,
            'open_palm': self.detect_open_palm,
            'pointing': self.detect_pointing,
            'fist': self.detect_fist
        }
        
        # Performance optimization
        self.frame_skip = 2  # Process every 2nd frame for better performance
        self.frame_count = 0
        
    def detect_peace_sign(self, hand_landmarks):
        """Detect peace sign gesture"""
        if not hand_landmarks:
            return False
        
        # Get landmark positions
        landmarks = hand_landmarks.landmark
        
        # Check if index and middle fingers are extended
        index_tip = landmarks[8]
        index_pip = landmarks[6]
        middle_tip = landmarks[12]
        middle_pip = landmarks[10]
        ring_tip = landmarks[16]
        pinky_tip = landmarks[20]
        
        # Index and middle fingers should be up, others down
        index_up = index_tip.y < index_pip.y
        middle_up = middle_tip.y < middle_pip.y
        ring_down = ring_tip.y > landmarks[14].y
        pinky_down = pinky_tip.y > landmarks[18].y
        
        return index_up and middle_up and ring_down and pinky_down
    
    def detect_thumbs_up(self, hand_landmarks):
        """Detect thumbs up gesture"""
        if not hand_landmarks:
            return False
        
        landmarks = hand_landmarks.landmark
        thumb_tip = landmarks[4]
        thumb_ip = landmarks[3]
        index_tip = landmarks[8]
        
        # Thumb should be up, other fingers down
        thumb_up = thumb_tip.y < thumb_ip.y
        fingers_down = all(landmarks[i].y > landmarks[i-2].y for i in [8, 12, 16, 20])
        
        return thumb_up and fingers_down
    
    def detect_open_palm(self, hand_landmarks):
        """Detect open palm gesture"""
        if not hand_landmarks:
            return False
        
        landmarks = hand_landmarks.landmark
        
        # All fingers should be extended
        fingers_extended = all(
            landmarks[tip].y < landmarks[pip].y 
            for tip, pip in [(8, 6), (12, 10), (16, 14), (20, 18)]
        )
        
        thumb_extended = landmarks[4].x > landmarks[3].x  # Assuming right hand
        
        return fingers_extended and thumb_extended
    
    def detect_pointing(self, hand_landmarks):
        """Detect pointing gesture"""
        if not hand_landmarks:
            return False
        
        landmarks = hand_landmarks.landmark
        
        # Only index finger extended
        index_up = landmarks[8].y < landmarks[6].y
        other_fingers_down = all(
            landmarks[tip].y > landmarks[pip].y 
            for tip, pip in [(12, 10), (16, 14), (20, 18)]
        )
        
        return index_up and other_fingers_down
    
    def detect_fist(self, hand_landmarks):
        """Detect fist gesture"""
        if not hand_landmarks:
            return False
        
        landmarks = hand_landmarks.landmark
        
        # All fingers should be curled
        fingers_curled = all(
            landmarks[tip].y > landmarks[pip].y 
            for tip, pip in [(8, 6), (12, 10), (16, 14), (20, 18)]
        )
        
        return fingers_curled
    
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
    
    def apply_advanced_lipstick(self, image, landmarks, color_hex, intensity=0.8, finish='matte'):
        """Apply advanced lipstick with different finishes"""
        height, width = image.shape[:2]
        color_rgb = self.hex_to_rgb(color_hex)
        
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
        
        # Apply different finishes
        result = image.copy().astype(np.float32)
        
        if finish == 'glossy':
            # Add shine effect
            highlight_mask = mask * 0.3
            for i in range(3):
                result[:, :, i] = (result[:, :, i] * (1 - mask * intensity) + 
                                 color_rgb[i] * mask * intensity +
                                 255 * highlight_mask)
        elif finish == 'metallic':
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
    
    def apply_advanced_eyeshadow(self, image, landmarks, colors, intensity=0.6, blend_mode='gradient'):
        """Apply advanced eyeshadow with multiple colors and blending"""
        height, width = image.shape[:2]
        result = image.copy().astype(np.float32)
        
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
            
            # Calculate eye center and dimensions
            eye_points = np.array(eye_points)
            center_x = np.mean(eye_points[:, 0])
            center_y = np.mean(eye_points[:, 1])
            
            # Create eyeshadow regions
            if blend_mode == 'gradient':
                self.apply_gradient_eyeshadow(result, center_x, center_y, colors, intensity)
            elif blend_mode == 'smoky':
                self.apply_smoky_eyeshadow(result, center_x, center_y, colors, intensity)
            else:
                self.apply_simple_eyeshadow(result, center_x, center_y, colors[0], intensity)
        
        return np.clip(result, 0, 255).astype(np.uint8)
    
    def apply_gradient_eyeshadow(self, image, center_x, center_y, colors, intensity):
        """Apply gradient eyeshadow effect"""
        height, width = image.shape[:2]
        
        # Create gradient zones
        for y in range(max(0, int(center_y - 50)), min(height, int(center_y + 20))):
            for x in range(max(0, int(center_x - 60)), min(width, int(center_x + 60))):
                # Calculate distance and angle
                dx = x - center_x
                dy = y - center_y + 15  # Shift up for eyeshadow area
                distance = np.sqrt(dx*dx + dy*dy)
                
                if distance <= 50:
                    # Determine color based on position
                    if len(colors) >= 3:
                        if distance < 15:
                            color = self.hex_to_rgb(colors[0])  # Inner color
                        elif distance < 30:
                            color = self.hex_to_rgb(colors[1])  # Middle color
                        else:
                            color = self.hex_to_rgb(colors[2])  # Outer color
                    else:
                        color = self.hex_to_rgb(colors[0])
                    
                    # Calculate alpha based on distance
                    alpha = max(0, (1 - distance / 50) * intensity)
                    if y < center_y:  # More intensity above eye
                        alpha *= 1.3
                    
                    # Blend colors
                    for i in range(3):
                        image[y, x, i] = (image[y, x, i] * (1 - alpha) + 
                                        color[i] * alpha)
    
    def apply_smoky_eyeshadow(self, image, center_x, center_y, colors, intensity):
        """Apply smoky eyeshadow effect"""
        height, width = image.shape[:2]
        dark_color = self.hex_to_rgb(colors[-1])  # Use darkest color
        
        # Create smoky effect with multiple layers
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
    
    def apply_advanced_blush(self, image, landmarks, color_hex, intensity=0.4, style='natural'):
        """Apply advanced blush with different styles"""
        height, width = image.shape[:2]
        color_rgb = self.hex_to_rgb(color_hex)
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
            
            if style == 'dramatic':
                radius = 50
                fade_factor = 0.6
            elif style == 'subtle':
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
    
    def apply_foundation_with_coverage(self, image, landmarks, color_hex, intensity=0.3, coverage='medium'):
        """Apply foundation with different coverage levels"""
        height, width = image.shape[:2]
        color_rgb = self.hex_to_rgb(color_hex)
        
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
        
        adjusted_intensity = intensity * coverage_multiplier.get(coverage, 1.0)
        
        # Create face mask
        mask = self.create_smooth_mask(image.shape, face_points, blur_radius=20)
        
        # Apply foundation
        result = image.copy().astype(np.float32)
        for i in range(3):
            result[:, :, i] = (result[:, :, i] * (1 - mask * adjusted_intensity) + 
                             color_rgb[i] * mask * adjusted_intensity)
        
        return np.clip(result, 0, 255).astype(np.uint8)
    
    def apply_precise_eyeliner(self, image, landmarks, color_hex, intensity=0.9, thickness=2, style='classic'):
        """Apply precise eyeliner with different styles"""
        height, width = image.shape[:2]
        color_rgb = self.hex_to_rgb(color_hex)
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
            if style == 'winged':
                self.draw_winged_eyeliner(result, eye_line_points, color_rgb, thickness)
            elif style == 'dramatic':
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
        # Draw main line
        self.draw_classic_eyeliner(image, points, color, thickness)
        
        # Add wing
        if len(points) >= 2:
            outer_point = points[-1]
            wing_end = (outer_point[0] + 15, outer_point[1] - 8)
            cv2.line(image, outer_point, wing_end, color, thickness)
            
            # Connect wing
            if len(points) >= 3:
                wing_connect = points[-2]
                cv2.line(image, wing_connect, wing_end, color, thickness)
    
    def draw_dramatic_eyeliner(self, image, points, color, thickness):
        """Draw dramatic thick eyeliner"""
        # Create thick line by drawing multiple lines
        for offset in range(-thickness//2, thickness//2 + 1):
            adjusted_points = [(x, y + offset) for x, y in points]
            self.draw_classic_eyeliner(image, adjusted_points, color, 1)
    
    def apply_eyebrow_definition(self, image, landmarks, color_hex, intensity=0.5, style='natural'):
        """Apply eyebrow enhancement with different styles"""
        height, width = image.shape[:2]
        color_rgb = self.hex_to_rgb(color_hex)
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
            if style == 'bold':
                mask = self.create_smooth_mask(image.shape, brow_points, blur_radius=3, fade_factor=0.6)
                intensity_multiplier = 1.5
            elif style == 'defined':
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
    
    def apply_highlighter(self, image, landmarks, color_hex, intensity=0.4):
        """Apply highlighter to key facial features"""
        height, width = image.shape[:2]
        color_rgb = self.hex_to_rgb(color_hex)
        result = image.copy().astype(np.float32)
        
        # Highlight areas: cheekbones, nose bridge, forehead, chin
        highlight_areas = [
            ('left_cheek', 0.3),
            ('right_cheek', 0.3),
            ('nose_bridge', 0.2),
            ('forehead', 0.15),
            ('chin', 0.2)
        ]
        
        for area, area_intensity in highlight_areas:
            if area in self.face_landmarks:
                points = []
                for idx in self.face_landmarks[area]:
                    if idx < len(landmarks.landmark):
                        x = int(landmarks.landmark[idx].x * width)
                        y = int(landmarks.landmark[idx].y * height)
                        points.append([x, y])
                
                if len(points) >= 3:
                    # Create highlight mask
                    mask = self.create_smooth_mask(image.shape, points, blur_radius=10, fade_factor=0.9)
                    
                    # Apply highlight
                    highlight_intensity = intensity * area_intensity
                    for i in range(3):
                        result[:, :, i] = np.minimum(255, 
                                                   result[:, :, i] + color_rgb[i] * mask * highlight_intensity)
        
        return np.clip(result, 0, 255).astype(np.uint8)
    
    def apply_contour(self, image, landmarks, color_hex, intensity=0.3):
        """Apply contouring to define facial structure"""
        height, width = image.shape[:2]
        color_rgb = self.hex_to_rgb(color_hex)
        result = image.copy().astype(np.float32)
        
        # Contour areas: sides of face, under cheekbones, sides of nose
        contour_areas = [
            ('jawline', 0.4),
            ('nose_wings', 0.3),
        ]
        
        for area, area_intensity in contour_areas:
            if area in self.face_landmarks:
                points = []
                for idx in self.face_landmarks[area]:
                    if idx < len(landmarks.landmark):
                        x = int(landmarks.landmark[idx].x * width)
                        y = int(landmarks.landmark[idx].y * height)
                        points.append([x, y])
                
                if len(points) >= 3:
                    # Create contour mask
                    mask = self.create_smooth_mask(image.shape, points, blur_radius=15, fade_factor=0.8)
                    
                    # Apply contour (darken)
                    contour_intensity = intensity * area_intensity
                    for i in range(3):
                        result[:, :, i] = (result[:, :, i] * (1 + mask * contour_intensity * 0.3) - 
                                         color_rgb[i] * mask * contour_intensity * 0.7)
        
        return np.clip(result, 0, 255).astype(np.uint8)
    
    def detect_gestures(self, image):
        """Detect hand gestures in the image"""
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb_image)
        
        detected_gestures = []
        
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                for gesture_name, gesture_func in self.gesture_patterns.items():
                    if gesture_func(hand_landmarks):
                        detected_gestures.append(gesture_name)
        
        return detected_gestures
    
    def draw_face_landmarks(self, image, landmarks):
        """Draw face landmarks for debugging"""
        height, width = image.shape[:2]
        
        for landmark in landmarks.landmark:
            x = int(landmark.x * width)
            y = int(landmark.y * height)
            cv2.circle(image, (x, y), 1, (0, 255, 0), -1)
        
        return image
    
    def process_realtime_makeup(self, image_data, makeup_settings, show_landmarks=False):
        """Process real-time makeup application with gesture control"""
        try:
            # Skip frames for performance
            self.frame_count += 1
            if self.frame_count % self.frame_skip != 0:
                return {
                    "success": True,
                    "processed_image": image_data,
                    "skipped_frame": True
                }
            
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
            
            # Detect gestures
            detected_gestures = self.detect_gestures(image_bgr)
            
            # Apply makeup in proper order for realistic layering
            makeup_order = [
                'foundation', 'contour', 'highlighter', 'blush', 
                'eyeshadow', 'eyeliner', 'eyebrow', 'lipstick'
            ]
            
            applied_makeup = []
            
            for makeup_type in makeup_order:
                if makeup_type in makeup_settings and makeup_settings[makeup_type].get('enabled', False):
                    settings = makeup_settings[makeup_type]
                    color = settings.get('color', '#FF0000')
                    intensity = settings.get('intensity', 50) / 100.0
                    
                    if makeup_type == 'lipstick':
                        finish = settings.get('finish', 'matte')
                        result_image = self.apply_advanced_lipstick(
                            result_image, landmarks, color, intensity, finish
                        )
                    elif makeup_type == 'eyeshadow':
                        colors = settings.get('colors', [color])
                        blend_mode = settings.get('blend_mode', 'gradient')
                        result_image = self.apply_advanced_eyeshadow(
                            result_image, landmarks, colors, intensity, blend_mode
                        )
                    elif makeup_type == 'blush':
                        style = settings.get('style', 'natural')
                        result_image = self.apply_advanced_blush(
                            result_image, landmarks, color, intensity, style
                        )
                    elif makeup_type == 'foundation':
                        coverage = settings.get('coverage', 'medium')
                        result_image = self.apply_foundation_with_coverage(
                            result_image, landmarks, color, intensity, coverage
                        )
                    elif makeup_type == 'eyeliner':
                        thickness = settings.get('thickness', 2)
                        style = settings.get('style', 'classic')
                        result_image = self.apply_precise_eyeliner(
                            result_image, landmarks, color, intensity, thickness, style
                        )
                    elif makeup_type == 'eyebrow':
                        style = settings.get('style', 'natural')
                        result_image = self.apply_eyebrow_definition(
                            result_image, landmarks, color, intensity, style
                        )
                    elif makeup_type == 'highlighter':
                        result_image = self.apply_highlighter(
                            result_image, landmarks, color, intensity
                        )
                    elif makeup_type == 'contour':
                        result_image = self.apply_contour(
                            result_image, landmarks, color, intensity
                        )
                    
                    applied_makeup.append(makeup_type)
            
            # Draw landmarks if requested
            if show_landmarks:
                result_image = self.draw_face_landmarks(result_image, landmarks)
            
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
                "makeup_applied": applied_makeup,
                "detected_gestures": detected_gestures,
                "processing_time": time.time()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Makeup processing failed: {str(e)}"
            }
    
    def get_available_colors(self):
        """Return all available makeup colors and palettes"""
        return self.makeup_palettes

# Main execution
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image data or settings provided"}))
        sys.exit(1)
    
    try:
        # Parse arguments
        image_data = sys.argv[1]
        makeup_settings = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
        show_landmarks = json.loads(sys.argv[3]) if len(sys.argv) > 3 else False
        
        engine = AdvancedRealtimeMakeupEngine()
        result = engine.process_realtime_makeup(image_data, makeup_settings, show_landmarks)
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": f"Script execution failed: {str(e)}"}))
