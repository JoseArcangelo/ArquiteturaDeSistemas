# GET /users
curl -Method GET "http://localhost:8000/users"

# POST /users
curl -Method POST "http://localhost:8000/users" -Headers @{ "Content-Type"="application/json" } -Body '{ "name": "João Silva", "email": "loaloa@example.com" }'

# GET /products
curl -Method GET "http://localhost:8000/products"

# POST /products  
curl -Method POST "http://localhost:8000/products" -Headers @{ "Content-Type"="application/json" } -Body '{ "name": "celta", "price": 16000, "stock": 1 }'

# GET /products/1
curl -Method GET "http://localhost:8000/products/1"

# PATCH /products/2/stock
curl -Method PATCH "http://localhost:8000/products/1/stock" -Headers @{ "Content-Type"="application/json" } -Body '{ "stock": 11 }'

# PATCH /products/4
curl -Method PATCH "http://localhost:8000/products/1" -Headers @{ "Content-Type"="application/json" } -Body '{ "price": 50 }'

# POST /orders
curl -Method POST "http://localhost:8000/orders" -Headers @{ "Content-Type"="application/json" } -Body '{ "userId": 1, "products": [ { "productId": 1, "quantity": 1, "price": 50 } ], "paymentMethod": "credit_card" }'

# GET /orders/1
curl -Method GET "http://localhost:8000/orders/id-order"
