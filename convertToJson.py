import json

def txt_to_json(input_file, output_file):
    # Read the contents of the text file
    with open(input_file, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    # Remove any surrounding whitespace (including newlines) from each line
    items = [line.strip() for line in lines if line.strip()]

    # Convert the list of items to a JSON object
    data = {"items": items}

    # Write the JSON object to the output file
    with open(output_file, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=4)

# Example usage
input_file = 'girlName.txt'  # Replace with your text file name
output_file = 'girlName.json'  # Replace with your desired JSON file name
txt_to_json(input_file, output_file)
