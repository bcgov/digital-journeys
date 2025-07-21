#!/bin/bash

NAMESPACE=d89793-dev
POD_NAME=digital-journeys-content-sanitiser

DOWNLOAD=$1

REPORT_FILE="./data/$DATE.tsv"

if [[ "x$DOWNLOAD" == "xdownload" ]]; then

  INSTANCE=$(oc -n $NAMESPACE get pods | grep $POD_NAME | awk '{print $1}')

  echo "Syncing data from pod $INSTANCE to ./data/"

  oc -n $NAMESPACE rsync $INSTANCE:./data/ ./data/

  echo "Data synced to ./data/"

else

  rsync ../data/* ./data/
fi

echo -e "formName\taction\tcomponentKey\toldValue\tnewValue\treasoning" > "$REPORT_FILE"

for file in ./data/*.json; do
  if [[ -f $file ]]; then
    echo "Processing file: $file"

    cat $file | jq -r '[.formName, .action, .componentKey, .oldValue, .newValue, .reasoning] | @tsv' >> "$REPORT_FILE"

  fi
done

export NLTK_DATA="./nltk_data"

python3 report.py "$REPORT_FILE"

if [ -x "$(command -v ssconvert)" ]; then

    echo "Converting TSV to XLSX"
    ssconvert "$REPORT_FILE" "$DATE.xlsx"
    rm -f "$REPORT_FILE"
    
else
    echo "Could not find ssconvert (brew install gnumeric)"
fi