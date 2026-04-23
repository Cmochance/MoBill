@echo off
chcp 65001 >nul
setlocal

set "JAVA_HOME=%~dp0tools\jdk21.0.11_10"
set "ANDROID_HOME=%~dp0tools\android-sdk"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo [1/3] 正在构建网站...
cd /d "%~dp0"
call npm run build
if %ERRORLEVEL% neq 0 goto ERROR

echo [2/3] 正在同步到 Android 项目...
call npm run sync:android
if %ERRORLEVEL% neq 0 goto ERROR

echo [3/3] 正在构建 Android Release APK...
cd /d "%~dp0android"
call gradlew.bat assembleRelease
if %ERRORLEVEL% neq 0 goto ERROR

echo.
echo ============================================
echo  Release 构建成功！
echo  APK 路径: android\app\build\outputs\apk\release\app-release.apk
echo ============================================
goto END

:ERROR
echo.
echo 构建失败，请查看上方错误信息。

:END
pause
