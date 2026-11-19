from PIL import Image, ImageDraw

def create_icon(size, filename):
    img = Image.new('RGBA', (size, size), color=(255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw a blue circle
    padding = size // 8
    draw.ellipse([padding, padding, size - padding, size - padding], fill=(45, 82, 162))
    
    # Draw a white 'T' or globe symbol
    # Let's draw a simple globe-like grid or just 'A'
    font_size = size // 2
    # Since I don't want to deal with fonts, I'll draw lines
    center = size // 2
    draw.line([center, padding*2, center, size-padding*2], fill="white", width=size//16)
    draw.line([padding*2, center, size-padding*2, center], fill="white", width=size//16)
    
    img.save(filename)

create_icon(16, 'tradutor-agil/icons/icon16.png')
create_icon(48, 'tradutor-agil/icons/icon48.png')
create_icon(128, 'tradutor-agil/icons/icon128.png')
