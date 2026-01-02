import xml.etree.ElementTree as ET
import sys

def clean_svg(file_path):
    # Keep the SVG namespace consistent
    ET.register_namespace("", "http://www.w3.org/2000/svg")

    try:
        tree = ET.parse(file_path)
        root = tree.getroot()

        # Remove clip-path from every element
        for elem in root.iter():
            if "clip-path" in elem.attrib:
                del elem.attrib["clip-path"]

        # Overwrite the original file
        tree.write(file_path, encoding="utf-8", xml_declaration=True)
        print(f"Successfully cleaned: {file_path}")

    except Exception as e:
        print(f"Error: {e}")

# Example usage with a relative path to a parent folder
clean_svg("../langaraNav/public/Images/A3FloorPlan.svg")