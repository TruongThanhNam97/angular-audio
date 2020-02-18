'' > SNR.txt
FOR %%i in (Original\*) DO (
    py SNR.py "%%i" >> SNR.txt
)