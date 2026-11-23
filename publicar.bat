@echo off
chcp 65001 >nul
cd /d "%~dp0"
set MSG=%*
if "%MSG%"=="" set MSG=Atualizacao %date% %time:~0,5%
echo === 1/3 Testando o build ===
call npm run build || goto erro
echo === 2/3 Enviando para o GitHub ===
git add -A
git commit -m "%MSG%"
git push || goto erro
echo === 3/3 Publicando no Firebase (site + regras do Firestore) ===
call npx firebase deploy --only hosting,firestore:rules --non-interactive || goto erro
echo.
echo PRONTO! GitHub e Firebase atualizados.
pause
exit /b 0
:erro
echo.
echo ERRO - veja a mensagem acima.
pause
exit /b 1
