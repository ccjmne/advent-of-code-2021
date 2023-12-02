#! /bin/sh

cd "${0%/*}/.." # see https://stackoverflow.com/a/6393573

alias trim="sed -e 's/^[[:space:]]*//g' -e 's/[[:space:]]*\$//g'"
YEAR=`date +%Y`
DAY=`date +%_d | trim`

mkdir -p "src/$YEAR/$DAY"

FORCE=0
while getopts f opt
do
  case "$opt" in
  f) FORCE=1;;
  ?) echo >&2 "Usage: $0 [-f]"
    exit 1;;
  esac
done

if [ ! -f "src/$YEAR/$DAY/input" ] || [ $FORCE -eq 1 ]; then
  curl --silent -b session=`cat tools/.session` "https://adventofcode.com/$YEAR/day/$DAY/input" > "src/$YEAR/$DAY/input"
fi

if [ ! -f "src/$YEAR/$DAY/$DAY.ts" ]; then
  cat > "src/$YEAR/$DAY/$DAY.ts" <<EOF
import solution from 'src/solution-module'

export default solution({
  parse(data: string) {
    return data
      .trim()
      .split(/\n/g)
  },

  partI(input) {
    // TODO: impl
  },

  partII(input) {
    // TODO: impl
  },
})
EOF
fi
