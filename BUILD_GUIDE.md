# 构建与部署指南

本文档记录如何将本网站项目打包为 Android APK，以及签名配置的本地准备方式。仓库只保存源码、构建脚本和示例配置，不保存本机工具链、签名密钥或 APK 产物。

---

## 技术方案

本项目使用 **Capacitor** 将 Next.js 静态网站封装为原生 Android 应用：

- **前端框架**: Next.js（静态导出 `output: 'export'`）
- **移动端封装**: Capacitor
- **构建工具**: Gradle 8.14
- **Android 编译版本**: API 36
- **最低支持版本**: API 24（Android 7.0）

---

## 构建环境

构建脚本默认读取项目目录下的 `tools/` 工具链。`tools/` 是本机目录，不进入 Git 仓库；新机器可以选择按脚本约定准备该目录，也可以改用本机已安装的 JDK 和 Android SDK。

| 工具 | 路径 | 版本 |
|------|------|------|
| JDK | `tools/jdk21.0.11_10/` 或本机 JDK | 21 LTS |
| Android SDK | `tools/android-sdk/` 或本机 Android SDK | API 36 + Build-Tools 36.0.0 |
| Gradle | Android 工程 Gradle Wrapper 或用户目录缓存 | 8.x |

---

## 快捷脚本

项目根目录提供以下批处理脚本，双击即可运行：

| 脚本 | 用途 |
|------|------|
| `build-full.bat` | 完整流程：构建网站 → 同步到 Android → 生成 **Debug APK** |
| `build-apk.bat` | 快速生成 **Debug APK**（网站内容未修改时使用） |
| `build-release.bat` | 完整流程：构建网站 → 同步到 Android → 生成 **签名 Release APK** |

---

## Debug APK 打包

Debug 版本用于日常测试和本地安装，无需签名：

```bash
# 方式1：一键脚本
cd 项目根目录
build-apk.bat

# 方式2：手动命令
cd android
set JAVA_HOME=%CD%/../tools/jdk21.0.11_10
set ANDROID_HOME=%CD%/../tools/android-sdk
set PATH=%JAVA_HOME%\bin;%PATH%
gradlew.bat assembleDebug
```

**输出路径**: `android/app/build/outputs/apk/debug/app-debug.apk`（约 4.5 MB）

---

## Release APK 打包（本地签名）

Release 版本为正式发布版本，需要在本机准备签名密钥和本地签名配置。真实密钥、口令和 `keystore.properties` 不进入 Git 仓库。

### 本地签名文件

需要在本机准备以下文件：

| 文件 | 是否入库 | 说明 |
|------|----------|------|
| `android/release.keystore` | 否 | Android 应用签名密钥，只保存在安全位置 |
| `android/app/keystore.properties` | 否 | 本机签名配置，保存密钥路径、别名和口令 |
| `android/app/keystore.properties.example` | 是 | 示例模板，不包含真实口令 |

签名配置位于 `android/app/build.gradle` 的 `signingConfigs.release` 块中，通过读取 `android/app/keystore.properties` 文件自动加载密钥信息。

示例配置：

```properties
storeFile=../release.keystore
storePassword=CHANGE_ME
keyAlias=CHANGE_ME
keyPassword=CHANGE_ME
```

首次配置时，可以复制示例文件：

```bash
cp android/app/keystore.properties.example android/app/keystore.properties
```

然后在本机编辑 `android/app/keystore.properties`，填入真实值。不要把真实签名配置提交到仓库。

### 构建命令

```bash
# 方式1：一键脚本
cd 项目根目录
build-release.bat

# 方式2：手动命令
cd android
set JAVA_HOME=%CD%/../tools/jdk21.0.11_10
set ANDROID_HOME=%CD%/../tools/android-sdk
set PATH=%JAVA_HOME%\bin;%PATH%
gradlew.bat assembleRelease
```

**输出路径**: `android/app/build/outputs/apk/release/app-release.apk`（约 3.5 MB）

---

## 安装到手机

### 通过 ADB 命令安装

```bash
cd 项目根目录
set ANDROID_HOME=%CD%\tools\android-sdk
%ANDROID_HOME%\platform-tools\adb install android\app\build\outputs\apk\debug\app-debug.apk
```

### 通过文件传输安装

1. 将 APK 文件复制到手机存储
2. 在手机上找到 APK 文件并点击安装
3. 如遇提示，请允许"安装未知来源应用"权限

### 前提条件

- 开启手机**开发者模式**
- 开启**USB 调试**（通过 ADB 安装时需要）

---

## 重要安全提醒

`android/release.keystore` 是应用的**唯一签名凭证**。

- **若丢失**：后续无法以同一应用身份发布更新，必须更换包名重新发布
- **若泄露**：他人可能利用该密钥伪造应用更新包

**请务必将以下文件备份到安全位置（U 盘、加密网盘等）**：

```
android/release.keystore
android/app/keystore.properties
```

---

## 重新构建网站后的更新流程

修改网站代码后，按以下顺序重新打包：

```bash
# 1. 构建静态网站
npm run build

# 2. 同步静态资源到 Android 项目
npm run sync:android

# 3. 构建 APK（Debug 或 Release）
cd android
gradlew.bat assembleDebug
# 或
gradlew.bat assembleRelease
```

或直接使用根目录的 `build-release.bat` 一键完成全部步骤。
