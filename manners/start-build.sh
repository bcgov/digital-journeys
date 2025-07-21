
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
