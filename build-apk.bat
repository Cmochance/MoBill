@echo off
chcp 65001 >nul
setlocal

set "JAVA_HOME=%~dp0tools\jdk21.0.11_10"
set "ANDROID_HOME=%~dp0tools\android-sdk"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo [1/1] 正在构建 Android Debug APK...
cd /d "%~dp0android"
call gradlew.bat assembleDebug

if %ERRORLEVEL% == 0 (
    echo.
    echo ============================================
    echo  构建成功！
    echo  APK 路径: android\app\build\outputs\apk\debug\app-debug.apk
    echo ============================================
) else (
    echo.
    echo 构建失败，请查看上方错误信息。
)

pause
