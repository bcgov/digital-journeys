import requests
import json

# API endpoint and query
url = "https://analytics-testapi.psa.gov.bc.ca/apiserver/api.rsc/Datamart_Telework_employee_demo?$filter=GUID eq '88F4E39A8DA74C889EB4C4EEE50087A5'"

# Make the GET request
response = requests.get(url, headers={
    "Accept": "application/json",
    "Authorization": "Basic dGVsZXdvcms6bE5RdTRTV21ra1ZnbWpNdWJQWHI="
})

# Print the response
print(response.status_code)

j = json.loads(response.text)
print(json.dumps(j, indent=2))  
