#!/bin/bash

echo "Configuring docker env for minikube..."
eval $(minikube docker-env)

echo "Rebuilding Docker images with new code..."
docker build -t auth-service:latest ./auth-service
docker build -t content-service:latest ./content-service
docker build -t subscription-service:latest ./subscription-service
docker build -t streaming-service:latest ./streaming-service
docker build -t recommendation-service:latest ./recommendation-service

echo "Restarting Kubernetes pods to pick up the new images..."
kubectl rollout restart deployment auth-deployment
kubectl rollout restart deployment content-deployment
kubectl rollout restart deployment subscription-deployment
kubectl rollout restart deployment streaming-deployment
kubectl rollout restart deployment recommendation-deployment

echo "Done! Your new code is now live on Minikube."
