#!/bin/zsh
# User-launched local preview; never stops another server or changes the default layout.
cd -- "${0:A:h:h}" || exit 1
exec node devshell/serve.mjs --host 127.0.0.1 --port 8034 --offline
