from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import Color

def create_pdf(output_filename, img_path):
    c = canvas.Canvas(output_filename, pagesize=letter)
    width, height = letter
    
    # 1. Fill entire background with the image
    c.drawImage(img_path, 0, 0, width=width, height=height)
    
    # 2. Overlay mattshade.com creatively (sophisticated, lower right)
    c.saveState()
    
    # Sophisticated, smaller typography
    c.setFont("Helvetica", 14)
    
    # Semi-transparent lime/yellow-green to match the site's brand (#bef264)
    overlay_color = Color(0.745, 0.949, 0.392, alpha=0.9)
    link_text = "mattshade.com"
    
    text_width = c.stringWidth(link_text, "Helvetica", 14)
    
    # Lower right corner positioning (margin of 40px)
    x_pos = width - text_width - 40
    y_pos = 40
    
    # Drop shadow
    c.setFillColor(Color(0, 0, 0, alpha=0.8))
    c.drawString(x_pos + 1, y_pos - 1, link_text)
    
    # Text
    c.setFillColor(overlay_color)
    c.drawString(x_pos, y_pos, link_text)
    
    c.restoreState()
    
    # Make the entire page a clickable link to the portfolio
    c.linkURL("https://mattshade.com", (0, 0, width, height), relative=1)
    
    c.save()

if __name__ == "__main__":
    img_path = "/Users/mattshade/.gemini/antigravity/brain/f00472e9-c11b-40fd-9573-b529d63bdf2e/architectural_birds_green_1776737794761.png"
    output_path = "mattshade_architectural_birds.pdf"
    create_pdf(output_path, img_path)
    print("PDF successfully created at", output_path)
