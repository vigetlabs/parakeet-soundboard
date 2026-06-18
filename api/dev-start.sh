#!/usr/bin/env bash
set -e
rm -f tmp/pids/server.pid

bundle install
# use for personal preference
bin/rails db:prepare
bin/rails server -b 0.0.0.0 -p 8000
