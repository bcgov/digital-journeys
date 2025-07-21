
#!/bin/bash

# Define variables
BUILD_NAME="digital-journeys-content-sanitiser"
TEMP_DIR=$(mktemp -d)

# Copy files excluding ./venv
rsync -av \
  --exclude='venv' \
  --exclude='__pycache__' \
  --exclude='.env' \
  --exclude='start-build.sh' \
  --exclude='data' \
  --exclude='reports' \
  ./ "$TEMP_DIR"

# Start the OpenShift build
oc start-build "$BUILD_NAME" --from-dir="$TEMP_DIR" --follow

# Optional: Clean up the temporary directory
rm -rf "$TEMP_DIR"

echo "\n\n===========\n\n"

BUILD_POD=$(oc get pods -o wide | grep "$BUILD_NAME" | grep "build" | awk '{print $1}')

STATUS=$(oc logs -f "$BUILD_POD" -c "docker-build" | grep 'Successfully pushed ')

if [[ -z "$STATUS" ]]; then
  echo "Build failed or did not push successfully."
  exit 1
fi

IMAGE_NAME=$(echo "$STATUS" | awk -F' ' '{print $3}')
echo "Build successful. Image pushed: $IMAGE_NAME"

oc tag "$IMAGE_NAME" "d89793-dev/$BUILD_NAME:latest"
oc delete pod "$BUILD_POD"