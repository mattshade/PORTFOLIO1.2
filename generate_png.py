from PIL import Image, ImageDraw, ImageFont

def create_png(output_filename, img_path):
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    
    # Determine a sophisticated text size proportional to the image
    font_size = int(height * 0.02) # around 20 for a 1024x1024 image
    
    try:
        # Load Helvetica if available on macOS
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except IOError:
        try:
            font = ImageFont.truetype("Arial.ttf", font_size)
        except IOError:
            font = ImageFont.load_default()

    draw = ImageDraw.Draw(img)
    link_text = "mattshade.com"
    
    # Calculate dimensions
    bbox = draw.textbbox((0, 0), link_text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Lower right placement with a proportional margin
    margin = int(width * 0.05)
    x_pos = width - text_width - margin
    y_pos = height - margin - text_height
    
    # Draw drop shadow (black with alpha 0.8 -> 204)
    shadow_color = (0, 0, 0, 204)
    draw.text((x_pos + 1, y_pos - 1), link_text, font=font, fill=shadow_color)
    draw.text((x_pos + 2, y_pos - 2), link_text, font=font, fill=shadow_color)
    
    # Draw text (#bef264 -> 190, 242, 100 with alpha 0.9 -> 230)
    overlay_color = (190, 242, 100, 230)
    draw.text((x_pos, y_pos), link_text, font=font, fill=overlay_color)
    
    # Save output
    img.save(output_filename, "PNG")

if __name__ == "__main__":
    img_path = "/Users/mattshade/.gemini/antigravity/brain/f00472e9-c11b-40fd-9573-b529d63bdf2e/architectural_birds_green_1776737794761.png"
    output_path = "mattshade_architectural_birds.png"
    create_png(output_path, img_path)
    print("PNG successfully created at", output_path)
