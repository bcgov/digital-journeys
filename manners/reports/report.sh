#!/bin/bash

NAMESPACE=d89793-dev
POD_NAME=digital-journeys-content-sanitiser

DATE=$(date +%Y-%m-%d)

DOWNLOAD=$1

REPORT_FILE="./data/$DATE.tsv"

rm -f ./data/*.json

if [[ "$DOWNLOAD" == "download" ]]; then

  INSTANCE=$(oc -n $NAMESPACE get pods | grep $POD_NAME | head -n 1 | awk '{print $1}')

  echo "Syncing data from pod $INSTANCE to ./data/"

  oc -n $NAMESPACE rsync $INSTANCE:./data/ ./data/

  echo "Data synced to ./data/"

else

  rsync ../data/* ./data/
fi


# Original fields
fields=(
    "whatDoYouAppreciateMostAboutNameSLeadershipStyle1"
    "whatAdviceWouldYouGiveToHelpThemBecomeAnEvenBetterLeader"
    "whatIsYourGreatestStrengthAsALeader"
    "whatAdviceWouldYouGiveToHelpThemBecomeAnEvenBetterLeader2"
)

# Suffixes to append
suffixes=("action" "oldValue" "newValue" "reasoning")

# Initialize FIELDS variable
FIELDS=()

# Generate new field names and append to FIELDS
for field in "${fields[@]}"; do
    for suffix in "${suffixes[@]}"; do
        FIELDS+=("${field}_${suffix}")

        JSON_FIELDS+=(".fields.${field}.${suffix}")
    done
done

# Join FIELDS with tab characters
FIELDS_JOINED=$(printf "%s\t" "${FIELDS[@]}")
FIELDS_JOINED=${FIELDS_JOINED%$'\t'}  # Remove trailing tab

JSON_FIELDS_JOINED=$(printf "%s," "${JSON_FIELDS[@]}")
JSON_FIELDS_JOINED=${JSON_FIELDS_JOINED%','}  # Remove trailing comma

# Output the result
echo "$FIELDS_JOINED"
echo "$JSON_FIELDS_JOINED"

echo -e "sub\tdate\tformName\t${FIELDS_JOINED}\temployeeName" > "$REPORT_FILE"

for file in ./data/*.json; do
  if [[ -f $file ]]; then
    echo "Processing file: $file"

    cat $file | jq -r "[.metadata.sub, .metadata.date, .metadata.formName, ${JSON_FIELDS_JOINED}, .etc.employeeName] | @tsv" >> "$REPORT_FILE"

  fi
done

export NLTK_DATA="./nltk_data"

echo "Generating report from $REPORT_FILE"

python3 report.py "$REPORT_FILE"

if [ -x "$(command -v ssconvert)" ]; then

    echo "Converting TSV to XLSX"
    ssconvert "$REPORT_FILE" "$DATE.xlsx"
    rm -f "$REPORT_FILE"
    
else
    echo "Could not find ssconvert (brew install gnumeric)"
fi