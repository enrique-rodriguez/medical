from core.utils.bus import Bus
from core import (
    provider,
    appointment,
)

packages = (
    provider, 
    appointment,
)


query_bus, command_bus = Bus(), Bus()

for pkg in packages:
    if hasattr(pkg, "commands"):
        command_bus.register_many(pkg.commands)
    if hasattr(pkg, "queries"):
        query_bus.register_many(pkg.queries)