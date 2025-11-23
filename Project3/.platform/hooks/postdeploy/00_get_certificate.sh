#!/usr/bin/env bash
# .platform/hooks/postdeploy/00_get_certificate.sh
sudo certbot -n -d section1group12.us-east-1.elasticbeanstalk.com  --nginx --agree-tos --email allenschultz05@gmail.com