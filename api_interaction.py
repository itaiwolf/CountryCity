import http.client

def get_fun_facts(country):
    # Replace these values with your actual RapidAPI key and host
    rapidapi_key = "YOUR_RAPIDAPI_KEY"
    rapidapi_host = "YOUR_RAPIDAPI_HOST"

    # Replace 'YOUR_API_ENDPOINT' with the actual endpoint you want to access
    api_endpoint = "/get_fun_facts"

    # Construct the request URL
    request_url = f"{api_endpoint}?country={country}"

    # Create an HTTP connection to the RapidAPI host
    connection = http.client.HTTPSConnection(rapidapi_host)

    try:
        # Send a GET request to the API endpoint
        connection.request("GET", request_url, headers={"X-RapidAPI-Key": rapidapi_key})

        # Get the response from the server
        response = connection.getresponse()

        # Check if the request was successful (status code 200)
        if response.status == 200:
            # Read the response data
            data = response.read()

            # Process the response data (e.g., parse JSON)
            # Replace this with your actual response handling logic
            print(data.decode("utf-8"))
        else:
            print(f"Error: {response.status} - {response.reason}")

    except Exception as e:
        print(f"Error: {e}")

    finally:
        # Close the connection
        connection.close()

# Example usage:
get_fun_facts("France")
