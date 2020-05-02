#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PIDPATH="$DIR/.pid.lock"

# Stop any running process
echo ":: Stopping any running processes"
$DIR/stop.sh

# Start new process
echo ":: Starting new process"
pushd "$DIR/.." > /dev/null
nohup node dist/index.js > /dev/null 2>&1 &
popd > /dev/null

# Store PID
echo ":: Storing PID '$!' into $PIDPATH"
echo $! > "$PIDPATH"

exit 0
