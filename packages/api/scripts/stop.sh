#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PIDPATH="$DIR/.pid.lock"

# Attempt to kill PID if set
if [ -f "$PIDPATH" ]; then
  echo ":: Running process detected"

  if ps -p `cat $PIDPATH` > /dev/null ; then
    echo ":: Killing process"
    kill `cat $PIDPATH` 2>&1 > /dev/null
  fi

  echo ":: Clearing process lockfile"
  rm "$PIDPATH" > /dev/null
fi

exit 0
