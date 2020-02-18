
FOR /D %%i in ("modified\*") DO (
    for %%f in ("%%i\*.*") DO (
         del "%%f"
    )
)