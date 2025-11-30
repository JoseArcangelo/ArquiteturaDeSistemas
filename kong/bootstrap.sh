#!/bin/sh
set -e

KONG_ADMIN_URL="http://kong-gateway:8001"

echo "Waiting for Kong Admin API..."
until curl -s $KONG_ADMIN_URL/ -o /dev/null; do
  echo "Kong Admin not ready yet..."
  sleep 1
done

echo "Kong Admin is up, applying configuration..."

create_service() {
  name="$1"; url="$2"
  echo "Creating service: $name -> $url"
  curl -s -X POST $KONG_ADMIN_URL/services --data "name=$name" --data "url=$url" || true
}

create_route() {
  svc="$1"; route_name="$2"; path="$3"
  echo "Creating route $route_name for service $svc path $path"
  # create the route requesting strip_path=false so upstream receives the full path
  curl -s -X POST $KONG_ADMIN_URL/services/$svc/routes \
    --data "name=$route_name" \
    --data "paths[]=$path" \
    --data "strip_path=false" \
    --data "methods[]=GET" \
    --data "methods[]=POST" \
    --data "methods[]=PUT" \
    --data "methods[]=DELETE" \
    --data "methods[]=PATCH" || true

  # If a route already exists with this name, ensure strip_path is false (idempotent)
  route_id=$(curl -s "$KONG_ADMIN_URL/routes?name=$route_name" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
  if [ -n "$route_id" ]; then
    echo "Patching existing route $route_id to set strip_path=false"
    curl -s -X PATCH $KONG_ADMIN_URL/routes/$route_id --data "strip_path=false" || true
  fi
}

create_global_plugin() {
  plugin="$1"; shift
  echo "Creating global plugin $plugin"
  curl -s -X POST $KONG_ADMIN_URL/plugins --data "name=$plugin" "$@" || true
}

create_service_plugin() {
  svc="$1"; plugin="$2"; shift 2
  echo "Creating plugin $plugin for service $svc"
  curl -s -X POST $KONG_ADMIN_URL/services/$svc/plugins --data "name=$plugin" "$@" || true
}

# Services and routes
create_service users-service http://users_service:3005
create_route users-service users-route /users

create_service products-service http://products_service:3006
create_route products-service products-route /products

create_service orders-service http://orders_service:3002
create_route orders-service orders-route /orders

create_service payments-service http://payments_service:3007
create_route payments-service payments-route /payments

# Health check route
create_service health-service http://kong-gateway:8001
create_route health-service health-route /health

# Global rate limiting: 10 requests per minute per IP
# Apply rate limiting and request-size limiting per microservice (10 req/min, 200KB)
for svc in users-service products-service orders-service payments-service; do
  create_service_plugin "$svc" rate-limiting --data "config.minute=10" --data "config.policy=local" --data "config.limit_by=ip"
  create_service_plugin "$svc" request-size-limiting --data "config.allowed_payload_size=204800" --data "config.size_unit=bytes"
done

echo "Kong bootstrap finished."

sleep infinity
