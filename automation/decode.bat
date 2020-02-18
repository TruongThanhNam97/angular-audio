echo "" > decode.txt
FOR /D %%i in ("modified\*") DO (
    for %%f in ("%%i\*.*") DO (
         py decode.py "%%f" >> decode.txt
    )
)