
#!/bin/bash

# Define variables
BUILD_NAME="digital-journeys-content-sanitiser"
NAMESPACE="d89793-dev"
TEMP_DIR=$(mktemp -d)

# Copy files excluding ./venv
rsync -av \
  --exclude='venv' \
  --exclude='__pycache__' \
  --exclude='.env' \
  --exclude='start-build.sh' \
  --exclude='data' \
  --exclude='reports' \
  --exclude='superset' \
  ./ "$TEMP_DIR"

# Start the OpenShift build
oc -n "$NAMESPACE" start-build "$BUILD_NAME" --from-dir="$TEMP_DIR" --follow

# Optional: Clean up the temporary directory
rm -rf "$TEMP_DIR"

echo "\n\n===========\n\n"

BUILD_POD=$(oc -n "$NAMESPACE" get pods -o wide | grep "$BUILD_NAME" | grep "build" | awk '{print $1}')

STATUS=$(oc -n "$NAMESPACE" logs -f "$BUILD_POD" -c "docker-build" | grep 'Successfully pushed ')

if [[ -z "$STATUS" ]]; then
  echo "Build failed or did not push successfully."
  exit 1
fi

IMAGE_NAME=$(echo "$STATUS" | awk -F' ' '{print $3}')
echo "Build successful. Image pushed: $IMAGE_NAME"

oc -n "$NAMESPACE" delete pod "$BUILD_POD"

#exit 0

oc -n "$NAMESPACE" tag "$IMAGE_NAME" "$NAMESPACE/$BUILD_NAME:latest"

read -p "Do you want to restart the deployment? (y/n): " restart

if [[ "$restart" == "y" || "$restart" == "Y" ]]; then
  oc -n "$NAMESPACE" rollout restart deployment "$BUILD_NAME"
  echo "Deployment restarted."
else
  echo "Deployment not restarted."
fi