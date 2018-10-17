#!/bin/bash

TMPPATH="/usr/local/xmatters/integrationagent-5.1.7/integrationservices/applications/nagios/"

if [ -z "$1" ]; then
   echo "no command provided"
   exit 0
fi

if [ -z "$2" ]; then
   echo "no command file specified"
   exit 0
fi

echo $1 > $TMPPATH/tmp.txt
echo $2 >> $TMPPATH/tmp.txt
/usr/bin/printf "$1" > $2 
echo $1
