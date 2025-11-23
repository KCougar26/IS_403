#!/usr/bin/env bash
# .platform/hooks/postdeploy/00_get_certificate.sh
sudo certbot -n -d project-allenrs.is404.net --nginx --agree-tos --email allenschultz05@gmail.com