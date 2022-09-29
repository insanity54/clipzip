#!/bin/bash

cp ./clipzip.service /etc/systemd/system/clipzip.service
systemctl daemon-reload
systemctl restart clipzip
systemctl status clipzip
