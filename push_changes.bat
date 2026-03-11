@echo off
echo Staging changes...
git add .
echo Committing changes...
git commit -m "NeuroLearn: COGNIX features and fixes implemented"
echo Pushing to origin main...
git push origin main
if %ERRORLEVEL% NEQ 0 (
    echo Push failed with error level %ERRORLEVEL%
) else (
    echo Push successful!
)
