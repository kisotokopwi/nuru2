#!/bin/bash

# Test script for Nuru API endpoints
# Make sure the server is running on port 4000

echo "🚀 Testing Nuru API Endpoints"
echo "=============================="

# Step 1: Login and get token
echo "1. Logging in as admin@test.com..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "test123"
  }')

echo "Login response: $LOGIN_RESPONSE"

# Extract token from response
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get access token"
  exit 1
fi

echo "✅ Got access token: ${TOKEN:0:20}..."

# Step 2: Create a client
echo -e "\n2. Creating a test client..."
CLIENT_RESPONSE=$(curl -s -X POST http://localhost:4000/admin/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Client Ltd",
    "email": "client@test.com",
    "phone": "+255123456789",
    "address": "Dar es Salaam, Tanzania"
  }')

echo "Client response: $CLIENT_RESPONSE"

# Extract client ID from response
CLIENT_ID=$(echo $CLIENT_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$CLIENT_ID" ]; then
  echo "❌ Failed to get client ID"
  exit 1
fi

echo "✅ Got client ID: $CLIENT_ID"

# Step 3: Create a project using the client ID
echo -e "\n3. Creating a project for client $CLIENT_ID..."
PROJECT_RESPONSE=$(curl -s -X POST http://localhost:4000/admin/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"clientId\": \"$CLIENT_ID\",
    \"name\": \"Warehouse Operations Project\",
    \"startDate\": \"2025-01-01\",
    \"endDate\": \"2025-12-31\"
  }")

echo "Project response: $PROJECT_RESPONSE"

# Extract project ID from response
PROJECT_ID=$(echo $PROJECT_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Failed to get project ID"
  exit 1
fi

echo "✅ Got project ID: $PROJECT_ID"

# Step 4: Create a site using the project ID
echo -e "\n4. Creating a site for project $PROJECT_ID..."
SITE_RESPONSE=$(curl -s -X POST http://localhost:4000/admin/sites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"projectId\": \"$PROJECT_ID\",
    \"name\": \"Main Warehouse Site\",
    \"serviceType\": \"WAREHOUSE\",
    \"location\": \"Dar es Salaam Port\"
  }")

echo "Site response: $SITE_RESPONSE"

# Extract site ID from response
SITE_ID=$(echo $SITE_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$SITE_ID" ]; then
  echo "❌ Failed to get site ID"
  exit 1
fi

echo "✅ Got site ID: $SITE_ID"

# Step 5: Test listing endpoints
echo -e "\n5. Testing list endpoints..."

echo "Listing clients:"
curl -s -X GET http://localhost:4000/admin/clients \
  -H "Authorization: Bearer $TOKEN" | jq '.[0] | {id, name, email}'

echo -e "\nListing projects:"
curl -s -X GET http://localhost:4000/admin/projects \
  -H "Authorization: Bearer $TOKEN" | jq '.[0] | {id, name, clientId}'

echo -e "\nListing sites:"
curl -s -X GET http://localhost:4000/admin/sites \
  -H "Authorization: Bearer $TOKEN" | jq '.[0] | {id, name, projectId, serviceType}'

echo -e "\n🎉 All tests completed successfully!"
echo "Created:"
echo "  - Client: $CLIENT_ID"
echo "  - Project: $PROJECT_ID" 
echo "  - Site: $SITE_ID"
