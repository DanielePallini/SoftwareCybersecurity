#!/bin/bash
killall -INT geth
killall -INT quorum-report
killall constellation-node

if [ "`ps -ef | grep tessera-app.jar | grep -v grep`" != "" ]
then
    ps -ef | grep tessera-app.jar | grep -v grep | awk '{print $2}' | xargs kill
else
    echo "tessera: no process found"
fi

if [ "`ps -ef | grep cakeshop.war | grep -v grep`" != "" ]
then
    ps -ef | grep cakeshop.war | grep -v grep | awk '{print $2}' | xargs kill
else
    echo "cakeshop: no process found"
fi

rm contractaddress.txt
rm contractaddresshash.txt