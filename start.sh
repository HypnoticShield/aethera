#!/bin/bash

echo "Starting Minikube..."
minikube start

# Wait a few seconds for the Kubernetes API server to fully stabilize before enabling addons
echo "Waiting for API server to stabilize..."
sleep 15

echo "Enabling Ingress addon..."
minikube addons enable ingress

echo "Configuring docker env for minikube..."
eval $(minikube docker-env)

echo "Building Docker images inside Minikube..."
docker build -t auth-service:latest ./auth-service
docker build -t content-service:latest ./content-service
docker build -t subscription-service:latest ./subscription-service
docker build -t streaming-service:latest ./streaming-service
docker build -t recommendation-service:latest ./recommendation-service

echo "Applying Kubernetes manifests..."
kubectl apply -f k8s/deployments.yaml
kubectl apply -f k8s/ingress.yaml

echo "Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod --all --timeout=60s

echo "Your API Gateway is now running on Minikube!"
echo "To expose this to Vercel via Ngrok, run the following in another terminal:"
echo "    minikube tunnel"
echo "    ngrok http 80"
echo ""
echo "========================================================"
echo "Backend is successfully running on Minikube!"
echo "Make sure 'minikube tunnel' and 'ngrok http 80' are running."
echo "You can now access your live frontend on Vercel!"
echo "========================================================"
