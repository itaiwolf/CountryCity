import chardet

# Path to the file you want to convert
file_path = 'C:/Users/user/Desktop/Country City Project/templates/play.html'

# Detect the encoding of the original file
with open(file_path, 'rb') as file:
    raw_data = file.read()
    result = chardet.detect(raw_data)
    original_encoding = result['encoding']
    print(f"Original encoding: {original_encoding}")

# Read the file using the detected encoding and write it back as UTF-8
with open(file_path, 'r', encoding=original_encoding) as file:
    content = file.read()

with open(file_path, 'w', encoding='utf-8') as file:
    file.write(content)

print(f"File converted from {original_encoding} to UTF-8")
