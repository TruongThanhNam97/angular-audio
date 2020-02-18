FOR %%i in ("Original\*") DO (
    py encode.py "%%i" >> encode.txt
)